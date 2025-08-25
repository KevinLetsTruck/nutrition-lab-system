#!/bin/bash

# Checkpoint Creation Script - Functional Medicine Assessment System
# Creates a rollback point with comprehensive state capture

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get checkpoint description from command line or prompt
DESCRIPTION="$1"
if [ -z "$DESCRIPTION" ]; then
    echo -e "${YELLOW}📝 Enter checkpoint description:${NC}"
    read -r DESCRIPTION
fi

if [ -z "$DESCRIPTION" ]; then
    echo -e "${RED}❌ Description required${NC}"
    exit 1
fi

echo -e "${BLUE}🔖 Creating Checkpoint: $DESCRIPTION${NC}"
echo "================================================="

PROJECT_ROOT="/Users/kr/fntp-nutrition-system"
cd "$PROJECT_ROOT"

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
CHECKPOINT_TAG="checkpoint-$TIMESTAMP"

echo -e "${YELLOW}Step 1: Pre-checkpoint validation${NC}"
echo "=================================="

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ Not a git repository${NC}"
    exit 1
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${GREEN}✅ Found uncommitted changes${NC}"
    git status --short
else
    echo -e "${YELLOW}ⓘ No uncommitted changes found${NC}"
fi

echo ""
echo -e "${YELLOW}Step 2: Backup current state${NC}"
echo "=============================="

# Create backup directory
BACKUP_DIR="backups/checkpoint-$TIMESTAMP"
mkdir -p "$BACKUP_DIR"

# Backup environment files (without secrets)
if [ -f ".env.local" ]; then
    # Create sanitized version of .env.local
    grep -E "^[A-Z_]+=" .env.local | sed 's/=.*/=***REDACTED***/' > "$BACKUP_DIR/env.template"
    echo -e "${GREEN}✅ Environment template backed up${NC}"
fi

# Backup package.json and lock file
cp package.json "$BACKUP_DIR/" 2>/dev/null || true
cp package-lock.json "$BACKUP_DIR/" 2>/dev/null || true

# Backup critical config files
cp next.config.js "$BACKUP_DIR/" 2>/dev/null || true
cp prisma/schema.prisma "$BACKUP_DIR/" 2>/dev/null || true

echo -e "${GREEN}✅ Configuration files backed up to $BACKUP_DIR${NC}"

echo ""
echo -e "${YELLOW}Step 3: Database state capture${NC}"
echo "==============================="

# Capture database schema and basic metrics
if command -v npx >/dev/null 2>&1 && [ -f "prisma/schema.prisma" ]; then
    echo "Capturing database schema..."
    npx prisma db pull --force --silent > /dev/null 2>&1 || true
    
    # Create database state summary
    cat > "$BACKUP_DIR/database-state.md" << EOF
# Database State - $TIMESTAMP

## Schema Status
- Schema file: $([ -f "prisma/schema.prisma" ] && echo "✅ Present" || echo "❌ Missing")
- Migrations: $([ -d "prisma/migrations" ] && find prisma/migrations -name "*.sql" | wc -l || echo "0") files

## Timestamp
Created: $(date)
Checkpoint: $CHECKPOINT_TAG

## Notes
$DESCRIPTION
EOF

    echo -e "${GREEN}✅ Database state documented${NC}"
else
    echo -e "${YELLOW}⚠️  Prisma not available - skipping database capture${NC}"
fi

echo ""
echo -e "${YELLOW}Step 4: Update project state${NC}"
echo "============================="

# Update PROJECT_STATE.md with checkpoint info
if [ -f "PROJECT_STATE.md" ]; then
    # Create a backup first
    cp PROJECT_STATE.md "$BACKUP_DIR/"
    
    # Add checkpoint info to the file (this would be more sophisticated in practice)
    echo "<!-- CHECKPOINT: $CHECKPOINT_TAG - $DESCRIPTION - $(date) -->" >> PROJECT_STATE.md
    echo -e "${GREEN}✅ PROJECT_STATE.md updated${NC}"
fi

echo ""
echo -e "${YELLOW}Step 5: Commit all changes${NC}"
echo "=========================="

# Add all files
git add -A

# Create comprehensive commit message
COMMIT_MESSAGE="CHECKPOINT: $DESCRIPTION

Created: $(date)
Tag: $CHECKPOINT_TAG
Backup: $BACKUP_DIR

Changes included:
$(git diff --cached --name-status | head -10)
$([ $(git diff --cached --name-status | wc -l) -gt 10 ] && echo "... and $(($(git diff --cached --name-status | wc -l) - 10)) more files")

This checkpoint provides a rollback point for the Functional Medicine Assessment System development."

# Commit changes
git commit -m "$COMMIT_MESSAGE"
echo -e "${GREEN}✅ Changes committed${NC}"

echo ""
echo -e "${YELLOW}Step 6: Create git tag${NC}"
echo "======================"

# Create annotated tag
git tag -a "$CHECKPOINT_TAG" -m "Checkpoint: $DESCRIPTION

Created: $(date)
Backup: $BACKUP_DIR

This tag marks a stable point in the Functional Medicine Assessment System development.
Use 'git checkout $CHECKPOINT_TAG' to restore this exact state.

Rollback procedure:
1. git checkout $CHECKPOINT_TAG
2. Restore environment from $BACKUP_DIR/env.template
3. Run npm install
4. Run npm run db:push (if database changes needed)
5. Run npm run dev"

echo -e "${GREEN}✅ Git tag '$CHECKPOINT_TAG' created${NC}"

echo ""
echo -e "${YELLOW}Step 7: System health verification${NC}"
echo "=================================="

# Quick health checks
echo "Verifying system state..."

# Check if package.json exists and is valid
if node -e "require('./package.json')" 2>/dev/null; then
    echo -e "${GREEN}✅ package.json valid${NC}"
else
    echo -e "${RED}❌ package.json invalid${NC}"
fi

# Check if prisma schema is valid
if npx prisma validate 2>/dev/null; then
    echo -e "${GREEN}✅ Prisma schema valid${NC}"
else
    echo -e "${YELLOW}⚠️  Prisma schema validation failed${NC}"
fi

echo ""
echo -e "${YELLOW}Step 8: Generate rollback instructions${NC}"
echo "======================================"

# Create rollback instructions
cat > "$BACKUP_DIR/ROLLBACK_INSTRUCTIONS.md" << EOF
# Rollback Instructions - $CHECKPOINT_TAG

## Quick Rollback
\`\`\`bash
git checkout $CHECKPOINT_TAG
npm install
cp backups/$BACKUP_DIR/env.template .env.local
# Edit .env.local to add actual secrets
npm run db:push
npm run dev
\`\`\`

## Full Environment Restore
\`\`\`bash
# 1. Restore code
git checkout $CHECKPOINT_TAG

# 2. Restore dependencies
npm ci

# 3. Restore environment
cp backups/$BACKUP_DIR/env.template .env.local
# IMPORTANT: Edit .env.local and replace ***REDACTED*** with actual values

# 4. Restore database (if needed)
npm run db:push

# 5. Start development
npm run dev
\`\`\`

## Verification Steps
After rollback, verify:
- [ ] Application starts: \`npm run dev\`
- [ ] Database connects: \`npm run db:studio\`
- [ ] Tests pass: \`npm run test\` (if available)
- [ ] Environment complete: Check all required .env.local variables

## Created
$(date)

## Description
$DESCRIPTION

## Files Backed Up
$(ls -la $BACKUP_DIR/)
EOF

echo -e "${GREEN}✅ Rollback instructions created${NC}"

echo ""
echo -e "${BLUE}🎉 Checkpoint Created Successfully!${NC}"
echo "=================================="
echo ""
echo -e "${GREEN}Checkpoint Tag:${NC} $CHECKPOINT_TAG"
echo -e "${GREEN}Backup Location:${NC} $BACKUP_DIR"
echo -e "${GREEN}Description:${NC} $DESCRIPTION"
echo ""
echo -e "${YELLOW}Quick Commands:${NC}"
echo "  View all checkpoints:    git tag -l 'checkpoint-*'"
echo "  Rollback to checkpoint:  git checkout $CHECKPOINT_TAG"
echo "  View rollback guide:     cat $BACKUP_DIR/ROLLBACK_INSTRUCTIONS.md"
echo "  Delete this checkpoint:  git tag -d $CHECKPOINT_TAG"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "1. Continue development with confidence"
echo "2. Create new checkpoints at major milestones"
echo "3. Use rollback if needed: git checkout $CHECKPOINT_TAG"
echo ""
echo "================================================="

# Output summary to a log file
echo "$(date): Created checkpoint '$CHECKPOINT_TAG' - $DESCRIPTION" >> checkpoints.log
