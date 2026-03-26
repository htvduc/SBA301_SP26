-- Add customization_type column to customization table
ALTER TABLE customization 
ADD COLUMN customization_type VARCHAR(20) NOT NULL DEFAULT 'ADDON';

-- Add comment for clarity
COMMENT ON COLUMN customization.customization_type IS 'Type of customization: ADDON (can select multiple with quantity) or VARIANT (select one only, no quantity)';
