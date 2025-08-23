# 🚨 NEVER AGAIN - Confusion Prevention Guide

## The Costly Mistake That's Now Fixed
**Hours wasted**: Recreating questions that already existed
**Root cause**: Questions were in files but not in database
**Solution**: Nuclear cleanup - ONE template, ONE source, ONE truth

## ✅ Current Truth (Memorize This)
- **Database Template ID**: `default`
- **Question Count**: 406
- **Location**: `/lib/assessment/questions/`
- **Status File**: `MASTER_STATUS.md`

## 🛑 STOP Before You...

### Think Questions Are Missing
```bash
# RUN THIS FIRST:
node checkpoint.js

# If it shows 406 questions, THEY'RE NOT MISSING
```

### Create New Question Files
- **DON'T** create new question files
- **USE** `/lib/assessment/questions/index.ts`
- **IT HAS** all 406 questions

### Create New Templates
- **DON'T** create new assessment templates
- **USE** template ID `default`
- **IT HAS** all 406 questions

### Start Coding Without Checking
```bash
# ALWAYS run this sequence:
node checkpoint.js          # Check system health
npx prisma studio           # Verify database has 406 questions
cat MASTER_STATUS.md        # Read current state
```

## ⚡ Quick Reference Commands

```bash
# System health check
node checkpoint.js

# View questions in database
npx prisma studio
# → Look for AssessmentTemplate
# → ID: default
# → questionBank: 406 items

# Start development server
npm run dev
# → Test at http://localhost:3000/test-simple

# If everything seems broken
node nuclear-cleanup.ts     # Last resort - cleans everything
```

## 🎯 The Only Things That Matter

| What | Where | Count/Status |
|------|-------|--------------|
| Template ID | `default` | ONE template only |
| Questions | Database | 406 verified |
| Source Files | `/lib/assessment/questions/` | Complete |
| Status | `MASTER_STATUS.md` | Single source of truth |
| Health Check | `checkpoint.js` | Run before work |

## 💡 New Session Checklist

When starting a new chat or work session:

1. ✅ Run `node checkpoint.js`
2. ✅ Read `MASTER_STATUS.md`
3. ✅ Check database has 406 questions
4. ✅ DON'T recreate what exists
5. ✅ BUILD the UI/API instead

## 🔴 Red Flags That You're About to Waste Time

If you find yourself:
- Creating new question files → STOP
- Making new templates → STOP
- Writing seed scripts → STOP
- Thinking questions are missing → RUN `checkpoint.js`

## ✅ What Actually Needs Building

Focus your energy on:
1. **Assessment UI** - Display questions to users
2. **API Endpoints** - Save responses, get next question
3. **AI Integration** - Claude branching logic
4. **Scoring System** - Calculate results
5. **Protocol Generation** - Create recommendations

NOT on questions - they're DONE!

## 📞 Emergency Recovery

If despite all this, things seem broken:

```bash
# 1. Check what's actually there
node checkpoint.js

# 2. Look at the database
npx prisma studio

# 3. If truly broken (it won't be), nuclear option:
node nuclear-cleanup.ts

# 4. Then restore from TypeScript files:
# The update-template.ts script is gone but the logic was:
# - Load questions from /lib/assessment/questions/index.ts
# - Update template ID 'default' with all questions
```

---

**THE QUESTIONS ARE NOT MISSING.**
**THEY'RE IN TEMPLATE ID: `default`**
**406 OF THEM.**
**STOP RECREATING THEM.**
**BUILD THE APP INSTEAD.**