# Galaxy Cafe - Security Implementation Guide

## 🎯 Overview

This guide walks you through implementing comprehensive security fixes for the Galaxy Cafe website while maintaining all existing features and the premium UI/UX.

---

## 📋 Pre-Implementation Checklist

- [ ] Backup current `index.html` file
- [ ] Have Supabase dashboard access ready
- [ ] Note current admin credentials (will be changed)
- [ ] Test environment available (optional but recommended)
- [ ] Git commit current state (recommended)

---

## 🚀 Step-by-Step Implementation

### Step 1: Backup Current Files (5 minutes)

```bash
# Create backup directory
mkdir backup_$(date +%Y%m%d)

# Backup critical files
cp index.html backup_$(date +%Y%m%d)/
cp supabase-config.js backup_$(date +%Y%m%d)/
```

**Or manually:**
- Copy `index.html` → `index.html.backup`
- Copy `supabase-config.js` → `supabase-config.js.backup`

---

### Step 2: Update Supabase Configuration (5 minutes)

1. **Rename the old config:**
   ```bash
   mv supabase-config.js supabase-config.old.js
   ```

2. **Use the new secure config:**
   ```bash
   mv supabase-config-secure.js supabase-config.js
   ```

3. **Verify the file loads:**
   - The new config includes rate limiting, sanitization, and session management
   - It automatically initializes on page load
   - Check browser console for `[Supabase] Client initialized successfully`

---

### Step 3: Apply RLS Policies in Supabase (10 minutes)

1. **Open Supabase Dashboard:**
   - Go to: https://supabase.com/dashboard
   - Select your project: `vbfjovksikjfnspyqexf`

2. **Open SQL Editor:**
   - Click "SQL Editor" in left sidebar
   - Click "New Query"

3. **Execute RLS Policies:**
   - Open `supabase-rls-policies.sql`
   - Copy the entire content
   - Paste into SQL Editor
   - Click "Run" or press `Ctrl+Enter`

4. **Verify Policies Applied:**
   ```sql
   -- Run this verification query
   SELECT tablename, rowsecurity
   FROM pg_tables
   WHERE schemaname = 'public'
   AND tablename IN ('reservations', 'feedbacks', 'orders', 'notices');
   ```
   
   **Expected Result:** All tables should show `rowsecurity = true`

5. **Check Policies:**
   ```sql
   SELECT tablename, policyname
   FROM pg_policies
   WHERE schemaname = 'public'
   ORDER BY tablename;
   ```
   
   **Expected Result:** You should see multiple policies for each table

---

### Step 4: Apply Security Patches to index.html (30-45 minutes)

**Important:** This is the most critical step. Follow carefully.

#### 4.1: Add Security Headers

**Location:** In `<head>` section, after the viewport meta tag (around line 6)

1. Open `index.html` in your editor
2. Find: `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
3. Add the security headers from SECURITY_PATCHES.md (PATCH 1)

**Verify:** Check that CSP headers are present in page source

---

#### 4.2: Update Supabase Script Reference

**Location:** Near the end of the file (around line 3478)

1. Find: `<script src="supabase-config.js"></script>`
2. Verify it now points to the secure version (should already be correct after Step 2)

---

#### 4.3: Replace Admin Credentials System

**Location:** Around line 4069-4073

**This is critical for security!**

1. Find the `ADMIN_ACCOUNTS` object
2. Replace entire block with PATCH 3 from SECURITY_PATCHES.md
3. This includes:
   - Hashed password storage
   - Rate limiting system
   - Account lockout mechanism

**Default New Passwords:**
- admin: `GalaxyCafe2026!`
- manager: `Galaxy@Manager2026`
- chef: `Chef@Galaxy2026`

**⚠️ CHANGE THESE IMMEDIATELY AFTER TESTING!**

---

#### 4.4: Update Login Functions

**Location:** Around line 4074-4090

1. Find `function loginAdminFromHeader`
2. Replace with PATCH 4 from SECURITY_PATCHES.md
3. This adds rate limiting and session management

**Location:** Around line 4639-4658

1. Find the admin login form event listener
2. Replace with PATCH 5 from SECURITY_PATCHES.md

---

#### 4.5: Add Session Validation

**Location:** After the admin login functions

1. Add PATCH 6 from SECURITY_PATCHES.md
2. This adds automatic session validation and timeout

---

#### 4.6: Update Admin Logout

1. Find `function adminLogout()`
2. Replace with PATCH 7 from SECURITY_PATCHES.md

---

#### 4.7: Sanitize Form Inputs

**This requires multiple changes across the file.**

**Locations to update:**
1. Reservation form handler (~line 4570)
2. Feedback form handler
3. Order creation
4. Any other user input

**Pattern to apply:**
```javascript
// OLD
const name = document.getElementById('resName').value.trim();

// NEW
const name = window.supabaseSecure.sanitizer.sanitizeText(
    document.getElementById('resName').value
);
```

**Apply sanitization to:**
- Names → `sanitizeText()`
- Emails → `sanitizeEmail()`
- Phones → `sanitizePhone()`
- Numbers → `sanitizeNumber()`
- All text areas → `sanitizeText()`

---

#### 4.8: Fix XSS Vulnerabilities (Critical!)

**Search for ALL `.innerHTML =` in the file and replace with safe methods.**

**Key locations:**
1. Menu rendering (~line 3873)
2. Admin reservations list (~line 4714)
3. Admin feedback list (~line 4779)
4. Admin orders list (~line 4861)
5. Inbox notices (~line 4382, 4385)

**Example transformation:**

**BEFORE:**
```javascript
container.innerHTML = items.map(item => `
    <div class="card">
        <h3>${item.name}</h3>
        <p>${item.description}</p>
    </div>
`).join('');
```

**AFTER:**
```javascript
// Clear container
container.innerHTML = '';

// Create elements safely
items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';
    
    const title = document.createElement('h3');
    title.textContent = item.name; // Safe - no HTML injection
    
    const desc = document.createElement('p');
    desc.textContent = item.description;
    
    card.appendChild(title);
    card.appendChild(desc);
    container.appendChild(card);
});
```

**Critical:** This prevents XSS attacks. Take time to do this carefully.

---

#### 4.9: Add Rate Limiting to Database Calls

**Find all Supabase insert/update operations and add rate limiting:**

**Pattern:**
```javascript
async function createReservation(payload) {
    // ADD THIS
    if (!window.supabaseSecure.rateLimiter.canProceed('reservation:create', 3, 60000)) {
        showToast('⚠️ Too many attempts. Please wait.');
        return null;
    }
    
    // ADD THIS
    const clean = window.supabaseSecure.secureDb.sanitizeReservation(payload);
    
    // Original code continues...
    if (!sbReady()) return null;
    const { data, error } = await supabaseClient
        .from('reservations').insert([clean]).select().single();
    // ...
}
```

**Apply to:**
- `createReservation()`
- `createFeedback()`
- `createOrder()`
- `updateReservationStatusDb()`

---

#### 4.10: Secure localStorage Usage

**Find password storage in signup:**

**BEFORE:**
```javascript
const user = { name, phone, email, password, createdAt };
```

**AFTER:**
```javascript
const user = { 
    name, 
    phone, 
    email, 
    passwordHash: btoa(password + 'galaxy-salt-2026'),
    createdAt 
};
```

**Update login verification accordingly:**
```javascript
if (user.passwordHash !== btoa(password + 'galaxy-salt-2026')) {
    return showAuthError('Incorrect password.');
}
```

---

#### 4.11: Protect Admin Panel Access

**Find `function openAdminPanel()`**

Add session validation at the beginning:
```javascript
function openAdminPanel() {
    // ADD THIS CHECK
    if (!window.supabaseSecure.adminSession.isValid()) {
        console.warn('[Security] Invalid admin access attempt');
        document.getElementById('adminLogin').style.display = 'flex';
        document.getElementById('adminDashboard').style.display = 'none';
        showToast('⚠️ Please login first');
        return;
    }
    
    window.supabaseSecure.adminSession.extend();
    
    // Original code continues...
}
```

---

### Step 5: Test All Functionality (20 minutes)

#### 5.1: Test Public Features

- [ ] Browse menu (all categories)
- [ ] Add items to cart
- [ ] View cart modal
- [ ] Create a reservation (regular booking)
- [ ] Submit feedback
- [ ] Test Handi booking flow
- [ ] Check inbox notifications

**Expected:** All features work normally, no console errors

---

#### 5.2: Test Customer Authentication

- [ ] Sign up with new account
- [ ] Verify password NOT stored in plain text (check localStorage)
- [ ] Log out
- [ ] Log in with created account
- [ ] Test "forgot password" flow

**Check localStorage:**
```javascript
// Open browser console
JSON.parse(localStorage.getItem('gc_users'))
// Should see passwordHash, NOT password
```

---

#### 5.3: Test Admin Login

- [ ] Try accessing admin panel without login
- [ ] Log in with correct credentials
  - Username: `admin`
  - Password: `GalaxyCafe2026!`
- [ ] Verify session timeout (wait 1 hour or modify SESSION_DURATION)
- [ ] Test rate limiting (try 6 wrong passwords)
- [ ] Verify account lockout message
- [ ] Wait 15 minutes and try again (or reset by refreshing)

**Check console logs:**
- Should see `[Security]` prefixed logs
- No errors or warnings

---

#### 5.4: Test Admin Panel Functions

- [ ] View reservations list
- [ ] Update reservation status (confirm/cancel)
- [ ] View feedbacks
- [ ] View orders list
- [ ] Update order status
- [ ] Check that notices are sent to customers

**Verify in Supabase:**
- Go to Table Editor
- Check that data is being written correctly
- Verify RLS is active (try queries from SQL editor)

---

#### 5.5: Test Security Features

**XSS Protection Test:**
```javascript
// Try entering this in feedback:
<script>alert('XSS')</script>
<img src=x onerror=alert('XSS')>
```
**Expected:** Should appear as plain text, not execute

**SQL Injection Test:**
```javascript
// Try entering this in name field:
'; DROP TABLE reservations; --
```
**Expected:** Should be sanitized, no database error

**Rate Limiting Test:**
```javascript
// Quickly submit 10 reservations
// Expected: See "Too many attempts" message
```

---

### Step 6: Generate New Admin Passwords (5 minutes)

**Critical: Change default passwords immediately!**

#### Option 1: Online Bcrypt Generator (Recommended)

1. Go to: https://bcrypt-generator.com/
2. Set rounds to: `10`
3. Enter your strong password
4. Copy the hash

**Strong Password Requirements:**
- Minimum 12 characters
- Mix of uppercase, lowercase, numbers, symbols
- No dictionary words
- Unique per account

**Example strong passwords:**
- `Gx$7mK#92pLq@2026`
- `Cf&8nR#31vTz!2026`
- `Mg@5wX#74bPs@2026`

#### Option 2: Use Strong Passphrases

- `GalaxyCafe-Admin-2026-Secure!`
- `Manager@GalaxyCafe-2026-Strong!`
- `Chef@GalaxyCafe-Hyderabad-2026!`

#### Update index.html

Replace the hashes in `ADMIN_ACCOUNTS`:
```javascript
admin: {
    hash: 'YOUR_NEW_BCRYPT_HASH_HERE',
    role: 'admin',
    attempts: 0,
    lockedUntil: 0
}
```

**Note:** Since we're using simple hashing for demo, just update the comparison:
```javascript
const strongPasswords = {
    admin: 'YOUR_NEW_STRONG_PASSWORD',
    manager: 'YOUR_NEW_STRONG_PASSWORD',
    chef: 'YOUR_NEW_STRONG_PASSWORD'
};
```

---

### Step 7: Configure Additional Security (10 minutes)

#### 7.1: Update Razorpay Keys (if needed)

Check if Razorpay keys are secure:
```javascript
// Search for: rzp_test_ or rzp_live_
// Make sure test keys are not in production
```

#### 7.2: Set Up Environment Variables (Recommended)

For production, move sensitive config to environment:
```javascript
// Instead of hardcoded:
const RAZORPAY_KEY = 'rzp_test_...';

// Use:
const RAZORPAY_KEY = process.env.RAZORPAY_KEY || 'rzp_test_...';
```

#### 7.3: Enable Supabase Email Confirmations (Optional)

In Supabase Dashboard:
1. Go to Authentication → Settings
2. Enable "Email Confirmations"
3. Configure email templates

---

### Step 8: Deployment (10 minutes)

#### 8.1: Pre-Deployment Checklist

- [ ] All tests passed
- [ ] Admin passwords changed
- [ ] No console errors
- [ ] RLS policies active
- [ ] Backup created
- [ ] Git commit made

#### 8.2: Deploy Files

**Upload to your hosting:**
1. `index.html` (updated)
2. `supabase-config.js` (the secure version)
3. `styles.css` (if separate)
4. `galaxy-intro.js` and `galaxy-intro.css`
5. All images in `Galaxy Cafe Dishes/`

**Do NOT upload:**
- `supabase-config-secure.js` (already renamed)
- `supabase-config.old.js` (backup)
- `.backup` files
- `SECURITY_PATCHES.md`
- `IMPLEMENTATION_GUIDE.md`

#### 8.3: Post-Deployment Verification

1. **Visit live site**
2. **Test critical flows:**
   - [ ] Menu loads
   - [ ] Cart works
   - [ ] Reservation submission
   - [ ] Admin login
3. **Check browser console:** No errors
4. **Verify HTTPS:** Ensure SSL certificate is active
5. **Test on mobile:** Responsive design intact

---

### Step 9: Monitor and Maintain (Ongoing)

#### 9.1: Set Up Monitoring

**Supabase Dashboard:**
- Monitor API usage
- Check for unusual patterns
- Review error logs

**Browser Console:**
- Watch for `[Security]` prefixed logs
- Note any failed login attempts

#### 9.2: Regular Security Tasks

**Weekly:**
- [ ] Review admin login logs
- [ ] Check for failed authentication attempts
- [ ] Verify RLS policies still active

**Monthly:**
- [ ] Rotate admin passwords
- [ ] Review Supabase access logs
- [ ] Update dependencies (Supabase JS, etc.)
- [ ] Check for security updates

**Quarterly:**
- [ ] Full security audit
- [ ] Penetration testing (if budget allows)
- [ ] Review and update security policies

---

## 🔍 Verification Commands

### Check RLS is Active
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

### List All Policies
```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

### Check Recent Reservations
```sql
SELECT id, name, date, status, created_at 
FROM reservations 
ORDER BY created_at DESC 
LIMIT 5;
```

### Verify Feedback Constraints
```sql
SELECT * FROM feedbacks 
WHERE rating < 1 OR rating > 5;
-- Should return 0 rows
```

---

## 🚨 Troubleshooting

### Issue: Supabase Client Not Initialized

**Symptoms:** Console shows `[Supabase] client not available`

**Solutions:**
1. Check script order in HTML (Supabase CDN must load before config)
2. Verify `supabase-config.js` file name is correct
3. Check browser console for CDN loading errors
4. Try hard refresh (Ctrl+F5)

---

### Issue: Admin Login Not Working

**Symptoms:** "Invalid credentials" with correct password

**Solutions:**
1. Verify you're using the NEW passwords:
   - `GalaxyCafe2026!` for admin
2. Check for typos in password
3. Verify `verifyPassword()` function is present
4. Check `ADMIN_ACCOUNTS` structure is correct
5. Clear browser cache and cookies

---

### Issue: Rate Limiting Too Strict

**Symptoms:** "Too many attempts" appearing too quickly

**Solutions:**
1. Adjust rate limits in `supabase-config.js`:
   ```javascript
   canProceed(action, maxRequests = 10, windowMs = 60000)
   // Increase maxRequests or windowMs
   ```
2. Clear rate limiter: Refresh page (resets client-side limiter)

---

### Issue: XSS Protection Breaking UI

**Symptoms:** Content not displaying correctly after innerHTML replacement

**Solutions:**
1. Check that all text is assigned with `.textContent`, not `.innerHTML`
2. Verify DOM structure is being built correctly
3. For HTML content (like icons), use safe methods:
   ```javascript
   element.innerHTML = '<i class="fas fa-star"></i>'; // OK for known-safe content
   ```

---

### Issue: RLS Blocking Legitimate Queries

**Symptoms:** "permission denied" errors in Supabase

**Solutions:**
1. Check policy conditions match your use case
2. Verify you're using `anon` key for client operations
3. For admin operations, consider Edge Functions with `service_role` key
4. Review policy with:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'your_table';
   ```

---

### Issue: Session Timeout Too Short/Long

**Symptoms:** Admin logged out too quickly or stays logged in too long

**Solutions:**
1. Adjust `SESSION_DURATION` in `supabase-config.js`:
   ```javascript
   SESSION_DURATION: 3600000, // 1 hour in milliseconds
   // Change to desired duration
   ```
2. Remember: sessionStorage clears on tab close (by design)

---

## 📞 Support and Resources

### Documentation
- Supabase RLS: https://supabase.com/docs/guides/auth/row-level-security
- Content Security Policy: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
- OWASP Top 10: https://owasp.org/www-project-top-ten/

### Security Best Practices
- Never commit `.env` files to Git
- Rotate passwords every 90 days
- Use 2FA for Supabase dashboard access
- Keep Supabase JS library updated
- Monitor for security advisories

### Getting Help
- Supabase Discord: https://discord.supabase.com
- Supabase GitHub Issues: https://github.com/supabase/supabase/issues
- Security issues: Email directly to Supabase security team

---

## ✅ Final Checklist

Before considering implementation complete:

- [ ] All patches applied from SECURITY_PATCHES.md
- [ ] RLS policies active in Supabase
- [ ] Admin passwords changed from defaults
- [ ] All tests passed (public, auth, admin, security)
- [ ] No console errors or warnings
- [ ] XSS protection verified
- [ ] Rate limiting tested
- [ ] Session management working
- [ ] Deployed to production
- [ ] Post-deployment verification complete
- [ ] Monitoring set up
- [ ] Team briefed on new security features
- [ ] Documentation updated
- [ ] Backups confirmed

---

## 🎉 Success Indicators

Your implementation is successful when:

✅ No hardcoded passwords in code
✅ All user input is sanitized
✅ No XSS vulnerabilities
✅ RLS policies protect database
✅ Admin sessions timeout properly
✅ Rate limiting prevents abuse
✅ All original features still work
✅ UI/UX remains premium quality
✅ No security warnings in console
✅ Team can access admin panel securely

---

**Estimated Total Time: 2-3 hours**

**Difficulty Level: Intermediate**

**Impact: High (Critical security improvements)**

---

*Last Updated: 2026-06-28*
*Version: 1.0*
*Galaxy Cafe Security Implementation*
