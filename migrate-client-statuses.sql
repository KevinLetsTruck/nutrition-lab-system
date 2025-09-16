-- Migration script to update client statuses to new simplified enum
-- Run this after updating the Prisma schema

-- Update all old statuses to new ones
UPDATE "Client" SET status = 'ONGOING' WHERE status IN ('SIGNED_UP', 'INITIAL_INTERVIEW_COMPLETED', 'ASSESSMENT_COMPLETED', 'DOCS_UPLOADED');
UPDATE "Client" SET status = 'SCHEDULED' WHERE status = 'SCHEDULED';
UPDATE "Client" SET status = 'ARCHIVED' WHERE status = 'ARCHIVED';

-- Verify the migration
SELECT status, COUNT(*) as count FROM "Client" GROUP BY status;
