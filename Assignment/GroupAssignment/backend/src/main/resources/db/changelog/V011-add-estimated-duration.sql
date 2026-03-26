-- Add estimated_duration_minutes column to reservation table
ALTER TABLE reservation ADD COLUMN estimated_duration_minutes INTEGER;

-- Set default value for existing records (120 minutes = 2 hours)
UPDATE reservation SET estimated_duration_minutes = 120 WHERE estimated_duration_minutes IS NULL;
