-- Add payment_reference column to bookings table
ALTER TABLE bookings
ADD COLUMN payment_reference TEXT;
