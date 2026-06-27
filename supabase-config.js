// ============================================
// SUPABASE CONFIG
// Get these from Supabase Dashboard -> Project Settings -> API
// The anon key is SAFE to expose in frontend code; Row Level Security (RLS)
// policies are what actually protect your data. NEVER put the service_role key here.
// ============================================
const SUPABASE_URL = 'https://vbfjovksikjfnspyqexf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZiZmpvdmtzaWtqZm5zcHlxZXhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NjkzNzcsImV4cCI6MjA5ODE0NTM3N30.Sxwp4ifoytciDZNMdbvD0kb1d29niiIkSLzYtakPB_g'; // <- anon public key

// window.supabase is provided by the @supabase/supabase-js CDN script.
// If that script failed to load, fail loudly so the cause is obvious.
let supabaseClient = null;
if (window.supabase && typeof window.supabase.createClient === 'function') {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
    console.error('[Supabase] CDN script not loaded. Ensure the supabase-js <script> tag comes before supabase-config.js.');
}
