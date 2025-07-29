# Setup Guide

## Environment Variables Setup

To use the database system, you need to create a `.env.local` file with your Supabase credentials.

### 1. Create Environment File

Create a file called `.env.local` in the root directory with the following content:

```bash
# Supabase Configuration
# Get these from your Supabase project dashboard
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Anthropic API (Claude) for AI Analysis
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Resend API for Email Notifications (optional)
RESEND_API_KEY=your_resend_api_key_here

# File Upload Settings
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,jpg,jpeg,png
UPLOAD_DIR=./uploads
```

### 2. Get Your Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In your project dashboard, go to Settings > API
3. Copy the following values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Test the Setup

Once you've created the `.env.local` file with your credentials:

```bash
# Test database connection
npm run db:query test

# If successful, you should see:
# Database connection successful!

# Then you can run migrations
npm run db:migrate

# And seed with sample data
npm run db:seed

# Finally, try interactive mode
npm run db:query
```

### 4. Interactive Query Runner Commands

Once connected, you can use these commands:

```bash
# Quick commands
npm run db:query tables    # Show all tables
npm run db:query clients   # Show clients
npm run db:query reports   # Show lab reports
npm run db:query summary   # Show client summary

# Interactive mode
npm run db:query
# Then type commands like:
#   tables
#   clients
#   desc lab_reports
#   SELECT * FROM clients LIMIT 5;
#   help
#   exit
```

## Troubleshooting

### "Missing Supabase environment variables"
- Make sure you created `.env.local` (not `.env`)
- Check that all three Supabase variables are set
- Verify the values are correct from your Supabase dashboard

### "Connection failed"
- Check your internet connection
- Verify the Supabase URL is correct
- Make sure your Supabase project is active

### "Permission denied"
- Ensure you're using the service role key for admin operations
- Check that your Supabase project has the correct permissions

## Next Steps

After setting up the environment variables:

1. **Run migrations**: `npm run db:migrate`
2. **Seed data**: `npm run db:seed`
3. **Test query runner**: `npm run db:query test`
4. **Start development**: `npm run dev`

The database system is now ready to use! 🎉 