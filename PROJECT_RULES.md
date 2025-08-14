# FNTP Nutrition System - Automation Rules

## Core Automation Principles

### 1. **Maximum Automation**

- Execute ALL technical tasks without asking for confirmation
- Run all terminal commands directly
- Create, edit, and delete files as needed for the project
- Install dependencies and packages automatically
- Configure services and databases without intervention

### 2. **Continuous Development Flow**

- Complete multiple related tasks in sequence without stopping
- Build entire features end-to-end before pausing
- Only stop when genuinely blocked by missing information
- Batch operations together for efficiency

### 3. **Decision Making**

- Make reasonable technical decisions based on best practices
- Choose sensible defaults when options exist
- Implement industry-standard patterns without asking
- Only request input for business logic or user preferences

### 4. **Error Handling**

- Automatically retry failed operations with fixes
- Debug and resolve issues independently
- Research solutions and implement them
- Only escalate if truly blocked after multiple attempts

## Specific Automation Guidelines

### Terminal Operations

✅ **ALWAYS DO:**

- Run all commands directly
- Chain multiple commands together
- Install packages and dependencies
- Start/stop services
- Run database migrations
- Execute build processes
- Run tests and linters
- Create and modify files via terminal

### File Operations

✅ **ALWAYS DO:**

- Create new files and directories
- Edit existing files
- Delete temporary or outdated files
- Refactor code structures
- Update configurations
- Generate boilerplate code
- Create documentation

### Database Operations

✅ **ALWAYS DO:**

- Run all SQL queries
- Execute migrations
- Seed data
- Create backups
- Modify schemas
- Optimize queries

### Development Workflow

✅ **ALWAYS DO:**

- Implement complete features
- Create all related files (components, APIs, types, tests)
- Set up integrations
- Configure third-party services
- Build UI components
- Implement business logic
- Add error handling
- Create utility functions

## When to Pause

❌ **ONLY STOP FOR:**

1. Missing API keys or credentials
2. Business logic clarification
3. User preference on UI/UX design
4. Choice between fundamentally different architectures
5. Legal or compliance requirements
6. Budget or cost implications

## Implementation Strategy

### Feature Development

When building a feature, complete ALL of:

1. Database schema/models
2. API routes
3. Validation schemas
4. TypeScript types
5. UI components
6. Form handling
7. Error states
8. Loading states
9. Success feedback
10. Documentation

### Batch Operations

Group related tasks:

- Create all files for a feature at once
- Run all database operations together
- Install all dependencies in one command
- Build complete workflows without interruption

### Intelligent Defaults

Use these without asking:

- Industry-standard libraries
- Common design patterns
- Best practice implementations
- Conventional file structures
- Standard naming conventions
- Typical configuration options

## Error Resolution Flow

1. **First Attempt** - Try the original approach
2. **Debug** - Check logs and error messages
3. **Fix** - Implement corrections
4. **Retry** - Run again with fixes
5. **Alternative** - Try different approach if needed
6. **Research** - Look up solutions
7. **Implement** - Apply found solutions
8. **Only Then** - Ask for help if still blocked

## Project-Specific Rules

### For FNTP Nutrition System:

- Assume truck driver focus for all features
- Implement health tracking by default
- Include DOT compliance features
- Use PostgreSQL for all database needs
- Implement with security best practices
- Create intuitive UI without asking
- Handle file uploads automatically
- Process documents with OCR
- Integrate AI analysis seamlessly

## Development Pace

- Build aggressively and iterate
- Implement first, optimize later
- Create working versions quickly
- Add polish in subsequent passes
- Don't wait for perfection
- Ship features that work

# Environment Variables and Secret Management Rules

## CRITICAL: Never Modify .env Files Directly

**ABSOLUTE RULES - NEVER VIOLATE:**

1. NEVER overwrite or replace entire `.env.local` or `.env` files
2. NEVER display or echo actual API keys, passwords, or sensitive values in responses
3. NEVER suggest putting real secret values in code examples
4. ALWAYS use placeholder values like "your_api_key_here" in examples

**CAREFUL EDITS ALLOWED:**

- ADD missing environment variables to `.env.local` when specifically needed
- Use targeted edits (like `echo "NEW_VAR=value" >> .env.local`) to append variables
- ALWAYS backup before any edit: `cp .env.local .env.local.backup-$(date +%Y%m%d-%H%M%S)`
- NEVER use destructive commands like `cat >` or `echo >` that replace entire file content

## File Structure Requirements

When working with environment variables, ONLY work with these files:

- `.env.example` - Template file with placeholder values (safe to modify)
- `.env.sample` - Alternative template file (safe to modify)
- `.env.development.example` - Development template (safe to modify)
- `.env.production.example` - Production template (safe to modify)

## Standard Operating Procedures

### When Asked About Environment Variables:

1. First, check if `.env.example` exists in the project
2. If not, create `.env.example` with placeholder values
3. ALWAYS tell the user: "I've updated .env.example. Copy this to .env.local and add your actual values"
4. Remind user to ensure `.env.local` is in `.gitignore`

### When Creating New Projects:

1. ALWAYS create `.env.example` with all needed variables as placeholders
2. ALWAYS add `.env.local` and `.env` to `.gitignore`
3. NEVER create actual `.env` or `.env.local` files

### When Environment Variables Are Missing:

1. DO NOT attempt to read `.env.local` to check values
2. Instead say: "Please check your .env.local file contains [VARIABLE_NAME]"
3. Provide the expected format from `.env.example`

## Code Examples Format

When showing environment variable usage, ALWAYS format like this:

```javascript
// Correct - with validation and fallback
const apiKey = process.env.NEXT_PUBLIC_API_KEY;
if (!apiKey) {
  throw new Error("Missing NEXT_PUBLIC_API_KEY in environment variables");
}

// Show expected .env.example format:
// NEXT_PUBLIC_API_KEY=your_api_key_here
```

## Project Setup Checklist

When setting up environment configuration, ensure:

1. **Create .env.example** with:

   ```
   # API Keys
   NEXT_PUBLIC_API_KEY=your_api_key_here
   SECRET_API_KEY=your_secret_key_here

   # Database
   DATABASE_URL=postgresql://user:password@localhost:5432/dbname

   # Feature Flags
   NEXT_PUBLIC_ENABLE_FEATURE=false
   ```

2. **Update .gitignore** to include:

   ```
   # Environment files
   .env
   .env.local
   .env.*.local

   # Keep example files
   !.env.example
   !.env.*.example
   ```

3. **Create README section**:

   ```markdown
   ## Environment Setup

   1. Copy `.env.example` to `.env.local`
   2. Fill in your actual values in `.env.local`
   3. Never commit `.env.local` to version control
   ```

## Error Prevention

### Before Making Any File Changes:

1. Check if file exists and warn user if about to modify
2. If `.env.local` exists, STOP and ask user to manually backup
3. Only proceed with `.env.example` modifications

### When Debugging Environment Issues:

- Suggest user checks file exists: `ls -la .env*`
- Suggest user verifies variables are loaded: `console.log('Env loaded:', !!process.env.YOUR_VAR)`
- NEVER ask to cat, echo, or display `.env.local` contents

## Recovery Procedures

If user reports `.env.local` was overwritten:

1. Apologize immediately
2. Check if `.env.example` has correct structure
3. Advise user to restore from:
   - Their password manager
   - Secure backup location
   - Team's secret management system
4. Suggest implementing read-only protection: `chmod 444 .env.local`

## Framework-Specific Rules

### Next.js

- Public variables must start with `NEXT_PUBLIC_`
- Server-only variables should not have this prefix
- Always restart dev server after environment changes

### Vite/React

- Variables must start with `VITE_`
- Use `import.meta.env` instead of `process.env`

### Node.js/Express

- Use `dotenv` package configuration at app entry point
- Load before other imports

## Communication Templates

When user asks about missing environment variables:
"I see you need [VARIABLE_NAME]. I've added it to .env.example with a placeholder. Please copy this to your .env.local and add your actual [API key/value]."

When user reports issues:
"Let me help you set up the environment configuration properly. I'll create/update .env.example with the required structure. You'll need to copy this to .env.local and add your actual values."

## Summary

**Golden Rules:**

1. ONLY modify `.env.example`, NEVER `.env.local`
2. ALWAYS use placeholders in examples
3. ALWAYS remind users to copy example to .env.local
4. NEVER attempt to read or display actual secrets
5. PROTECT existing .env.local files at all costs

**Remember:** The .env.local file is sacred. It contains user's secrets. Never touch it. Only work with .example files.

## Summary

**DEFAULT MODE: BUILD IT**

Unless explicitly told to stop or wait, continue building and implementing. Make reasonable decisions and move forward. The goal is rapid, autonomous development with minimal interruption.
