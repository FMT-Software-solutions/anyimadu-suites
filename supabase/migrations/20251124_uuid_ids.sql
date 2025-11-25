-- Adjust RPC and indexes after switching ids to uuid
DROP FUNCTION IF EXISTS public.available_suites(date, date, integer);

CREATE OR REPLACE FUNCTION public.available_suites(
  p_check_in DATE,
  p_check_out DATE,
  p_guest_count INTEGER
) RETURNS TABLE (id UUID) AS $$
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

DROP INDEX IF EXISTS bookings_suite_idx;
CREATE INDEX IF NOT EXISTS bookings_suite_idx ON public.bookings (suite_id);

DROP INDEX IF EXISTS bookings_dates_idx;
CREATE INDEX IF NOT EXISTS bookings_dates_idx ON public.bookings (check_in, check_out);
