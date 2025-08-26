-- FNTP Nutrition System Database Initialization

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Set timezone
SET timezone = 'UTC';

-- Create enum types
CREATE TYPE user_role AS ENUM ('admin', 'practitioner', 'client');
CREATE TYPE document_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE analysis_status AS ENUM ('draft', 'in_progress', 'completed', 'archived');

-- Grant permissions to the database user
GRANT ALL PRIVILEGES ON DATABASE fntp_nutrition TO fntp_admin;

-- Add any initial schema comments
COMMENT ON DATABASE fntp_nutrition IS 'FNTP Nutrition System Database - Manages clients, documents, and nutritional analysis';

-- Log successful initialization
DO $$
BEGIN
    RAISE NOTICE 'FNTP Nutrition Database initialized successfully at %', NOW();
END $$;
