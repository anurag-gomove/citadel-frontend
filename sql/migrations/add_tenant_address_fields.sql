
-- Add new columns to tenants table for address and other phone
ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS street_number TEXT,
ADD COLUMN IF NOT EXISTS street_name TEXT,
ADD COLUMN IF NOT EXISTS apartment TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS zipcode TEXT,
ADD COLUMN IF NOT EXISTS other_phone TEXT;
