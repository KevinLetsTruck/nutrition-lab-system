-- Run all migrations in order to set up the database schema
-- Execute this in your Supabase SQL Editor

-- First, enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Migration 001: Initial Schema
\echo 'Running 001_initial_schema.sql...'
\i database/migrations/001_initial_schema.sql

-- Migration 003: Onboarding System
\echo 'Running 003_onboarding_system.sql...'
\i database/migrations/003_onboarding_system.sql

-- Migration 004: Email Verifications
\echo 'Running 004_email_verifications.sql...'
\i database/migrations/004_email_verifications.sql

-- Migration 006: Authentication System (CRITICAL - creates users table)
\echo 'Running 006_authentication_system.sql...'
\i database/migrations/006_authentication_system.sql

-- Migration 007: Clinical Workflow
\echo 'Running 007_clinical_workflow.sql...'
\i database/migrations/007_clinical_workflow.sql

-- Migration 009: Client Archiving
\echo 'Running 009_client_archiving.sql...'
\i database/migrations/009_client_archiving.sql

-- Skip migrations with conflicts or duplicates
-- Migration 018: Lab Reports (use the clean version)
\echo 'Running 018_lab_reports_clean.sql...'
\i database/migrations/018_lab_reports_clean.sql

-- After running these, you should be able to create your admin user!
