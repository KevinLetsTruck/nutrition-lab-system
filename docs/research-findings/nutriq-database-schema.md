# 🔬 NutriQ Database Schema Design

**Research Track**: Advanced AI Features & NutriQ Integration  
**Component**: Historical Data Analysis Pipeline  
**Created**: January 25, 2025

## **Overview**

This schema extends our existing database to support comprehensive analysis of thousands of historical NutriQ assessments, enabling pattern recognition and diagnostic correlation analysis.

## **New Tables Design**

### **1. NutriQ Historical Assessments**
```sql
-- Store complete NutriQ assessment data for analysis
CREATE TABLE nutriq_assessments (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Client Demographics (anonymized for research)
  age_range VARCHAR,           -- "20-29", "30-39", etc.
  gender VARCHAR,              -- "male", "female", "other"
  location_region VARCHAR,     -- Geographic region for population studies
  
  -- Assessment Metadata
  assessment_date DATE,        -- When assessment was taken
  completion_status VARCHAR,   -- "completed", "partial", "abandoned"
  total_questions INTEGER,     -- Number of questions answered
  time_spent_minutes INTEGER,  -- Time to complete assessment
  
  -- Outcome Data (what we're trying to predict)
  primary_conditions TEXT[],   -- ["digestive_dysfunction", "adrenal_fatigue"]
  secondary_conditions TEXT[], -- Supporting conditions identified
  severity_scores JSONB,       -- {"digestive": 85, "adrenal": 72}
  treatment_outcome VARCHAR,   -- "excellent", "good", "moderate", "poor"
  follow_up_success BOOLEAN,   -- Did protocols work?
  
  -- Data Source & Quality
  source_system VARCHAR DEFAULT 'nutriq',
  data_quality_score FLOAT,   -- 0.0-1.0 based on completeness/consistency
  practitioner_validated BOOLEAN DEFAULT FALSE,
  validation_notes TEXT,
  
  -- Research Metadata
  anonymization_id VARCHAR UNIQUE, -- For connecting related data
  research_cohort VARCHAR,         -- For grouping similar cases
  analysis_flags TEXT[],           -- ["high_diagnostic_value", "edge_case"]
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_nutriq_demographics ON nutriq_assessments(age_range, gender);
CREATE INDEX idx_nutriq_outcomes ON nutriq_assessments USING GIN(primary_conditions);
CREATE INDEX idx_nutriq_quality ON nutriq_assessments(data_quality_score DESC);
CREATE INDEX idx_nutriq_analysis ON nutriq_assessments USING GIN(analysis_flags);
```

### **2. NutriQ Question Responses**
```sql
-- Individual question-answer pairs for correlation analysis
CREATE TABLE nutriq_responses (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id VARCHAR REFERENCES nutriq_assessments(id) ON DELETE CASCADE,
  
  -- Question Data
  question_id INTEGER NOT NULL,     -- Original NutriQ question ID
  question_text TEXT NOT NULL,      -- Full question text for analysis
  question_category VARCHAR,        -- Body system/functional area
  question_subcategory VARCHAR,     -- More specific grouping
  
  -- Response Data
  response_value INTEGER,           -- Numeric score (1-5 scale typically)
  response_text VARCHAR,            -- Text response if applicable
  response_confidence INTEGER,      -- How confident was respondent (1-5)
  
  -- Analysis Metadata
  diagnostic_weight FLOAT,          -- Statistical importance (0.0-1.0)
  correlation_strength JSONB,       -- {"digestive": 0.87, "thyroid": 0.23}
  predictive_value FLOAT,           -- How well this predicts outcomes
  population_percentile INTEGER,    -- Where this response ranks (1-100)
  
  -- Pattern Recognition
  pattern_flags TEXT[],             -- ["high_correlation", "outlier", "clustered"]
  cluster_assignment VARCHAR,       -- Which symptom cluster this belongs to
  
  answered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_nutriq_question ON nutriq_responses(question_id, response_value);
CREATE INDEX idx_nutriq_correlation ON nutriq_responses(diagnostic_weight DESC);
CREATE INDEX idx_nutriq_patterns ON nutriq_responses USING GIN(pattern_flags);
CREATE UNIQUE INDEX idx_nutriq_unique_response ON nutriq_responses(assessment_id, question_id);
```

### **3. Condition Definitions & Scoring**
```sql
-- Define the 15 target functional medicine conditions
CREATE TABLE functional_medicine_conditions (
  id VARCHAR PRIMARY KEY,           -- "digestive_dysfunction"
  name VARCHAR NOT NULL,            -- "Digestive Dysfunction"
  category VARCHAR,                 -- "gastrointestinal"
  
  -- Clinical Definition
  description TEXT,
  clinical_markers TEXT[],          -- Key symptoms/markers
  related_conditions TEXT[],        -- Commonly co-occurring conditions
  
  -- Diagnostic Criteria (derived from NutriQ analysis)
  primary_questions INTEGER[],      -- Most important question IDs
  secondary_questions INTEGER[],    -- Supporting question IDs
  exclusion_questions INTEGER[],    -- Questions that rule out condition
  
  -- Scoring Thresholds (machine learning derived)
  threshold_unlikely FLOAT,        -- 0-30: Condition unlikely
  threshold_possible FLOAT,        -- 31-50: Condition possible
  threshold_probable FLOAT,        -- 51-75: Condition probable
  threshold_definite FLOAT,        -- 76-100: Condition definite
  
  -- Mathematical Scoring
  base_score FLOAT DEFAULT 0.0,
  question_weights JSONB,          -- {"q1": 2.5, "q2": 1.8, "q3": 3.2}
  modifier_rules JSONB,            -- Complex scoring rules
  
  -- Validation Metrics
  diagnostic_accuracy FLOAT,       -- How accurate our scoring is
  false_positive_rate FLOAT,       -- Rate of incorrect positive diagnoses
  false_negative_rate FLOAT,       -- Rate of missed diagnoses
  validation_sample_size INTEGER,  -- Number of cases used for validation
  
  -- Research Metadata
  evidence_strength VARCHAR,       -- "strong", "moderate", "weak"
  literature_references TEXT[],    -- Supporting research
  practitioner_consensus FLOAT,    -- Agreement among practitioners (0-1)
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Seed with our 15 target conditions
INSERT INTO functional_medicine_conditions (id, name, category) VALUES
('digestive_dysfunction', 'Digestive Dysfunction', 'gastrointestinal'),
('adrenal_fatigue', 'Adrenal Fatigue/HPA Axis Dysfunction', 'endocrine'),
('thyroid_dysfunction', 'Thyroid Dysfunction', 'endocrine'),
('blood_sugar_dysregulation', 'Blood Sugar Dysregulation', 'metabolic'),
('chronic_inflammation', 'Chronic Inflammation', 'immune'),
('detoxification_impairment', 'Detoxification Impairment', 'hepatic'),
('hormonal_imbalances', 'Hormonal Imbalances', 'endocrine'),
('cardiovascular_dysfunction', 'Cardiovascular Dysfunction', 'cardiovascular'),
('immune_system_dysfunction', 'Immune System Dysfunction', 'immune'),
('neurotransmitter_imbalances', 'Neurotransmitter Imbalances', 'neurological'),
('mitochondrial_dysfunction', 'Mitochondrial Dysfunction', 'cellular'),
('food_sensitivities', 'Food Sensitivities/Allergies', 'immune'),
('heavy_metal_toxicity', 'Heavy Metal Toxicity', 'toxicological'),
('gut_microbiome_imbalances', 'Gut Microbiome Imbalances', 'gastrointestinal'),
('chronic_stress_response', 'Chronic Stress Response', 'neurological');
```

### **4. Pattern Analysis Results**
```sql
-- Store Claude AI analysis results and statistical patterns
CREATE TABLE nutriq_pattern_analysis (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Analysis Metadata
  analysis_type VARCHAR NOT NULL,   -- "correlation", "clustering", "prediction"
  model_version VARCHAR,            -- "claude-sonnet-4-20250514"
  analysis_date TIMESTAMP DEFAULT NOW(),
  sample_size INTEGER,              -- Number of assessments analyzed
  
  -- Pattern Discovery
  patterns_found JSONB,             -- Detailed pattern descriptions
  correlation_matrix JSONB,         -- Question-condition correlations
  cluster_assignments JSONB,        -- Symptom clustering results
  predictive_models JSONB,          -- Scoring algorithms
  
  -- Statistical Validation
  confidence_interval JSONB,        -- Statistical confidence measures
  p_values JSONB,                   -- Statistical significance
  r_squared FLOAT,                  -- Model fit quality
  cross_validation_score FLOAT,     -- Model generalization ability
  
  -- Diagnostic Insights
  top_diagnostic_questions JSONB,   -- Most valuable questions per condition
  question_weights JSONB,           -- Calculated importance weights
  threshold_recommendations JSONB,  -- Suggested diagnostic thresholds
  false_positive_predictors JSONB,  -- Patterns that cause misdiagnosis
  
  -- Performance Metrics
  processing_time_seconds INTEGER,
  tokens_used INTEGER,
  cost_estimate FLOAT,
  accuracy_metrics JSONB,
  
  -- Research Status
  peer_reviewed BOOLEAN DEFAULT FALSE,
  clinical_validated BOOLEAN DEFAULT FALSE,
  production_ready BOOLEAN DEFAULT FALSE,
  validation_notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_pattern_type ON nutriq_pattern_analysis(analysis_type);
CREATE INDEX idx_pattern_quality ON nutriq_pattern_analysis(r_squared DESC);
CREATE INDEX idx_pattern_date ON nutriq_pattern_analysis(analysis_date DESC);
```

### **5. Question Correlation Matrix**
```sql
-- Pre-calculated correlations for fast lookups
CREATE TABLE question_correlations (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Question Relationship
  question_id_a INTEGER NOT NULL,
  question_id_b INTEGER NOT NULL,
  
  -- Correlation Metrics
  pearson_correlation FLOAT,       -- Standard correlation (-1 to 1)
  spearman_correlation FLOAT,      -- Rank correlation
  mutual_information FLOAT,        -- Information theory measure
  
  -- Condition-Specific Correlations
  condition_correlations JSONB,    -- Per-condition correlation strengths
  
  -- Sample Statistics
  sample_size INTEGER,
  confidence_interval_low FLOAT,
  confidence_interval_high FLOAT,
  p_value FLOAT,
  
  -- Analysis Context
  analysis_cohort VARCHAR,         -- Which group this was calculated on
  last_updated TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(question_id_a, question_id_b, analysis_cohort)
);

CREATE INDEX idx_correlation_strength ON question_correlations(pearson_correlation DESC);
CREATE INDEX idx_correlation_questions ON question_correlations(question_id_a, question_id_b);
```

### **6. Diagnostic Scoring Cache**
```sql
-- Pre-calculated scores for performance optimization
CREATE TABLE diagnostic_scores_cache (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Assessment Reference
  assessment_id VARCHAR REFERENCES nutriq_assessments(id),
  condition_id VARCHAR REFERENCES functional_medicine_conditions(id),
  
  -- Calculated Scores
  raw_score FLOAT,                  -- Base mathematical score
  weighted_score FLOAT,             -- Adjusted for demographics/modifiers
  percentile_score INTEGER,         -- Population percentile (1-100)
  probability FLOAT,                -- Likelihood of condition (0-1)
  
  -- Diagnostic Classification
  diagnostic_category VARCHAR,      -- "unlikely", "possible", "probable", "definite"
  confidence_level VARCHAR,         -- "low", "medium", "high"
  evidence_strength VARCHAR,        -- "weak", "moderate", "strong"
  
  -- Supporting Data
  contributing_questions JSONB,     -- Which questions drove the score
  modifier_effects JSONB,           -- Demographic/other adjustments
  competing_conditions JSONB,       -- Other conditions to consider
  
  -- Performance Metadata
  calculation_version VARCHAR,      -- Algorithm version used
  calculated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,             -- When to recalculate
  
  UNIQUE(assessment_id, condition_id)
);

CREATE INDEX idx_scores_condition ON diagnostic_scores_cache(condition_id, probability DESC);
CREATE INDEX idx_scores_assessment ON diagnostic_scores_cache(assessment_id);
CREATE INDEX idx_scores_performance ON diagnostic_scores_cache(diagnostic_category, confidence_level);
```

## **Integration with Existing System**

### **Relationship to SimpleAssessment**
The NutriQ tables are designed to complement, not replace, the existing SimpleAssessment system:

- **SimpleAssessment**: Current 80-question system for active client assessments
- **nutriq_assessments**: Historical data for research and algorithm training
- **Shared Learning**: Insights from NutriQ analysis improve SimpleAssessment scoring

### **Data Flow**
1. **Import**: Historical NutriQ CSV data → `nutriq_assessments` + `nutriq_responses`
2. **Analyze**: Claude AI processes data → `nutriq_pattern_analysis`
3. **Calculate**: Correlations and scoring algorithms → `question_correlations`, `functional_medicine_conditions`
4. **Apply**: Use insights to enhance `SimpleAssessment` scoring
5. **Validate**: Compare predictions against actual outcomes

## **Next Implementation Steps**

1. **Create Migration**: Add these tables to Prisma schema
2. **Build CSV Import**: System to load historical NutriQ data
3. **Claude Analysis Engine**: AI-powered pattern recognition
4. **Correlation Calculator**: Statistical analysis algorithms
5. **Scoring System**: Mathematical models for condition likelihood

---
**Schema Version**: 1.0  
**Created**: January 25, 2025  
**Status**: Design Complete - Ready for Implementation