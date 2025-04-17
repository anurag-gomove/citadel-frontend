
-- Add GST and QST tax fields to property_bills table if needed in the future
-- Currently we're just storing the total amount with taxes included
-- But this migration prepares for possible future tax breakdowns

-- Adding columns for tax tracking, but they'll be NULL for now
ALTER TABLE property_bills
ADD COLUMN gst_amount numeric NULL,
ADD COLUMN qst_amount numeric NULL;

-- Add a note to explain the current amount field (for documentation)
COMMENT ON COLUMN property_bills.amount IS 'Total amount including taxes';
