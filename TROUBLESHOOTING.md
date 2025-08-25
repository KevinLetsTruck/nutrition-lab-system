# Troubleshooting Guide - Functional Medicine Assessment System

## Purpose
This guide provides solutions to common issues encountered during development, preventing repeated debugging and context loss.

---

## 🚨 Critical Issues & Quick Fixes

### Database Connection Issues

#### Problem: "Cannot connect to database"
**Symptoms**: 
- API endpoints return 500 errors
- Prisma commands fail
- Database queries timeout

**Quick Diagnosis**:
```bash
# Test database connection
npm run db:studio
# OR
npx prisma db pull
```

**Solutions**:
1. **Check DATABASE_URL in .env.local**:
   ```bash
   grep DATABASE_URL .env.local
   ```
   Should look like: `DATABASE_URL="postgresql://user:pass@host:5432/dbname"`

2. **Verify PostgreSQL is running**:
   ```bash
   # macOS with Homebrew
   brew services list | grep postgresql
   
   # Start if stopped
   brew services start postgresql
   ```

3. **Test connection manually**:
   ```bash
   psql $DATABASE_URL -c "SELECT version();"
   ```

4. **Reset database if corrupted**:
   ```bash
   npm run db:push --force-reset
   # WARNING: This destroys all data
   ```

---

### Development Server Issues

#### Problem: "Port 3000 already in use"
**Quick Fix**:
```bash
# Find what's using port 3000
lsof -i :3000

# Kill the process
kill -9 [PID]

# Or use different port
npm run dev -- --port 3001
```

#### Problem: "Server won't start" or hangs
**Diagnosis Steps**:
1. **Check for syntax errors**:
   ```bash
   npm run check-types
   npm run lint
   ```

2. **Clear Next.js cache**:
   ```bash
   rm -rf .next
   npm run dev
   ```

3. **Check environment variables**:
   ```bash
   node -e "console.log(process.env.NODE_ENV)"
   ```

4. **Verify dependencies**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

---

### Build & Deployment Issues

#### Problem: "Type errors during build"
**Common Causes & Fixes**:
1. **Missing type definitions**:
   ```bash
   npm install @types/[package-name] --save-dev
   ```

2. **Strict TypeScript errors**:
   ```typescript
   // Quick fix for development (not recommended for production)
   // @ts-ignore
   const problematicCode = something;
   ```

3. **Prisma client not generated**:
   ```bash
   npx prisma generate
   npm run build
   ```

#### Problem: "Out of memory during build"
**Solutions**:
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=8192"
npm run build

# Or in package.json scripts:
"build": "NODE_OPTIONS='--max-old-space-size=8192' next build"
```

---

## 🔧 UI & Text Visibility Issues

### Problem: White text on white background (COMMON)
**Root Cause**: Missing dark mode classes

**Quick Fix Template**:
```tsx
// ❌ BROKEN
<div>Text content</div>

// ✅ FIXED
<div className="text-gray-900 dark:text-gray-100">Text content</div>
```

**Systematic Fix**:
```tsx
// Add to top-level container
<div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
  {/* All content inherits proper colors */}
</div>
```

**Component-Specific Fixes**:
```tsx
// Cards
<Card className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">

// Buttons (if custom styling needed)
<Button className="bg-blue-600 hover:bg-blue-700 text-white">

// Inputs
<Input className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800">

// Labels
<Label className="text-gray-700 dark:text-gray-300">
```

### Problem: Components not visible in dark mode
**Debug Steps**:
1. **Test in both modes**:
   - Toggle system dark mode
   - Check browser DevTools for applied classes

2. **Verify Tailwind classes**:
   ```bash
   # Ensure Tailwind includes dark mode variants
   grep "darkMode" tailwind.config.js
   ```

3. **Check global CSS**:
   ```css
   /* In globals.css - ensure these exist */
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

---

## ⚡ Performance Issues

### Problem: Slow API responses
**Diagnosis**:
```bash
# Test API directly
curl -w "@curl-format.txt" http://localhost:3000/api/endpoint

# Check database query performance
npm run db:studio
# Look for slow queries in logs
```

**Solutions**:
1. **Add database indexes**:
   ```prisma
   // In schema.prisma
   @@index([fieldName])
   @@index([field1, field2]) // Composite index
   ```

2. **Optimize queries**:
   ```typescript
   // Include only needed fields
   const users = await prisma.user.findMany({
     select: {
       id: true,
       name: true,
       // Don't select unnecessary fields
     }
   });
   ```

3. **Add response caching**:
   ```typescript
   // Add cache headers
   return NextResponse.json(data, {
     headers: {
       'Cache-Control': 'max-age=300', // 5 minutes
     },
   });
   ```

### Problem: Slow page loading
**Solutions**:
1. **Dynamic imports**:
   ```typescript
   const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
     loading: () => <p>Loading...</p>,
   });
   ```

2. **Image optimization**:
   ```tsx
   import Image from 'next/image';
   <Image
     src="/image.jpg"
     alt="Description"
     width={500}
     height={300}
     priority // For above-the-fold images
   />
   ```

---

## 🔍 Debugging Tools & Techniques

### Database Debugging
```bash
# View database in browser
npm run db:studio

# Execute raw SQL
npx prisma db execute --file query.sql

# Reset to known state
npm run db:push --force-reset
```

### API Debugging
```bash
# Test endpoints directly
curl -X POST http://localhost:3000/api/test \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'

# Check API logs
tail -f .next/trace
```

### Frontend Debugging
```javascript
// Add to components for debugging
console.log('Component state:', { state, props });

// React DevTools (browser extension)
// Vue.js devtools also work with React

// Check console for errors
// F12 -> Console tab
```

---

## 🗄️ Environment & Configuration Issues

### Problem: Environment variables not loading
**Debugging Steps**:
1. **Check file exists**:
   ```bash
   ls -la .env*
   ```

2. **Verify format**:
   ```bash
   # ✅ Correct format
   VARIABLE_NAME=value

   # ❌ Common mistakes
   VARIABLE_NAME = value  # Extra spaces
   VARIABLE_NAME="value"  # Quotes (usually not needed)
   ```

3. **Check loading**:
   ```javascript
   // Add to a page to debug
   console.log('Environment check:', {
     NODE_ENV: process.env.NODE_ENV,
     DATABASE_URL: process.env.DATABASE_URL ? '✅ Set' : '❌ Missing',
     ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ? '✅ Set' : '❌ Missing',
   });
   ```

4. **Restart server** (required after .env changes):
   ```bash
   # Stop server (Ctrl+C) and restart
   npm run dev
   ```

### Problem: "Module not found" errors
**Solutions**:
1. **Clear node_modules**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Check import paths**:
   ```typescript
   // ✅ Correct relative imports
   import Component from './Component';
   import util from '../utils/helper';

   // ✅ Correct alias imports (if configured)
   import Component from '@/components/Component';
   ```

3. **Verify tsconfig.json paths**:
   ```json
   {
     "compilerOptions": {
       "baseUrl": ".",
       "paths": {
         "@/*": ["./src/*"]
       }
     }
   }
   ```

---

## 🚀 Claude API Issues

### Problem: API rate limit exceeded
**Solutions**:
1. **Implement backoff**:
   ```typescript
   const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
   
   async function callClaudeWithRetry(prompt: string, maxRetries = 3) {
     for (let i = 0; i < maxRetries; i++) {
       try {
         return await anthropic.messages.create({...});
       } catch (error) {
         if (error.status === 429) {
           await delay(1000 * Math.pow(2, i)); // Exponential backoff
           continue;
         }
         throw error;
       }
     }
   }
   ```

2. **Batch requests**:
   ```typescript
   // Process in smaller batches
   const batchSize = 5;
   for (let i = 0; i < items.length; i += batchSize) {
     const batch = items.slice(i, i + batchSize);
     await Promise.all(batch.map(processItem));
     await delay(1000); // Pause between batches
   }
   ```

### Problem: Claude API returning errors
**Debugging**:
1. **Check API key**:
   ```bash
   # Test API key directly
   curl https://api.anthropic.com/v1/messages \
     -H "x-api-key: $ANTHROPIC_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"model":"claude-sonnet-4-20250514","max_tokens":100,"messages":[{"role":"user","content":"test"}]}'
   ```

2. **Validate request format**:
   ```typescript
   // Ensure proper message format
   const messages = [
     { role: "user", content: "Your prompt here" }
   ];
   // NOT: [{ role: "user", message: "..." }] // Wrong field name
   ```

---

## 🔄 Recovery Procedures

### Complete System Reset
```bash
# Nuclear option - reset everything
git stash  # Save current changes
git checkout main
rm -rf node_modules .next
npm install
npm run db:push --force-reset
npm run dev
```

### Rollback to Last Checkpoint
```bash
# View available checkpoints
git tag -l "checkpoint-*"

# Rollback to specific checkpoint
git checkout checkpoint-YYYYMMDD-HHMM

# Restore environment and dependencies
npm install
# Copy .env.local from backup and update secrets
npm run db:push
npm run dev
```

### Database Reset (Preserve Schema)
```bash
# Reset data but keep schema
npx prisma migrate reset --force
npm run db:push
```

---

## 📞 Getting Help

### Before Asking for Help
1. **Check this troubleshooting guide**
2. **Search error message in codebase**: `grep -r "error message" .`
3. **Check recent changes**: `git log --oneline -10`
4. **Verify system health**: `./scripts/restore-context.sh`

### Information to Include
- **Error message** (complete stack trace)
- **Steps to reproduce**
- **Environment** (OS, Node version: `node --version`)
- **Recent changes** (`git log --oneline -5`)
- **System health** (output of health checks)

### Emergency Contacts
- **Project Lead**: Check PROJECT_STATE.md for current contact
- **Technical Issues**: Use Linear issue tracking
- **System Outages**: Check Railway dashboard

---

## 📚 Reference Links

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Anthropic API Docs](https://docs.anthropic.com)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

### Project-Specific
- `PROJECT_STATE.md` - Current project status
- `TECHNICAL_DECISIONS.md` - Architecture decisions
- `API_DOCUMENTATION.md` - API reference
- `PROGRESS_TRACKING.md` - Development progress

---

**This troubleshooting guide prevents repetitive debugging and provides quick solutions to common issues encountered in the Functional Medicine Assessment System development.**
