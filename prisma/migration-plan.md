# Database Migration Plan: Supabase to Prisma

## Executive Summary

This plan outlines the migration from the current Supabase-based database to a comprehensive Prisma ORM schema optimized for an FNTP (Functional Nutrition Therapy Practice) with special focus on truck driver clients.

## Current State Analysis

### Existing Tables to Migrate

1. **Authentication System**
   - `users` → Keep, enhance with Prisma
   - `client_profiles` → Merge into enhanced `Client` model
   - `admin_profiles` → Convert to `Practitioner` model
   - `user_sessions` → Rename to `Session`
   - `email_verifications` → Remove (use magic links)
   - `rate_limits` → Keep for API protection

2. **Client Management**
   - `clients` → Enhance with truck driver fields
   - `onboarding_sessions` → Temporary, can archive
   - `onboarding_progress` → Merge into Client

3. **Lab & Health Data**
   - `lab_reports` → Convert to `LabResult` with better structure
   - `nutriq_results` → Keep as assessment type
   - `kbmo_results` → Keep as lab result type
   - `dutch_results` → Keep as lab result type
   - `cgm_data` → Archive or convert to progress metrics

4. **AI & Analysis**
   - `ai_conversations` → Convert to `Assessment`
   - `conversation_messages` → Part of assessment responses
   - `conversation_analysis` → Part of assessment analysis
   - `comprehensive_analyses` → Convert to `Protocol`
   - `supplement_recommendations` → Keep, enhance

5. **Documents & Files**
   - `client_files` → Convert to `Document`
   - `documents` (versioning) → Merge into Document

6. **Clinical Data**
   - `notes` → Enhance with types and privacy
   - `protocol_recommendations` → Convert to `Protocol`
   - `progress_tracking` → Rename to `ProgressMetric`

## Migration Steps

### Phase 1: Schema Setup (Week 1)

1. **Install and Configure Prisma**
   ```bash
   npm install prisma @prisma/client
   npx prisma init
   ```

2. **Create Initial Schema**
   - Copy `schema-complete.prisma` to `prisma/schema.prisma`
   - Configure database connection
   - Generate Prisma client

3. **Create Migration**
   ```bash
   npx prisma migrate dev --name initial_fntp_schema
   ```

### Phase 2: Data Migration (Week 2-3)

1. **User & Auth Migration**
   ```sql
   -- Migrate users (already compatible)
   -- Create practitioners from admin_profiles
   INSERT INTO practitioners (user_id, name, title)
   SELECT user_id, name, title FROM admin_profiles;
   ```

2. **Client Data Migration**
   ```sql
   -- Merge clients and client_profiles
   UPDATE clients SET 
     user_id = cp.user_id,
     health_goals = cp.onboarding_data->'healthGoals'
   FROM client_profiles cp
   WHERE clients.email = (
     SELECT email FROM users WHERE users.id = cp.user_id
   );
   ```

3. **Lab Reports Migration**
   ```sql
   -- Convert lab_reports to lab_results
   INSERT INTO lab_results (
     id, client_id, lab_name, test_type, test_date,
     results, ai_interpretation
   )
   SELECT 
     id, client_id, 
     'Unknown' as lab_name,
     report_type::lab_test_type,
     report_date,
     analysis_results,
     analysis_results->'aiAnalysis'
   FROM lab_reports;
   ```

4. **Assessment Migration**
   ```sql
   -- Convert ai_conversations to assessments
   INSERT INTO assessments (
     client_id, type, status, responses, ai_analysis
   )
   SELECT 
     client_id,
     assessment_type::assessment_type,
     CASE status 
       WHEN 'completed' THEN 'COMPLETED'::assessment_status
       ELSE 'IN_PROGRESS'::assessment_status
     END,
     metadata,
     (SELECT results FROM conversation_analysis WHERE conversation_id = ai_conversations.id)
   FROM ai_conversations;
   ```

5. **Protocol Migration**
   ```sql
   -- Convert comprehensive_analyses to protocols
   INSERT INTO protocols (
     client_id, name, type, phases, dietary_guidelines
   )
   SELECT 
     client_id,
     'Comprehensive Protocol ' || to_char(analysis_date, 'MM/DD/YYYY'),
     'COMPREHENSIVE'::protocol_type,
     treatment_phases,
     supplement_protocol
   FROM comprehensive_analyses;
   ```

### Phase 3: Application Code Update (Week 3-4)

1. **Replace Supabase Client**
   ```typescript
   // Before
   import { supabase } from '@/lib/supabase'
   const { data } = await supabase.from('clients').select()
   
   // After
   import { prisma } from '@/lib/prisma'
   const data = await prisma.client.findMany()
   ```

2. **Update API Routes**
   - Convert all Supabase queries to Prisma
   - Update error handling
   - Add proper TypeScript types

3. **Update Components**
   - Use Prisma-generated types
   - Update data fetching logic

### Phase 4: Testing & Validation (Week 4)

1. **Data Integrity Checks**
   - Verify all records migrated
   - Check foreign key relationships
   - Validate JSON data structure

2. **Application Testing**
   - Test all CRUD operations
   - Verify authentication flow
   - Test file uploads

3. **Performance Testing**
   - Query performance comparison
   - Index effectiveness
   - Connection pooling

### Phase 5: Cutover (Week 5)

1. **Final Data Sync**
   - Sync any new data since migration start
   - Verify data completeness

2. **DNS/Environment Update**
   - Update DATABASE_URL
   - Remove Supabase variables
   - Deploy Prisma schema

3. **Monitor & Support**
   - Watch error logs
   - Monitor performance
   - Be ready to rollback

## Code Migration Examples

### Before (Supabase)
```typescript
// Get client with lab reports
const { data: client } = await supabase
  .from('clients')
  .select(`
    *,
    lab_reports (
      *,
      nutriq_results (*)
    )
  `)
  .eq('id', clientId)
  .single()
```

### After (Prisma)
```typescript
// Get client with lab results
const client = await prisma.client.findUnique({
  where: { id: clientId },
  include: {
    labResults: {
      where: { testType: 'NUTRIQ' },
      orderBy: { testDate: 'desc' }
    }
  }
})
```

## Risk Mitigation

1. **Data Loss Prevention**
   - Full backup before migration
   - Incremental migration approach
   - Ability to run both systems in parallel

2. **Downtime Minimization**
   - Use read replica for migration
   - Blue-green deployment
   - Feature flags for gradual rollout

3. **Rollback Plan**
   - Keep Supabase instance running
   - Database connection switch
   - Code revert procedure

## Benefits After Migration

1. **Type Safety**: Full TypeScript support with generated types
2. **Better Relations**: Easier to work with complex relationships
3. **Performance**: Optimized queries with Prisma's query engine
4. **Developer Experience**: Better IDE support and autocomplete
5. **Flexibility**: Easier to add truck driver specific features
6. **Maintainability**: Single source of truth for schema

## Timeline

- **Week 1**: Schema setup and initial migration scripts
- **Week 2-3**: Data migration and testing
- **Week 3-4**: Application code updates
- **Week 4**: Testing and validation
- **Week 5**: Cutover and monitoring

Total estimated time: 5 weeks with buffer for issues
