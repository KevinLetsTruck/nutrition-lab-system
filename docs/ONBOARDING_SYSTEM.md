# Comprehensive Client Onboarding System
## Functional Medicine Nutrition Practice

### System Overview
This onboarding system complements the NutriQ assessment by gathering comprehensive health information for optimal client care in functional medicine nutrition practice.

### Functional Medicine Intake Areas (Beyond NutriQ)

#### 1. Personal & Contact Information
- Basic demographics
- Emergency contact
- Preferred communication methods
- Insurance information (if applicable)

#### 2. Detailed Health History
- **Current Symptoms**: Timeline, severity, triggers, patterns
- **Medical History**: Diagnoses, surgeries, hospitalizations
- **Family History**: Genetic predispositions, family health patterns
- **Previous Treatments**: Conventional and alternative therapies
- **Allergies & Sensitivities**: Food, environmental, medication

#### 3. Medications & Supplements
- **Current Medications**: Dosage, frequency, duration, side effects
- **Supplements**: Current and past supplements, dosages, effects
- **Herbal Remedies**: Traditional and alternative treatments
- **Medication History**: Past medications and reasons for stopping

#### 4. Lifestyle & Environmental Factors
- **Sleep Patterns**: Quality, duration, sleep hygiene
- **Stress Levels**: Sources, management strategies, impact
- **Exercise**: Type, frequency, intensity, enjoyment
- **Environmental Exposures**: Work environment, home environment, toxins
- **Social Support**: Relationships, community involvement

#### 5. Digestive Health (Detailed)
- **Digestive Symptoms**: Bloating, gas, pain, irregularity
- **Food Reactions**: Immediate and delayed reactions
- **Gut Health History**: Infections, antibiotics, probiotics
- **Elimination Patterns**: Frequency, consistency, color
- **Appetite Patterns**: Hunger cues, cravings, satiety

#### 6. Hormonal Health
- **Energy Patterns**: Throughout day, seasonal variations
- **Mood Patterns**: Stability, triggers, seasonal changes
- **Menstrual Health**: (if applicable) Cycle regularity, symptoms
- **Temperature Regulation**: Heat/cold tolerance, sweating
- **Weight Patterns**: History, current challenges, distribution

#### 7. Pain & Inflammation
- **Pain Patterns**: Location, type, triggers, relief methods
- **Inflammation Signs**: Swelling, redness, stiffness
- **Joint Health**: Mobility, stiffness, previous injuries
- **Chronic Pain**: Duration, management strategies

#### 8. Goals & Priorities
- **Primary Health Goals**: What they want to achieve
- **Secondary Goals**: Additional areas for improvement
- **Timeline Expectations**: Short-term and long-term goals
- **Motivation Factors**: What drives their health journey
- **Barriers**: What might prevent success

### Database Schema Design

#### Client Table Extensions
```sql
-- Extend existing clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS:
- phone VARCHAR(20)
- emergency_contact_name VARCHAR(100)
- emergency_contact_phone VARCHAR(20)
- preferred_communication VARCHAR(20) -- email, phone, text
- insurance_provider VARCHAR(100)
- insurance_id VARCHAR(50)
- date_of_birth DATE
- gender VARCHAR(20)
- occupation VARCHAR(100)
- primary_health_concern TEXT
- onboarding_completed BOOLEAN DEFAULT FALSE
- onboarding_started_at TIMESTAMP
- onboarding_completed_at TIMESTAMP
```

#### New Tables
```sql
-- Client intake responses (JSONB for flexibility)
CREATE TABLE client_intake (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  section VARCHAR(50) NOT NULL, -- personal, health_history, medications, etc.
  responses JSONB NOT NULL,
  completed_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Client files with categories
CREATE TABLE client_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL, -- lab_reports, medical_records, food_photos, cgm_data, supplements
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB -- Additional file information
);

-- Onboarding progress tracking
CREATE TABLE onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  step VARCHAR(50) NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  data JSONB -- Step-specific data
);
```

### Multi-Step Onboarding Flow

#### Step 1: Welcome & Instructions
- Welcome message and process overview
- Estimated completion time (30-45 minutes)
- Privacy and data security information
- Progress saving explanation

#### Step 2: Personal & Contact Information
- Basic demographics
- Contact preferences
- Emergency contact
- Insurance information (optional)

#### Step 3: Health History & Current Symptoms
- Current health concerns and timeline
- Medical history and diagnoses
- Family health history
- Previous treatments and outcomes

#### Step 4: Medications & Supplements
- Current medications with details
- Supplement history and current use
- Herbal remedies and alternative treatments
- Medication allergies and sensitivities

#### Step 5: Lifestyle & Environmental Factors
- Sleep patterns and quality
- Stress levels and management
- Exercise and physical activity
- Environmental exposures and concerns

#### Step 6: Detailed Health Assessment
- Digestive health (detailed)
- Hormonal patterns and energy
- Pain and inflammation patterns
- Mood and mental health

#### Step 7: Goals & Priorities
- Primary and secondary health goals
- Timeline expectations
- Motivation factors
- Potential barriers and challenges

#### Step 8: File Uploads
- Lab reports and medical records
- Food photos and meal tracking
- CGM data and glucose monitoring
- Supplement photos and documentation

#### Step 9: Review & Submit
- Summary of all information
- Opportunity to edit any sections
- Final submission and confirmation
- Next steps and scheduling information

### UI/UX Design Principles

#### Design System
- **Theme**: Dark theme with professional healthcare aesthetic
- **Colors**: Navy, dark grays, with accent colors for different sections
- **Typography**: Clean, readable fonts with proper hierarchy
- **Spacing**: Generous white space for readability
- **Icons**: Medical and health-related icons for visual clarity

#### User Experience
- **Progress Indicator**: Clear visual progress through steps
- **Auto-save**: Automatic saving of progress every 30 seconds
- **Mobile Responsive**: Optimized for mobile and tablet use
- **Accessibility**: WCAG compliant with proper contrast and navigation
- **Validation**: Real-time validation with helpful error messages
- **Conditional Logic**: Show/hide fields based on previous answers

#### Professional Healthcare Feel
- **Trust Indicators**: Security badges, privacy notices
- **Medical Language**: Professional but understandable terminology
- **Comprehensive**: Thorough but not overwhelming
- **Efficient**: Streamlined process with clear value proposition

### Technical Implementation

#### Frontend Components
- Multi-step wizard with progress tracking
- Form components with validation
- File upload with categorization
- Auto-save functionality
- Mobile-responsive design

#### Backend API
- Intake form submission endpoints
- File upload and categorization
- Progress tracking and resumption
- Data validation and processing

#### Database Integration
- Secure storage of sensitive health data
- Proper indexing for performance
- Data integrity and validation
- Backup and recovery procedures

### Security & Privacy

#### Data Protection
- **Encryption**: All data encrypted in transit and at rest
- **Access Control**: Role-based access to client data
- **Audit Logging**: Track all access to sensitive information
- **Data Retention**: Clear policies for data retention and deletion

#### HIPAA Compliance
- **Privacy Notices**: Clear explanation of data use
- **Consent Management**: Explicit consent for data processing
- **Data Minimization**: Only collect necessary information
- **Secure Storage**: HIPAA-compliant data storage practices

### Integration with Existing System

#### NutriQ Integration
- Link onboarding data with NutriQ assessment results
- Comprehensive client profile creation
- Enhanced AI analysis with additional context
- Holistic health assessment combining all data sources

#### Workflow Integration
- Automatic notification to practice team
- Scheduling integration for next steps
- Dashboard updates for client progress
- Reporting and analytics for practice management 