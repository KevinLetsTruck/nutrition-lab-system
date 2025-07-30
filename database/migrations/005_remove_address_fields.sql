-- Migration 005: Remove address fields from client_onboarding table
-- This migration removes address-related fields that are no longer needed in the streamlined onboarding

-- Remove address-related columns from client_onboarding table
ALTER TABLE client_onboarding 
DROP COLUMN IF EXISTS address,
DROP COLUMN IF EXISTS city,
DROP COLUMN IF EXISTS state,
DROP COLUMN IF EXISTS zip_code,
DROP COLUMN IF EXISTS emergency_contact,
DROP COLUMN IF EXISTS emergency_phone;

-- Update the table comment to reflect the simplified structure
COMMENT ON TABLE client_onboarding IS 'Streamlined onboarding system for FNTP truck driver clients - essential info only (no address fields)';

-- Add comment about the simplified structure
COMMENT ON COLUMN client_onboarding.first_name IS 'Client first name (required)';
COMMENT ON COLUMN client_onboarding.last_name IS 'Client last name (required)';
COMMENT ON COLUMN client_onboarding.email IS 'Client email address (required)';
COMMENT ON COLUMN client_onboarding.date_of_birth IS 'Client date of birth (required)'; 