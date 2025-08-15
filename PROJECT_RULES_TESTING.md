# Testing & Issue Management Rules

## Issue Categories & Handling

### 🔴 TECHNICAL BLOCKERS (Immediate Action Required)
**Examples**: API failures, build errors, crashes, "Failed to fetch"
**Action**: STOP and fix immediately
**Process**:
1. Check browser console for full error
2. Copy error message and stack trace
3. If auth-related: Use test mode bypass
4. If API-related: Check route exists
5. Document fix in issue tracker

### 🟡 FUNCTIONAL BUGS (Log & Continue)
**Examples**: Wrong calculations, data not saving, incorrect flow
**Action**: Log in tracker, continue testing
**Priority**: Fix within same day if HIGH, batch if MEDIUM/LOW

### 🟢 DESIGN/UX ISSUES (Batch Processing)
**Examples**: Spacing, colors, confusing UI
**Action**: Log in tracker, fix in weekly batch
**Priority**: Usually LOW unless affects usability

### ⚠️ CONTENT ISSUES (High Priority)
**Examples**: Biasing messages, medical inaccuracy, poor wording
**Action**: Log as CRITICAL/HIGH, fix before release
**Note**: "Seed oils cause inflammation" type messages = CRITICAL

## Testing Workflow

### Before Testing Session:
```bash
# 1. Clear browser console
# 2. Open issue tracker: /dashboard/assessment-issues
# 3. Enable dev toolbar (Ctrl+Shift+D)
# 4. Note starting point
```

### During Testing:
1. **Quick Issue Logging**: 
   - Press `Ctrl+Shift+I` anywhere
   - Or use floating dev toolbar button
   - Add quick note and press Enter

2. **Detailed Issue Logging**:
   - Click "Log New Issue" in tracker
   - Fill all relevant fields
   - Mark "Blocks Testing" if applicable

3. **When Encountering Errors**:
   - Technical errors auto-log to tracker
   - Copy error details from error boundary
   - Check console for additional context

### After Testing:
1. Export issues report (markdown)
2. Review blocking issues
3. Prioritize fixes
4. Update status as work progresses

## Issue Priority Guide

### CRITICAL (Red/Orange - Fix Today)
- Crashes or prevents app use
- Security vulnerabilities  
- Biasing assessment content
- Medical misinformation

### HIGH (Yellow - Fix This Week)
- Major functionality broken
- Significant UX problems
- Incorrect calculations
- Missing critical features

### MEDIUM (Blue - Fix This Sprint)
- Minor functionality issues
- Moderate UX problems
- Performance issues
- Enhancement requests

### LOW (Green - Fix When Possible)
- Cosmetic issues
- Minor text changes
- Nice-to-have features
- Documentation updates

## Quick Fix Templates

### API Route Not Found
```typescript
// Add to /app/api/[route]/route.ts
export async function GET(request: Request) {
  return Response.json({ message: "Endpoint ready" });
}
```

### Auth Error
```typescript
// Temporary bypass for testing
if (process.env.NODE_ENV === 'development') {
  // Skip auth check
}
```

### Failed to Fetch
```typescript
// Check:
1. API route exists
2. Method matches (GET/POST)
3. Headers include Content-Type
4. Body is properly formatted
```

## Keyboard Shortcuts

- `Ctrl+Shift+I` - Quick log issue
- `Ctrl+Shift+D` - Toggle dev toolbar
- `Ctrl+Shift+E` - Export issues report

## Git Workflow for Fixes

### For BLOCKING issues:
```bash
git checkout -b hotfix/issue-id
# Make fix
git add -A
git commit -m "hotfix: [Issue ID] Brief description"
git checkout main
git merge hotfix/issue-id
```

### For regular issues:
```bash
git checkout -b fix/category-description
# Make fixes
git add -A  
git commit -m "fix(category): Brief description"
```

## Testing Environments

### Local Testing
- Use `npm run dev`
- Enable dev toolbar
- Test with different user roles

### Staging Testing
- Disable dev toolbar
- Test full user flow
- Verify all fixes work

### Production Monitoring
- Check error logs regularly
- Monitor user feedback
- Track issue patterns

## Remember

1. **Document Everything**: Even small issues can reveal patterns
2. **Test Systematically**: Follow user flows completely
3. **Prioritize User Impact**: Fix what affects users most
4. **Communicate Status**: Update issue tracker regularly
5. **Learn from Issues**: Add tests to prevent recurrence
