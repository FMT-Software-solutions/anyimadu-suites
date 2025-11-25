-- Enable UUID extension if needed
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  suite_id BIGINT NOT NULL REFERENCES public.suites(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guest_count INTEGER NOT NULL CHECK (guest_count > 0),
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('pending','confirmed','cancelled','completed')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS bookings_suite_idx ON public.bookings (suite_id);
CREATE INDEX IF NOT EXISTS bookings_dates_idx ON public.bookings (check_in, check_out);


-- Drop old signature if it exists to allow parameter rename
DROP FUNCTION IF EXISTS public.available_suites(date, date, integer);

-- RPC: available_suites
CREATE OR REPLACE FUNCTION public.available_suites(
  p_check_in DATE,
  p_check_out DATE,
  p_guest_count INTEGER
) RETURNS TABLE (id BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT s.id
  FROM public.suites s
  WHERE s.capacity >= p_guest_count
    AND NOT EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.suite_id = s.id
        AND b.status IN ('pending','confirmed','completed')
        AND NOT (b.check_out <= p_check_in OR b.check_in >= p_check_out)
    )
  ORDER BY s.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

COMMENT ON FUNCTION public.available_suites(p_check_in DATE, p_check_out DATE, p_guest_count INTEGER)
  IS 'Return suite IDs that are available for the given date range and guest count.';
