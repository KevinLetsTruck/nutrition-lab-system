#!/usr/bin/env node

// This script helps diagnose the client data issue

console.log(`
🔍 TROUBLESHOOTING CLIENT DATA ISSUE
===================================

The error you're seeing:
"Failed to fetch client: JSON object requested, multiple (or no) rows returned"

This happens when:
1. The client ID doesn't exist in the database
2. The wrong table is being queried
3. The client ID format is incorrect

SOLUTIONS:
----------

1. First, check if you have any clients in your database:
   - Go to your Supabase dashboard
   - Check the 'clients' table
   - Note down any client IDs

2. If no clients exist, create one:
   - Use the "Add Client" feature in your app
   - Or add directly in Supabase dashboard

3. Make sure you're using the correct client ID:
   - Client IDs should be UUIDs (e.g., "123e4567-e89b-12d3-a456-426614174000")
   - Not simple numbers like "1", "2", "3"

4. Check which page/URL you're trying to access:
   - The URL should be: /client/[valid-uuid-here]
   - Example: /client/123e4567-e89b-12d3-a456-426614174000

5. If you're in development mode:
   - The app might be using mock data
   - Check if there are any test clients available

NEXT STEPS:
-----------
1. Open your Supabase dashboard
2. Go to the 'clients' table
3. Create a new client or copy an existing client's ID
4. Use that ID when accessing the coaching report

Need more help? Let me know what you find in your database!
`)