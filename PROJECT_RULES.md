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

## Summary

**DEFAULT MODE: BUILD IT**

Unless explicitly told to stop or wait, continue building and implementing. Make reasonable decisions and move forward. The goal is rapid, autonomous development with minimal interruption.
