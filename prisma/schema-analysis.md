# Nutrition Lab System - Database Schema Analysis

## Current Database Architecture

### Core User Management

#### users
- **Purpose**: Central authentication and user management
- **Relationships**: One-to-one with client_profiles or admin_profiles
- **Key Fields**: email (unique), password_hash, role (client/admin), email_verified, onboarding_completed

#### client_profiles  
- **Purpose**: Extended profile data for client users
- **Relationships**: Belongs to users
- **JSON/JSONB**: onboarding_data (health goals, dietary restrictions, medications)

#### admin_profiles
- **Purpose**: Extended profile data for admin/practitioner users
- **Relationships**: Belongs to users
- **Arrays**: specializations, email_sequence_status

### Client Data Management

#### clients
- **Purpose**: Core client record for lab reports and health data
- **Relationships**: Has many lab_reports, ai_conversations, notes, etc.
- **Key Fields**: email (unique), first_name, last_name, date_of_birth, medical_history
- **Note**: Separate from client_profiles - used for lab report system

### Lab Reports & Results

#### lab_reports
- **Purpose**: Container for all types of lab reports
- **Relationships**: Belongs to clients, has one nutriq_results/kbmo_results/etc.
- **JSON/JSONB**: analysis_results (flexible storage for various report types)
- **Enums**: report_type (nutriq, kbmo, dutch, cgm, food_photo, fit_test, stool_test, blood_test)

#### nutriq_results
- **Purpose**: NutriQ/NAQ assessment results
- **Relationships**: Belongs to lab_reports
- **JSON/JSONB**: system_scores, deficiencies, recommendations

#### kbmo_results
- **Purpose**: KBMO food sensitivity test results
- **JSON/JSONB**: high/moderate/low_sensitivity_foods

#### dutch_results
- **Purpose**: DUTCH hormone test results
- **JSON/JSONB**: organic_acid_metabolites

### AI & Conversation System

#### ai_conversations
- **Purpose**: Track AI-powered assessment conversations
- **Relationships**: Belongs to clients, has many conversation_messages
- **JSON/JSONB**: metadata

#### conversation_messages
- **Purpose**: Individual messages in AI conversations
- **JSON/JSONB**: structured_response

#### conversation_analysis
- **Purpose**: AI analysis results from conversations
- **JSON/JSONB**: results

### Comprehensive Analysis System

#### comprehensive_analyses
- **Purpose**: Complete functional medicine analysis
- **Relationships**: Belongs to clients, has many supplement_recommendations
- **JSON/JSONB**: root_causes, systems_priority, supplement_protocol, treatment_phases
- **Arrays**: urgent_concerns

#### supplement_recommendations
- **Purpose**: Detailed supplement protocols
- **Relationships**: Belongs to comprehensive_analyses
- **Key Fields**: source (LetsTrack/Biotics/Fullscript), phase (1/2/3), truck_compatible

#### progress_tracking
- **Purpose**: Track client health metrics over time
- **Relationships**: Belongs to clients

### Document Management

#### client_files
- **Purpose**: Store uploaded documents (lab PDFs, etc.)
- **Relationships**: Belongs to clients
- **JSON/JSONB**: metadata

#### documents (from document versioning system)
- **Purpose**: Version-controlled document storage
- **JSON/JSONB**: metadata

### Session & Auth Support

#### user_sessions
- **Purpose**: JWT session management
- **Relationships**: Belongs to users

#### email_verifications
- **Purpose**: Email verification tokens
- **Relationships**: Belongs to users

#### rate_limits
- **Purpose**: API rate limiting
- **Indexes**: composite on identifier + action

### Onboarding System

#### onboarding_sessions
- **Purpose**: Temporary onboarding state
- **JSON/JSONB**: session_data

#### onboarding_progress
- **Purpose**: Track client onboarding completion
- **Arrays**: steps_completed
- **JSON/JSONB**: progress_data

### Clinical Notes & Protocols

#### notes
- **Purpose**: Practitioner notes on clients
- **Relationships**: Belongs to clients and users (author)

#### protocol_recommendations
- **Purpose**: Treatment protocol storage
- **JSON/JSONB**: recommendations

## Required Indexes

### Performance Critical
- clients.email (unique)
- users.email (unique)
- lab_reports: compound index on (client_id, report_type, status)
- ai_conversations: compound index on (client_id, assessment_type)
- user_sessions.token_hash
- onboarding_sessions.token

### Foreign Key Indexes
- All foreign key columns have indexes for join performance

## Data Type Patterns

### JSON/JSONB Usage
1. **Flexible Medical Data**: analysis_results, test results
2. **Configuration**: onboarding_data, session_data
3. **Complex Structures**: root_causes, treatment_phases, supplement_protocol
4. **Arrays of Objects**: sensitivity foods, metabolites

### Array Fields
- urgent_concerns (text[])
- specializations (text[])
- steps_completed (text[])
- email_sequence_status (text[])

### Enums
- user_role: 'client' | 'admin'
- report_type: Various lab report types
- processing_status: 'pending' | 'processing' | 'completed' | 'failed'
- Source options for supplements
- Artifact types for reports

## Migration Considerations

### From Supabase to Prisma
1. **UUID Generation**: Supabase uses uuid_generate_v4(), Prisma uses cuid() or uuid()
2. **Timestamps**: Ensure timezone handling matches
3. **RLS Policies**: Need to implement in application layer
4. **Triggers**: updated_at triggers need Prisma @updatedAt
5. **Views**: Client analysis summary view needs to be query in app

### Data Relationships
- Strong foreign key constraints throughout
- Cascade deletes on client data
- Proper indexes for all relationships

## Recommendations for FNTP Practice Schema

Based on analysis, the schema should include:

1. **Enhanced Client Model**: Add truck driver specific fields
2. **Assessment Types**: NAQ, health history, food diary
3. **Document Categories**: Lab reports, medical records, insurance
4. **Protocol Phases**: Treatment phases with timing
5. **Appointment Scheduling**: Integration with practice management
6. **Supplement Tracking**: Inventory and compliance monitoring
7. **Progress Metrics**: Symptom tracking over time
8. **Communication Log**: Client interactions and touchpoints
