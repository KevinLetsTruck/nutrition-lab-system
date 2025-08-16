# 🔑 API Keys Setup Guide

## Required API Keys for Full Automation

### 1. Linear API Key
**Purpose**: Task management, issue tracking, sprint planning

**How to get it:**
1. Go to https://linear.app/settings/api
2. Click "Create new API key"
3. Name it: "Claude MCP Integration"
4. Copy the key

**Add to .env:**
```
LINEAR_API_KEY=lin_api_xxxxxxxxxxxxx
```

### 2. Sentry Auth Token
**Purpose**: Error monitoring, bug tracking, deployment health

**How to get it:**
1. Go to https://sentry.io/settings/account/api/auth-tokens/
2. Click "Create New Token"
3. Give it these scopes:
   - project:read
   - project:write
   - issue:read
   - issue:write
   - event:read
   - org:read
4. Name it: "Claude MCP Integration"
5. Copy the token

**Add to .env:**
```
SENTRY_AUTH_TOKEN=sntrys_xxxxxxxxxxxxx
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=your-project-slug
```

### 3. Railway API Token
**Purpose**: Deployments, production monitoring, environment management

**How to get it:**
1. Go to https://railway.app/account/tokens
2. Click "Create Token"
3. Name it: "Claude MCP Integration"
4. Copy the token

**Add to .env:**
```
RAILWAY_API_TOKEN=railway_xxxxxxxxxxxxx
```

### 4. Database URL (Already Set)
**Purpose**: Direct database access

Should already be in your .env:
```
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

## 🎯 Complete .env Example

Your .env file should have these entries:

```env
# Existing (keep these)
DATABASE_URL=postgresql://...
ANTHROPIC_API_KEY=sk-ant-...
# ... other existing keys ...

# New MCP Server Keys
LINEAR_API_KEY=lin_api_xxxxxxxxxxxxx
SENTRY_AUTH_TOKEN=sntrys_xxxxxxxxxxxxx
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=javascript-nextjs
RAILWAY_API_TOKEN=railway_xxxxxxxxxxxxx
```

## 🔍 Verification Checklist

After adding all keys and restarting Claude:

### Linear Server
- [ ] Can list issues
- [ ] Can create new issues
- [ ] Can update issue status
- [ ] Can add comments

### Sentry Server
- [ ] Can list recent errors
- [ ] Can analyze error patterns
- [ ] Can mark issues as resolved
- [ ] Can check deployment health

### Railway Server
- [ ] Can deploy to production
- [ ] Can check deployment status
- [ ] Can view logs
- [ ] Can manage environment variables

## 🚀 What Claude Can Do With These Keys

### Automated Workflow Example:
1. **Claude detects error** in Sentry
2. **Analyzes the pattern** and finds the bug
3. **Creates Linear issue** with details
4. **Fixes the code** using filesystem access
5. **Tests the fix** with terminal server
6. **Commits changes** (when git is fixed)
7. **Deploys to Railway**
8. **Monitors Sentry** for resolution
9. **Updates Linear issue** to Done

### Daily Automation:
- Morning: Check overnight Sentry errors
- Create Linear tasks for critical issues
- Fix bugs throughout the day
- Deploy fixes to production
- Update task statuses
- End of day: Report on resolved issues

## 🔒 Security Notes

- **Never commit .env file** to git
- **Rotate tokens** every 90 days
- **Use read-only tokens** where possible
- **Limit scopes** to minimum required

## 📊 Success Metrics

You'll know it's working when Claude can say:
- "I see 3 critical errors in Sentry from last night"
- "I've created Linear issue ENG-123 for this bug"
- "The fix is deployed to production"
- "Error rate has dropped to zero after the deployment"

## 🎉 You're Done!

With all these keys configured, Claude becomes your:
- **DevOps Engineer** (deployments)
- **QA Engineer** (error monitoring)
- **Project Manager** (task tracking)
- **Full-Stack Developer** (code fixes)

All in one AI assistant! 🚀
