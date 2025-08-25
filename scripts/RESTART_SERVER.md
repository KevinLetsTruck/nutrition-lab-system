# ⚠️ IMPORTANT: Restart Your Next.js Server

The database schema has changed and Prisma client has been regenerated.

**You need to restart your Next.js development server for the changes to take effect.**

## Steps:

1. Stop the current server (Ctrl+C in the terminal running `npm run dev`)
2. Start it again: `npm run dev`

## Why this is needed:

Next.js caches the Prisma client in development. When we:

- Changed the database schema (removed old models, added SimpleAssessment)
- Regenerated the Prisma client

The running server still has the old client in memory. A restart will load the new client with the updated schema.

## After restarting:

Test the API endpoints:

```bash
node scripts/test-simple-api.js
```

Or manually:

```bash
curl http://localhost:3001/api/simple-assessment/test
```

The test endpoint should return:

```json
{
  "success": true,
  "data": {
    "message": "Database connection working",
    "counts": {
      "clients": 1,
      "assessments": 0,
      "responses": 0
    }
  }
}
```
