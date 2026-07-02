// ============================================
// GALAXY CAFE - SECURE SUPABASE CONFIGURATION
// ============================================

const SUPABASE_URL = 'https://vbfjovksikjfnspyqexf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZiZmpvdmtzaWtqZm5zcHlxZXhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NjkzNzcsImV4cCI6MjA5ODE0NTM3N30.Sxwp4ifoytciDZNMdbvD0kb1d29niiIkSLzYtakPB_g';

// ============================================
// SECURITY UTILITIES
// ============================================

// Rate limiting for client-side requests (basic protection)
const rateLimiter = {
    requests: new Map(),

    // Check if action is allowed (max 10 requests per 60 seconds per action)
    canProceed(action, maxRequests = 10, windowMs = 60000) {
        const now = Date.now();
        const key = action;

        if (!this.requests.has(key)) {
            this.requests.set(key, []);
        }

        const timestamps = this.requests.get(key).filter(t => now - t < windowMs);

        if (timestamps.length >= maxRequests) {
            return false;
        }

        timestamps.push(now);
        this.requests.set(key, timestamps);
        return true;
    },

    // Clean up old entries periodically
    cleanup() {
        const now = Date.now();
        for (const [key, timestamps] of this.requests.entries()) {
            const filtered = timestamps.filter(t => now - t < 300000); // 5 min
            if (filtered.length === 0) {
                this.requests.delete(key);
            } else {
                this.requests.set(key, filtered);
            }
        }
    }
};

// Run cleanup every 5 minutes
setInterval(() => rateLimiter.cleanup(), 300000);

// ============================================
// INPUT SANITIZATION
// ============================================

const sanitizer = {
    // Remove HTML tags and dangerous characters
    sanitizeText(input) {
        if (typeof input !== 'string') return '';
        return input
            .replace(/[<>]/g, '') // Remove angle brackets
            .replace(/javascript:/gi, '') // Remove javascript: protocol
            .replace(/on\w+=/gi, '') // Remove event handlers
            .trim()
            .slice(0, 1000); // Max length
    },

    // Sanitize email
    sanitizeEmail(email) {
        if (typeof email !== 'string') return '';
        const cleaned = email.toLowerCase().trim().slice(0, 254);
        const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
        return emailRegex.test(cleaned) ? cleaned : '';
    },

    // Sanitize phone number
    sanitizePhone(phone) {
        if (typeof phone !== 'string') return '';
        const cleaned = phone.replace(/[^\d+\-\s()]/g, '').trim().slice(0, 20);
        return cleaned;
    },

    // Sanitize number
    sanitizeNumber(num, min = 0, max = 999999) {
        const parsed = Number(num);
        if (isNaN(parsed)) return min;
        return Math.max(min, Math.min(max, Math.floor(parsed)));
    },

    // Create safe text node (for DOM insertion)
    createSafeTextNode(text) {
        return document.createTextNode(this.sanitizeText(text));
    }
};

// ============================================
// SUPABASE CLIENT INITIALIZATION
// ============================================

let supabaseClient = null;

function initSupabase() {
    if (!window.supabase || typeof window.supabase.createClient !== 'function') {
        console.error('[Supabase] CDN script not loaded. Include @supabase/supabase-js before this file.');
        return false;
    }

    try {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true
            },
            global: {
                headers: {
                    'x-client-info': 'galaxy-cafe-web'
                }
            }
        });

        console.log('[Supabase] Client initialized successfully');
        return true;
    } catch (error) {
        console.error('[Supabase] Initialization failed:', error);
        return false;
    }
}

// Initialize immediately. The @supabase/supabase-js CDN <script> is a plain
// (non-async/defer) tag that loads before this file, so window.supabase is
// already available here — matching the original synchronous init behavior so
// the app script that follows can use supabaseClient without a timing gap.
initSupabase();

// ============================================
// SECURE QUERY HELPERS
// ============================================

const secureDb = {
    // Check rate limit before query
    async checkRateLimit(action) {
        if (!rateLimiter.canProceed(action)) {
            throw new Error('Too many requests. Please wait a moment.');
        }
    },

    // Sanitize reservation payload
    sanitizeReservation(data) {
        return {
            name: sanitizer.sanitizeText(data.name),
            phone: sanitizer.sanitizePhone(data.phone),
            email: sanitizer.sanitizeEmail(data.email),
            date: data.date, // Already validated by input[type=date]
            time: data.time, // Already validated by input[type=time]
            guests: sanitizer.sanitizeNumber(data.guests, 1, 50),
            occasion: sanitizer.sanitizeText(data.occasion),
            handi_type: data.handi_type ? sanitizer.sanitizeText(data.handi_type) : null,
            address: data.address ? sanitizer.sanitizeText(data.address) : null
        };
    },

    // Sanitize feedback payload
    sanitizeFeedback(data) {
        return {
            customer: sanitizer.sanitizeText(data.customer),
            phone: sanitizer.sanitizePhone(data.phone),
            rating: sanitizer.sanitizeNumber(data.rating, 1, 5),
            text: sanitizer.sanitizeText(data.text)
        };
    },

    // Sanitize order payload
    sanitizeOrder(data) {
        return {
            customer: sanitizer.sanitizeText(data.customer),
            items: sanitizer.sanitizeText(data.items),
            total: sanitizer.sanitizeNumber(data.total, 0, 999999),
            payment_method: sanitizer.sanitizeText(data.payment_method),
            payment_id: data.payment_id ? sanitizer.sanitizeText(data.payment_id) : null
        };
    }
};

// ============================================
// ADMIN SESSION MANAGEMENT
// ============================================

const adminSession = {
    SESSION_KEY: 'gc_admin_session',
    SESSION_DURATION: 3600000, // 1 hour

    // Create admin session with expiry
    create(username) {
        const session = {
            username: username,
            loginTime: Date.now(),
            expiresAt: Date.now() + this.SESSION_DURATION
        };

        try {
            sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
            return true;
        } catch (e) {
            console.error('[AdminSession] Failed to create session:', e);
            return false;
        }
    },

    // Get current session if valid
    get() {
        try {
            const data = sessionStorage.getItem(this.SESSION_KEY);
            if (!data) return null;

            const session = JSON.parse(data);

            // Check if expired
            if (Date.now() > session.expiresAt) {
                this.destroy();
                return null;
            }

            return session;
        } catch (e) {
            return null;
        }
    },

    // Destroy session
    destroy() {
        try {
            sessionStorage.removeItem(this.SESSION_KEY);
        } catch (e) {
            console.error('[AdminSession] Failed to destroy session:', e);
        }
    },

    // Check if admin is logged in
    isValid() {
        return this.get() !== null;
    },

    // Extend session (refresh expiry)
    extend() {
        const session = this.get();
        if (session) {
            session.expiresAt = Date.now() + this.SESSION_DURATION;
            try {
                sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
            } catch (e) {
                console.error('[AdminSession] Failed to extend session:', e);
            }
        }
    }
};

// Auto-logout on session expiry
setInterval(() => {
    if (!adminSession.isValid() && window.adminLoggedIn) {
        console.log('[AdminSession] Session expired, logging out');
        if (typeof window.adminLogout === 'function') {
            window.adminLogout();
        }
    }
}, 60000); // Check every minute

// Export for global access
window.supabaseSecure = {
    client: () => supabaseClient,
    rateLimiter,
    sanitizer,
    secureDb,
    adminSession
};
