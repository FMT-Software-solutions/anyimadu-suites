-- Add billing fields to bookings if missing
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS billing_address TEXT,
  ADD COLUMN IF NOT EXISTS billing_city TEXT,
  ADD COLUMN IF NOT EXISTS billing_state TEXT,
  ADD COLUMN IF NOT EXISTS billing_zip TEXT,
  ADD COLUMN IF NOT EXISTS billing_country TEXT;

