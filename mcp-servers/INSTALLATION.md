# 🚀 MCP Server Installation Guide

## Quick Install (5 minutes)

### Step 1: Open Terminal
Press `Cmd + Space`, type "Terminal", press Enter

### Step 2: Run Installation
Copy and paste these commands one by one:

```bash
cd /Users/kr/fntp-nutrition-system/mcp-servers
chmod +x setup.sh
./setup.sh
```

### Step 3: Add Railway Token (Optional but Recommended)
1. Go to https://railway.app/account/tokens
2. Click "Create Token"
3. Copy the token
4. Open your `.env` file:
   ```bash
   open /Users/kr/fntp-nutrition-system/.env
   ```
5. Add this line:
   ```
   RAILWAY_API_TOKEN=your_token_here
   ```

### Step 4: Restart Claude Desktop
1. Quit Claude completely (Cmd + Q)
2. Wait 3 seconds
3. Open Claude again

### Step 5: Test It!
Come back to your chat and Claude will have these new powers:

## 🎯 What Claude Can Now Do

### Terminal Commands
- `npm run dev` - Start your dev server
- `npm test` - Run tests
- `git status` - Check git status
- Any terminal command you normally run!

### Database Operations
- Run SQL queries directly
- Create/modify tables
- Check data
- Run migrations

### Railway Deployment (if token added)
- Deploy to production
- Check deployment status
- View logs
- Manage environment variables

## 🔍 Verification

After restarting Claude, you should see these in the MCP menu:
- ✅ filesystem (was already there)
- ✅ memory (was already there)
- ✅ browser (was already there)
- 🆕 terminal (new!)
- 🆕 database (new!)
- 🆕 railway (new!)
- ❌ git (broken, but we don't need it)

## 🚨 Troubleshooting

### If servers don't appear:
1. Make sure you restarted Claude completely
2. Check the log file:
   ```bash
   tail -f ~/Library/Logs/Claude/mcp.log
   ```

### If terminal server fails:
- Make sure Node.js is installed: `node --version`

### If database server fails:
- Check your `.env` has `DATABASE_URL`
- Make sure PostgreSQL is running

### If Railway server fails:
- It might not be released yet (check https://railway.app/mcp)
- Make sure you added RAILWAY_API_TOKEN to .env

## 📊 Success Metrics

You'll know it worked when Claude can:
1. ✅ Run `npm run dev` directly
2. ✅ Query your database
3. ✅ Deploy to Railway (if configured)
4. ✅ No more copy-pasting to Cursor!

## 🎉 You're Done!

Once installed, Claude becomes your full-stack developer with direct access to:
- Your codebase
- Terminal commands
- Database
- Deployment pipeline

**No more context switching between Claude and Cursor!**
