/*
  # Fix Leads Schema
  
  Problem: The frontend sends 'vehicle_interest' and 'source' fields, but these columns 
  do not exist in the 'leads' table, causing error PGRST204.
  
  Solution: Add the missing columns to the 'leads' table.
*/

-- Add vehicle_interest column for tracking what car the lead wants
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS vehicle_interest text;

-- Add source column to track where the lead came from (manual, site, whatsapp, etc)
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS source text DEFAULT 'manual';

-- Add notes column if it doesn't exist (good practice for CRM)
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS notes text;

-- Add temperature column for lead scoring (cold, warm, hot)
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS temperature text DEFAULT 'cold';

-- Comment on columns for documentation
COMMENT ON COLUMN leads.vehicle_interest IS 'The vehicle model or type the lead is interested in';
COMMENT ON COLUMN leads.source IS 'Origin of the lead (e.g., manual, website, instagram)';
