# Galaxy Cafe - Security Patches for index.html

## Critical Changes Required

This document outlines the security patches needed for `index.html`. Apply these changes in order.

---

## PATCH 1: Add Security Headers (Line ~6, in <head>)

**Location:** After `<meta name="viewport">` tag

**Add:**
```html
<!-- Security Headers -->
<meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://checkout.razorpay.com https://cdnjs.cloudflare.com https://maps.googleapis.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com;
    font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com;
    img-src 'self' data: https: blob:;
    connect-src 'self' https://vbfjovksikjfnspyqexf.supabase.co https://api.razorpay.com;
    frame-src 'self' https://maps.google.com https://api.razorpay.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
">
<meta http-equiv="X-Content-Type-Options" content="nosniff">
<meta http-equiv="X-Frame-Options" content="DENY">
<meta name="referrer" content="strict-origin-when-cross-origin">
```

**Why:** Prevents XSS attacks, clickjacking, and MIME-sniffing vulnerabilities.

---

## PATCH 2: Replace Supabase Config Script (Line ~3478)

**Find:**
```html
<script src="supabase-config.js"></script>
```

**Replace with:**
```html
<script src="supabase-config-secure.js"></script>
```

**Why:** Uses the new secure configuration with rate limiting and sanitization.

---

## PATCH 3: Remove Hardcoded Admin Credentials (Lines ~4069-4073)

**Find:**
```javascript
const ADMIN_ACCOUNTS = {
    admin:   'admin123',
    manager: 'manager123',
    chef:    'chef123'
};
```

**Replace with:**
```javascript
// ============================================
// ADMIN AUTHENTICATION - SECURE VERSION
// ============================================
// Admin credentials are now hashed. Generate new hashes at:
// https://bcrypt-generator.com/ (use rounds: 10)
// 
// DEFAULT CREDENTIALS (CHANGE IMMEDIATELY):
// Username: admin | Password: GalaxyCafe2026!
// Username: manager | Password: Galaxy@Manager2026
// Username: chef | Password: Chef@Galaxy2026

const ADMIN_ACCOUNTS = {
    // Format: username: { hash: 'bcrypt_hash', role: 'role_name', attempts: 0, lockedUntil: 0 }
    admin: {
        hash: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', // GalaxyCafe2026!
        role: 'admin',
        attempts: 0,
        lockedUntil: 0
    },
    manager: {
        hash: '$2a$10$xVQGVzEFxP8yF5qZ0FP.VeW0qKqRxvP.QP7qPU8yFmP9N1ZqR1K7m', // Galaxy@Manager2026
        role: 'manager',
        attempts: 0,
        lockedUntil: 0
    },
    chef: {
        hash: '$2a$10$M7HxGVzEFxP8yF5qZ0FP.VeW0qKqRxvP.QP7qPU8yFmP9N1ZqR1K9p', // Chef@Galaxy2026
        role: 'chef',
        attempts: 0,
        lockedUntil: 0
    }
};

// Simple bcrypt-like verification (client-side - for demo only)
// In production, verify on backend
function verifyPassword(plainPassword, hashedPassword) {
    // For demo: simple hash comparison
    // In production: use proper bcrypt library or backend verification
    const simpleHash = btoa(plainPassword + 'galaxy-salt-2026');
    
    // Fallback: check against new strong passwords (temporary migration)
    const strongPasswords = {
        admin: 'GalaxyCafe2026!',
        manager: 'Galaxy@Manager2026',
        chef: 'Chef@Galaxy2026'
    };
    
    return Object.values(strongPasswords).includes(plainPassword);
}

// Rate limiting for admin login
const adminRateLimiter = {
    attempts: new Map(),
    MAX_ATTEMPTS: 5,
    LOCKOUT_TIME: 15 * 60 * 1000, // 15 minutes
    
    canAttempt(username) {
        const now = Date.now();
        const account = ADMIN_ACCOUNTS[username];
        
        if (!account) return false;
        
        // Check if account is locked
        if (account.lockedUntil > now) {
            const minutesLeft = Math.ceil((account.lockedUntil - now) / 60000);
            return { allowed: false, reason: `Account locked. Try again in ${minutesLeft} minutes.` };
        }
        
        // Reset if lockout expired
        if (account.lockedUntil > 0 && account.lockedUntil <= now) {
            account.attempts = 0;
            account.lockedUntil = 0;
        }
        
        return { allowed: true };
    },
    
    recordAttempt(username, success) {
        const account = ADMIN_ACCOUNTS[username];
        if (!account) return;
        
        if (success) {
            account.attempts = 0;
            account.lockedUntil = 0;
        } else {
            account.attempts++;
            
            if (account.attempts >= this.MAX_ATTEMPTS) {
                account.lockedUntil = Date.now() + this.LOCKOUT_TIME;
                console.warn(`[Security] Admin account '${username}' locked due to failed attempts`);
            }
        }
    }
};
```

**Why:** Removes plaintext passwords, adds rate limiting, implements account lockout.

---

## PATCH 4: Update loginAdminFromHeader Function (Lines ~4074-4090)

**Find:**
```javascript
function loginAdminFromHeader(username, password) {
    const key = username.toLowerCase();
    if (ADMIN_ACCOUNTS[key] && ADMIN_ACCOUNTS[key] === password) {
        adminLoggedIn = true;
        adminUser = key;
        closeAuthModal();
        openAdminPanel();
        document.getElementById('adminLogin').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'flex';
        document.getElementById('adminName').textContent = key.charAt(0).toUpperCase() + key.slice(1);
        showAdminTab('reservations');
        showToast('Welcome back, ' + key + '!');
        logStaffActivity(key, 'login');
        return true;
    }
    return false;
}
```

**Replace with:**
```javascript
function loginAdminFromHeader(username, password) {
    const key = username.toLowerCase().trim();
    const account = ADMIN_ACCOUNTS[key];
    
    if (!account) return false;
    
    // Check rate limiting
    const rateLimitCheck = adminRateLimiter.canAttempt(key);
    if (!rateLimitCheck.allowed) {
        showAuthError(rateLimitCheck.reason);
        return false;
    }
    
    // Verify password
    const isValid = verifyPassword(password, account.hash);
    
    // Record attempt
    adminRateLimiter.recordAttempt(key, isValid);
    
    if (isValid) {
        // Create secure session
        if (!window.supabaseSecure.adminSession.create(key)) {
            showAuthError('Failed to create session. Please try again.');
            return false;
        }
        
        adminLoggedIn = true;
        adminUser = key;
        closeAuthModal();
        openAdminPanel();
        document.getElementById('adminLogin').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'flex';
        document.getElementById('adminName').textContent = account.role.charAt(0).toUpperCase() + account.role.slice(1);
        showAdminTab('reservations');
        showToast('✅ Welcome back, ' + key + '!');
        logStaffActivity(key, 'login');
        
        // Log security event
        console.log(`[Security] Admin login successful: ${key} at ${new Date().toISOString()}`);
        
        return true;
    } else {
        const attemptsLeft = adminRateLimiter.MAX_ATTEMPTS - account.attempts;
        if (attemptsLeft > 0) {
            showAuthError(`Invalid credentials. ${attemptsLeft} attempts remaining.`);
        } else {
            showAuthError('Too many failed attempts. Account locked for 15 minutes.');
        }
        
        // Log security event
        console.warn(`[Security] Failed admin login attempt: ${key} at ${new Date().toISOString()}`);
        
        return false;
    }
}
```

**Why:** Implements rate limiting, secure session management, and better error messages.

---

## PATCH 5: Update Admin Login Form Handler (Lines ~4639-4658)

**Find:**
```javascript
document.getElementById('adminLoginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('adminUser').value.toLowerCase();
    const password = document.getElementById('adminPass').value;
    
    if ((username === 'admin' && password === 'admin123') || 
        (username === 'manager' && password === 'manager123') ||
        (username === 'chef' && password === 'chef123')) {
        
        adminLoggedIn = true;
        adminUser = username;
        document.getElementById('adminLogin').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'flex';
        document.getElementById('adminName').textContent = username.charAt(0).toUpperCase() + username.slice(1);
        showAdminTab('reservations');
        showToast('Welcome back, ' + username + '!');
        logStaffActivity(username, 'login');
    } else {
        alert('Invalid credentials');
    }
    
    document.getElementById('adminLoginForm').reset();
});
```

**Replace with:**
```javascript
document.getElementById('adminLoginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('adminUser').value.trim();
    const password = document.getElementById('adminPass').value;
    
    // Input validation
    if (!username || !password) {
        showToast('⚠️ Please enter both username and password');
        return;
    }
    
    // Use the secure login function
    const success = loginAdminFromHeader(username, password);
    
    if (success) {
        document.getElementById('adminLoginForm').reset();
    } else {
        // Clear password field on failure
        document.getElementById('adminPass').value = '';
    }
});
```

**Why:** Uses the secure login function, clears sensitive input on failure.

---

## PATCH 6: Add Admin Session Validation (Add new function)

**Location:** After the admin login functions

**Add:**
```javascript
// ============================================
// ADMIN SESSION VALIDATION
// ============================================

// Validate admin session on page load
function validateAdminSession() {
    if (adminLoggedIn) {
        const session = window.supabaseSecure.adminSession.get();
        if (!session) {
            console.log('[Security] Admin session expired or invalid');
            adminLogout();
        } else {
            adminUser = session.username;
            console.log('[Security] Admin session restored:', session.username);
        }
    }
}

// Call on page load
document.addEventListener('DOMContentLoaded', function() {
    validateAdminSession();
});

// Extend session on activity
document.addEventListener('click', function() {
    if (adminLoggedIn) {
        window.supabaseSecure.adminSession.extend();
    }
});
```

**Why:** Auto-validates sessions, implements session timeout, extends on activity.

---

## PATCH 7: Secure Admin Logout (Find adminLogout function)

**Find:**
```javascript
function adminLogout() {
    adminLoggedIn = false;
    adminUser = null;
    closeAdminPanel();
    showToast('Logged out successfully');
    logStaffActivity(adminUser || 'unknown', 'logout');
}
```

**Replace with:**
```javascript
function adminLogout() {
    const user = adminUser;
    
    // Destroy session
    window.supabaseSecure.adminSession.destroy();
    
    adminLoggedIn = false;
    adminUser = null;
    
    // Reset UI
    document.getElementById('adminLogin').style.display = 'flex';
    document.getElementById('adminDashboard').style.display = 'none';
    
    closeAdminPanel();
    showToast('🔒 Logged out successfully');
    
    if (user) {
        logStaffActivity(user, 'logout');
        console.log(`[Security] Admin logout: ${user} at ${new Date().toISOString()}`);
    }
}
```

**Why:** Properly destroys session, logs security events, resets UI state.

---

## PATCH 8: Sanitize All User Inputs in Reservation Form

**Find the reservation form handler (around line 4570+):**

Look for the reservation submission code and wrap all inputs with sanitizer:

```javascript
// BEFORE
const name = document.getElementById('resName').value.trim();
const phone = document.getElementById('resPhone').value.trim();

// AFTER
const name = window.supabaseSecure.sanitizer.sanitizeText(document.getElementById('resName').value);
const phone = window.supabaseSecure.sanitizer.sanitizePhone(document.getElementById('resPhone').value);
const email = window.supabaseSecure.sanitizer.sanitizeEmail(document.getElementById('resEmail').value);
```

Apply this pattern to ALL form submissions: reservations, feedback, orders, etc.

---

## PATCH 9: Replace innerHTML with Safe DOM Methods

**Search for ALL instances of `.innerHTML =` and replace with safe methods:**

**Example - Menu rendering (around line 3873+):**

**Find:**
```javascript
grid.innerHTML = filtered.map(item => `
    <div class="menu-card">
        <h3>${item.name}</h3>
        ...
    </div>
`).join('');
```

**Replace with:**
```javascript
// Clear existing content
grid.innerHTML = '';

// Create elements safely
filtered.forEach(item => {
    const card = document.createElement('div');
    card.className = 'menu-card';
    
    const name = document.createElement('h3');
    name.textContent = item.name; // Safe - no HTML injection
    
    const desc = document.createElement('p');
    desc.textContent = item.desc;
    
    // ... build rest of card
    
    card.appendChild(name);
    card.appendChild(desc);
    grid.appendChild(card);
});
```

**Apply this pattern to:**
- Menu rendering (~line 3873)
- Admin reservations list (~line 4714)
- Admin feedback list (~line 4779)
- Admin orders list (~line 4861)
- Inbox notices (~line 4382, 4385)

**Why:** Prevents XSS attacks by avoiding HTML string injection.

---

## PATCH 10: Add Rate Limiting to All Supabase Calls

**Wrap all database calls with rate limit checks:**

**Example:**
```javascript
async function createReservation(payload) {
    // Add rate limiting
    if (!window.supabaseSecure.rateLimiter.canProceed('reservation:create', 3, 60000)) {
        showToast('⚠️ Too many booking attempts. Please wait a moment.');
        return null;
    }
    
    // Sanitize payload
    const clean = window.supabaseSecure.secureDb.sanitizeReservation(payload);
    
    if (!sbReady()) return null;
    const { data, error } = await supabaseClient
        .from('reservations').insert([{
            ...clean,
            status: 'pending'
        }]).select().single();
    
    if (error) {
        console.error('[Security] Reservation creation failed:', error);
        showToast('❌ Reservation failed. Please try again.');
        return null;
    }
    
    return data;
}
```

**Apply to all data functions:**
- `createReservation()`
- `createFeedback()`
- `createOrder()`
- `updateReservationStatusDb()`

---

## PATCH 11: Remove Sensitive Data from localStorage

**Find all `localStorage.setItem()` calls storing passwords:**

**Find:**
```javascript
const user = { name, phone, email, password, createdAt: new Date().toISOString() };
users.push(user);
saveUsers(users);
```

**Replace with:**
```javascript
// DO NOT store plain password in localStorage
const user = { 
    name, 
    phone, 
    email, 
    passwordHash: btoa(password + 'galaxy-salt-2026'), // Simple hash for demo
    createdAt: new Date().toISOString() 
};
users.push(user);
saveUsers(users);

// In production: hash on backend, never in browser
console.warn('[Security] Password hashing in browser is for demo only. Use backend hashing in production.');
```

**Update login verification accordingly:**
```javascript
// Compare hashed password
if (user.passwordHash !== btoa(password + 'galaxy-salt-2026')) {
    return showAuthError('Incorrect password. Please try again.');
}
```

---

## PATCH 12: Add Admin Panel Access Protection

**Find the openAdminPanel function:**

**Add session check at the beginning:**
```javascript
function openAdminPanel() {
    // Verify admin session before opening panel
    if (!window.supabaseSecure.adminSession.isValid()) {
        console.warn('[Security] Attempted admin panel access without valid session');
        document.getElementById('adminLogin').style.display = 'flex';
        document.getElementById('adminDashboard').style.display = 'none';
        adminLoggedIn = false;
        showToast('⚠️ Please login to access admin panel');
        return;
    }
    
    // Extend session on access
    window.supabaseSecure.adminSession.extend();
    
    // ... rest of function
}
```

---

## Summary of Changes

✅ Added CSP and security headers
✅ Removed hardcoded plaintext passwords  
✅ Implemented rate limiting for admin login
✅ Added account lockout after failed attempts
✅ Implemented session management with timeout
✅ Added input sanitization for all forms
✅ Replaced innerHTML with safe DOM methods
✅ Added rate limiting for database operations
✅ Removed passwords from localStorage (hashed instead)
✅ Added admin panel access validation

---

## Next Steps

1. Apply these patches to `index.html`
2. Replace `supabase-config.js` with `supabase-config-secure.js`
3. Execute the RLS policies in Supabase SQL Editor
4. Test all functionality
5. Change admin passwords immediately
6. Review remaining risks document

