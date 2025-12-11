-- Migration to add created_by column to tables
-- Created for RBAC feature

-- Add created_by to bookings
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Add created_by to suites
ALTER TABLE suites 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Add created_by to amenities
ALTER TABLE amenities 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

ALTER TABLE suite_amenities 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Customers table is derived from bookings usually, but if we have a separate customers table
-- (The codebase seems to imply derived customers from bookings in queries/customers.ts)
-- "export const useCustomers = () => { ... useQuery ... from('bookings') ... }"
-- So there is no customers table? 
-- Wait, let me check queries/customers.ts again. Yes, it selects from bookings.
-- So we don't need to add created_by to customers table if it doesn't exist.
-- But wait, if we edit a customer, do we update all their bookings? Or do we have a customers table?
-- "const rows = (data || []) as BookingRecord[]" -> It fetches bookings.
-- "const map = new Map<string, { customer: DerivedCustomer ... }>" -> It derives customers.
-- So currently there is NO customers table.
-- If the user wants "Sales Rep... Can only edit items they added", and customers are derived from bookings,
-- then editing a customer implies editing their bookings? Or maybe we create a customers table now?
-- "As at now, our tables don't have columns for created_by we need to add a migration file to create columns for created_by which is linked with our auth.users able."
-- The user says "our tables".
-- If we don't have a customers table, we can't add a column to it.
-- I will assume for now we only add to `bookings`, `suites`, `amenities`.
