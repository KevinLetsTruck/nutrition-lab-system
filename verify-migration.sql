-- Verify the status migration results
SELECT status, COUNT(*) as count FROM "Client" GROUP BY status ORDER BY count DESC;

