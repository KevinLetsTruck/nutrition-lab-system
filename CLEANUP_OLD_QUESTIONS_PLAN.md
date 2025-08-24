# Old Question System Cleanup Plan

## Files to Delete (Old Functional Module Questions)

### Question Files
- `lib/assessment/questions/screening-questions.ts`
- `lib/assessment/questions/screening-questions-additional.ts`
- `lib/assessment/questions/assimilation-chunk1.ts`
- `lib/assessment/questions/assimilation-chunk2.ts`
- `lib/assessment/questions/assimilation-chunk3.ts`
- `lib/assessment/questions/assimilation-chunk4.ts`
- `lib/assessment/questions/assimilation-questions.ts`
- `lib/assessment/questions/biotransformation-questions.ts`
- `lib/assessment/questions/communication-questions.ts`
- `lib/assessment/questions/communication-questions-additional.ts`
- `lib/assessment/questions/defense-repair-questions.ts`
- `lib/assessment/questions/energy-questions.ts`
- `lib/assessment/questions/structural-questions.ts`
- `lib/assessment/questions/transport-questions.ts`

### Old Module System Files
- `lib/assessment/modules.ts` (old functional module definitions)
- `lib/assessment/assessment-service.ts` (if using old modules)
- `lib/assessment/assessment-service-fixed.ts` (if using old modules)

## Files to Update

### 1. `lib/assessment/questions/index.ts`
- Remove all imports of old question files
- Remove `legacyQuestions` export
- Remove `getQuestionsByModule` function
- Keep only body system imports and exports

### 2. `lib/assessment/types.ts`
- Remove `FunctionalModule` enum
- Update interfaces to remove references to old modules

### 3. API Routes That Need Updates
- `src/app/api/assessment/start/route.ts` - using old SCREENING module
- `src/app/api/assessment/debug/route.ts` - references old modules

### 4. AI Files
- `lib/ai/assessment-ai.ts` - remove FunctionalModule imports
- `lib/ai/assessment-orchestrator.ts` - remove if using old system

## Safe to Keep
- `lib/assessment/questions/body-systems/` - All new body system questions
- `lib/assessment/body-systems.ts` - New body system definitions
- `lib/assessment/body-system-modules.ts` - New module structure

## Execution Order
1. Update references in API routes first
2. Update types.ts to remove FunctionalModule
3. Clean up index.ts
4. Delete old question files
5. Delete old module system files
6. Test everything still works
