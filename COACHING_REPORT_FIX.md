# How to Fix the Coaching Report Error

## Understanding the Problem

When you try to generate a coaching report, you're getting this error:
```
Failed to fetch client: JSON object requested, multiple (or no) rows returned
```

This means the system is looking for a client that doesn't exist in your database.

## Quick Fix Steps

### Step 1: Check Your Database
1. Go to your Supabase dashboard
2. Look for the `clients` table
3. See if there are any clients listed

### Step 2: Create a Test Client (if needed)
If no clients exist, you need to create one:

1. **Option A - Through Supabase Dashboard:**
   - Click on the `clients` table
   - Click "Insert row"
   - Fill in these fields:
     - `first_name`: Test
     - `last_name`: Client
     - `email`: test@example.com
     - `phone`: (555) 123-4567
     - `occupation`: Truck Driver
     - `primary_health_concern`: Energy and weight management
   - Click "Save"
   - Copy the generated `id` (it will be a long UUID)

2. **Option B - Through Your App:**
   - Go to the main clients page
   - Click "Add Client" button
   - Fill in the client information
   - Save the client

### Step 3: Access the Coaching Report
1. Get the client ID from the database (it looks like: `123e4567-e89b-12d3-a456-426614174000`)
2. Go to: `http://localhost:3000/client/[YOUR-CLIENT-ID-HERE]`
3. Click on "Generate Coaching Report"

## Common Issues and Solutions

### Issue 1: Wrong URL Format
❌ Wrong: `/client/1` or `/client/john-smith`
✅ Right: `/client/123e4567-e89b-12d3-a456-426614174000`

### Issue 2: Client Doesn't Exist
- Make sure the client ID you're using actually exists in the database
- Check the `clients` table in Supabase

### Issue 3: Authentication Issues
- Make sure you're logged in
- Your email shows as `kevin@letstruck.com` which is good

## Need More Help?

If you're still having issues:
1. Tell me what you see in your Supabase `clients` table
2. Share the exact URL you're trying to access
3. Let me know if you see any clients in your main clients list page

The system is working correctly - it just needs valid client data to generate reports!