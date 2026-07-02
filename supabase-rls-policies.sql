-- ============================================
-- GALAXY CAFE — ROW LEVEL SECURITY POLICIES (v2, hardened 2026-07-01)
-- ============================================
-- Execute in the Supabase SQL Editor. Idempotent: drops the old permissive
-- policies from v1 first, then installs the tightened ones.
--
-- MODEL:
--   • The anon public key is public-by-design. RLS is the ONLY control.
--   • Admin authority = a Supabase Auth user whose
--     `user_metadata.role = 'admin'` (set in Dashboard → Auth → Users).
--   • Customers see only their own rows, keyed by auth.email() / auth.phone().
--   • Anonymous callers can INSERT public forms (reservation / feedback /
--     order) but cannot SELECT, UPDATE, or DELETE anything.
-- ============================================

-- ============================================
-- 0. HELPER — is the current caller an admin?
-- ============================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
    SELECT COALESCE(
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin',
        false
    );
$$;

-- ============================================
-- 1. ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedbacks    ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders       ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices      ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. DROP LEGACY (v1) PERMISSIVE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Anyone can create reservations"     ON reservations;
DROP POLICY IF EXISTS "Users can read own reservations"    ON reservations;
DROP POLICY IF EXISTS "Service role can update reservations" ON reservations;
DROP POLICY IF EXISTS "Service role can delete reservations" ON reservations;

DROP POLICY IF EXISTS "Anyone can create feedback"         ON feedbacks;
DROP POLICY IF EXISTS "Anyone can read feedback"           ON feedbacks;
DROP POLICY IF EXISTS "Service role can update feedback"   ON feedbacks;
DROP POLICY IF EXISTS "Service role can delete feedback"   ON feedbacks;

DROP POLICY IF EXISTS "Anyone can create orders"           ON orders;
DROP POLICY IF EXISTS "Anyone can read orders"             ON orders;
DROP POLICY IF EXISTS "Service role can update orders"     ON orders;
DROP POLICY IF EXISTS "Service role can delete orders"     ON orders;

DROP POLICY IF EXISTS "Service role can create notices"    ON notices;
DROP POLICY IF EXISTS "Anyone can read notices"            ON notices;
DROP POLICY IF EXISTS "Service role can update notices"    ON notices;
DROP POLICY IF EXISTS "Users can mark notices as read"     ON notices;
DROP POLICY IF EXISTS "Service role can delete notices"    ON notices;

-- Also drop any v2 policies from a prior (possibly partial) run of THIS file,
-- so the CREATE POLICY statements below never hit "policy already exists".
DROP POLICY IF EXISTS "reservations_insert_public"          ON reservations;
DROP POLICY IF EXISTS "reservations_select_owner_or_admin"  ON reservations;
DROP POLICY IF EXISTS "reservations_update_admin"           ON reservations;
DROP POLICY IF EXISTS "reservations_delete_admin"           ON reservations;

DROP POLICY IF EXISTS "feedbacks_insert_public"             ON feedbacks;
DROP POLICY IF EXISTS "feedbacks_select_public"             ON feedbacks;
DROP POLICY IF EXISTS "feedbacks_update_admin"              ON feedbacks;
DROP POLICY IF EXISTS "feedbacks_delete_admin"              ON feedbacks;

DROP POLICY IF EXISTS "orders_insert_public"                ON orders;
DROP POLICY IF EXISTS "orders_select_owner_or_admin"        ON orders;
DROP POLICY IF EXISTS "orders_select_admin"                 ON orders;
DROP POLICY IF EXISTS "orders_update_admin"                 ON orders;
DROP POLICY IF EXISTS "orders_delete_admin"                 ON orders;

DROP POLICY IF EXISTS "notices_insert_admin"                ON notices;
DROP POLICY IF EXISTS "notices_select_recipient_or_admin"   ON notices;
DROP POLICY IF EXISTS "notices_update_recipient_mark_read"  ON notices;
DROP POLICY IF EXISTS "notices_update_admin"                ON notices;
DROP POLICY IF EXISTS "notices_delete_admin"                ON notices;

-- ============================================
-- 3. RESERVATIONS TABLE (v2)
-- ============================================

-- Anyone (anon or authenticated) can create a reservation. INSERT-only.
CREATE POLICY "reservations_insert_public"
ON reservations FOR INSERT
WITH CHECK (true);

-- Read: admins see everything; authenticated users see rows matching their
-- own email or phone. Anonymous callers see NOTHING (no anon read).
CREATE POLICY "reservations_select_owner_or_admin"
ON reservations FOR SELECT
USING (
    is_admin()
    OR (auth.role() = 'authenticated' AND email = auth.email())
    OR (auth.role() = 'authenticated' AND phone = (auth.jwt() ->> 'phone'))
);

-- Update / delete: admin claim only.
CREATE POLICY "reservations_update_admin"
ON reservations FOR UPDATE
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "reservations_delete_admin"
ON reservations FOR DELETE
USING (is_admin());

-- ============================================
-- 4. FEEDBACKS TABLE (v2)
-- ============================================

-- Anyone can submit feedback.
CREATE POLICY "feedbacks_insert_public"
ON feedbacks FOR INSERT
WITH CHECK (true);

-- Feedback display is intentionally public (used on the public site).
-- If you later want to gate it, replace `true` with `is_admin() OR published`.
CREATE POLICY "feedbacks_select_public"
ON feedbacks FOR SELECT
USING (true);

CREATE POLICY "feedbacks_update_admin"
ON feedbacks FOR UPDATE
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "feedbacks_delete_admin"
ON feedbacks FOR DELETE
USING (is_admin());

-- ============================================
-- 5. ORDERS TABLE (v2)
-- ============================================

-- Order creation stays open (called from Razorpay success handler).
CREATE POLICY "orders_insert_public"
ON orders FOR INSERT
WITH CHECK (true);

-- Read: admin only. The orders table has no ownership key (no email/phone/
-- user_id column) and rows are inserted anonymously from the checkout success
-- handler, so a customer cannot prove ownership of an order. Admin-only read is
-- the correct, secure model here. (To let customers see their own orders later,
-- add a `customer_email` column, populate it at insert time from an
-- authenticated session, then restore an owner-or-admin policy.)
CREATE POLICY "orders_select_admin"
ON orders FOR SELECT
USING (is_admin());

CREATE POLICY "orders_update_admin"
ON orders FOR UPDATE
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "orders_delete_admin"
ON orders FOR DELETE
USING (is_admin());

-- ============================================
-- 6. NOTICES TABLE (v2)
-- ============================================

-- Only admins send notices.
CREATE POLICY "notices_insert_admin"
ON notices FOR INSERT
WITH CHECK (is_admin());

-- Recipients see only notices addressed to their email or phone.
-- Columns are `email` and `phone` (see app.js createNoticeDb) — there is no
-- `recipient_key` column.
CREATE POLICY "notices_select_recipient_or_admin"
ON notices FOR SELECT
USING (
    is_admin()
    OR (auth.role() = 'authenticated' AND email = auth.email())
    OR (auth.role() = 'authenticated' AND phone = (auth.jwt() ->> 'phone'))
);

-- A recipient can update their own notice (used to mark it read). WITH CHECK
-- re-matches on ownership so they cannot reassign a notice to someone else.
-- (The app only flips the boolean `read` column; there is no `status` column.)
CREATE POLICY "notices_update_recipient_mark_read"
ON notices FOR UPDATE
USING (
    (auth.role() = 'authenticated' AND email = auth.email())
    OR (auth.role() = 'authenticated' AND phone = (auth.jwt() ->> 'phone'))
)
WITH CHECK (
    (auth.role() = 'authenticated' AND email = auth.email())
    OR (auth.role() = 'authenticated' AND phone = (auth.jwt() ->> 'phone'))
);

CREATE POLICY "notices_update_admin"
ON notices FOR UPDATE
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "notices_delete_admin"
ON notices FOR DELETE
USING (is_admin());

-- ============================================
-- 7. VALIDATION TRIGGERS (unchanged from v1)
-- ============================================

CREATE OR REPLACE FUNCTION validate_reservation_date()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.date < CURRENT_DATE THEN
        RAISE EXCEPTION 'Cannot book reservations in the past';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_reservation_date ON reservations;
CREATE TRIGGER check_reservation_date
BEFORE INSERT OR UPDATE ON reservations
FOR EACH ROW EXECUTE FUNCTION validate_reservation_date();

CREATE OR REPLACE FUNCTION validate_feedback_rating()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.rating < 1 OR NEW.rating > 5 THEN
        RAISE EXCEPTION 'Rating must be between 1 and 5';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_feedback_rating ON feedbacks;
CREATE TRIGGER check_feedback_rating
BEFORE INSERT OR UPDATE ON feedbacks
FOR EACH ROW EXECUTE FUNCTION validate_feedback_rating();

-- ============================================
-- 8. RATE-LIMIT TRIGGER — abuse cap on public INSERTs
-- ============================================
-- Prevents obvious flooding without a backend. Not a substitute for a real
-- API-gateway limit, but enough to stop casual scripts.

CREATE OR REPLACE FUNCTION reservation_flood_check()
RETURNS TRIGGER AS $$
BEGIN
    IF (
        SELECT COUNT(*) FROM reservations
        WHERE phone = NEW.phone
          AND created_at > NOW() - INTERVAL '10 minutes'
    ) > 5 THEN
        RAISE EXCEPTION 'Too many bookings from this phone in the last 10 minutes.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_reservation_flood ON reservations;
CREATE TRIGGER check_reservation_flood
BEFORE INSERT ON reservations
FOR EACH ROW EXECUTE FUNCTION reservation_flood_check();

CREATE OR REPLACE FUNCTION feedback_flood_check()
RETURNS TRIGGER AS $$
BEGIN
    IF (
        SELECT COUNT(*) FROM feedbacks
        WHERE phone = NEW.phone
          AND created_at > NOW() - INTERVAL '10 minutes'
    ) > 5 THEN
        RAISE EXCEPTION 'Too many feedback submissions from this phone in the last 10 minutes.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_feedback_flood ON feedbacks;
CREATE TRIGGER check_feedback_flood
BEFORE INSERT ON feedbacks
FOR EACH ROW EXECUTE FUNCTION feedback_flood_check();

-- ============================================
-- 9. INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_reservations_date          ON reservations(date);
CREATE INDEX IF NOT EXISTS idx_reservations_phone         ON reservations(phone);
CREATE INDEX IF NOT EXISTS idx_reservations_email         ON reservations(email);
CREATE INDEX IF NOT EXISTS idx_reservations_created_at    ON reservations(created_at);
CREATE INDEX IF NOT EXISTS idx_feedbacks_rating           ON feedbacks(rating);
CREATE INDEX IF NOT EXISTS idx_feedbacks_phone            ON feedbacks(phone);
CREATE INDEX IF NOT EXISTS idx_feedbacks_created_at       ON feedbacks(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_created_at          ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_notices_email             ON notices(email);
CREATE INDEX IF NOT EXISTS idx_notices_phone             ON notices(phone);
CREATE INDEX IF NOT EXISTS idx_notices_read              ON notices(read);

-- ============================================
-- 10. VERIFICATION QUERIES — run manually after apply
-- ============================================

-- All tables have RLS enabled:
--   SELECT tablename, rowsecurity FROM pg_tables
--    WHERE schemaname = 'public'
--      AND tablename IN ('reservations','feedbacks','orders','notices');

-- Full policy listing:
--   SELECT tablename, policyname, cmd, qual, with_check
--     FROM pg_policies WHERE schemaname = 'public'
--     ORDER BY tablename, policyname;

-- Anonymous read attempt should return zero rows:
--   SET ROLE anon;
--   SELECT * FROM reservations;     -- expect 0 rows
--   SELECT * FROM orders;           -- expect 0 rows
--   RESET ROLE;

-- ============================================
-- SCHEMA NOTES
-- ============================================
-- 1. Policies match the ACTUAL table columns (verified against app.js):
--       reservations: name, phone, email, date, time, guests, occasion,
--                     handi_type, address, status, created_at
--       feedbacks:    customer, phone, rating, text, created_at
--       orders:       customer, items, total, status, payment_method,
--                     payment_id, created_at   (NO email/phone/user_id →
--                     orders SELECT is admin-only; customers cannot prove
--                     ownership. Add a `customer_email` column later if you
--                     want per-customer order history.)
--       notices:      email, phone, title, body, read, created_at
--                     (there is NO recipient_key or status column)
--
-- 2. `phone` matching uses the JWT claim `phone`. Supabase populates this
--    only if the user signed up with a phone number; otherwise SELECTs on
--    phone-keyed rows return nothing (correct — no way to prove ownership).
--
-- 3. To provision an admin:
--       Dashboard → Auth → Users → Add user (email + password).
--       Click the user → edit Raw User Meta Data → add:  { "role": "admin" }
--       Save. That email can now sign in through the Admin Portal.
--
-- 4. NEVER put the service_role key in the frontend. This RLS is designed
--    so no service_role key is needed on the client at all.
