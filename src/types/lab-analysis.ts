// Lab Analysis System Types

export interface LabTestCatalog {
  id: string
  test_code: string
  test_name: string
  category: 'metabolic' | 'hormones' | 'inflammation' | 'nutritional' | 'functional'
  subcategory?: string
  unit?: string
  standard_range_low?: number
  standard_range_high?: number
  optimal_range_low?: number
  optimal_range_high?: number
  truck_driver_range_low?: number
  truck_driver_range_high?: number
  critical_low?: number
  critical_high?: number
  description?: string
  clinical_significance?: string
  truck_driver_considerations?: string
  related_patterns?: string[]
  interpretation_notes?: Record<string, any>
  created_at: Date
  updated_at: Date
}

export interface LabResult {
  id: string
  client_id: string
  lab_name?: string
  collection_date?: Date
  report_date?: Date
  file_url?: string
  file_type?: 'pdf' | 'image'
  processing_status: 'pending' | 'processing' | 'completed' | 'failed'
  processing_error?: string
  raw_text?: string
  structured_data?: Record<string, any>
  ai_analysis?: AIAnalysis
  detected_patterns?: LabPattern[]
  confidence_scores?: ConfidenceScores
  created_at: Date
  updated_at: Date
}

export interface LabValue {
  id: string
  lab_result_id: string
  test_catalog_id?: string
  test_name: string
  value?: number
  value_text?: string
  unit?: string
  reference_range?: string
  flag?: 'H' | 'L' | 'HH' | 'LL' | 'C'
  is_optimal?: boolean
  is_truck_driver_optimal?: boolean
  interpretation?: string
  created_at: Date
}

export interface LabPattern {
  id?: string
  pattern_name: string
  pattern_category: 'metabolic' | 'hormonal' | 'inflammatory' | 'nutritional'
  confidence_score: number
  supporting_markers: SupportingMarker[]
  clinical_significance?: string
  truck_driver_impact?: string
  priority_level: 'immediate' | 'high' | 'moderate' | 'low'
  created_at?: Date
}

export interface SupportingMarker {
  test_name: string
  value: number | string
  unit?: string
  contribution: 'primary' | 'supporting' | 'confirming'
  interpretation: string
}

export interface LabProtocol {
  id: string
  lab_result_id: string
  client_id: string
  protocol_type: 'supplement' | 'dietary' | 'lifestyle' | 'retest'
  priority: 'immediate' | 'short_term' | 'long_term'
  title: string
  description: string
  specific_recommendations?: Recommendation[]
  supplement_protocol?: SupplementProtocol
  dietary_modifications?: DietaryModification[]
  lifestyle_interventions?: LifestyleIntervention[]
  retest_schedule?: RetestSchedule
  truck_driver_adaptations?: string
  created_at: Date
}

export interface Recommendation {
  category: string
  action: string
  rationale: string
  expected_outcome: string
  timeline: string
}

export interface SupplementProtocol {
  supplements: SupplementRecommendation[]
  total_monthly_cost?: number
  sourcing_priority: string[]
}

export interface SupplementRecommendation {
  name: string
  dosage: string
  frequency: string
  timing: string
  duration: string
  source: 'letsTruck' | 'biotics' | 'fullscript'
  product_recommendation?: string
  rationale: string
  precautions?: string
}

export interface DietaryModification {
  category: string
  recommendation: string
  truck_driver_friendly: boolean
  alternatives: string[]
  meal_timing?: string
}

export interface LifestyleIntervention {
  area: 'sleep' | 'exercise' | 'stress' | 'environment'
  recommendation: string
  truck_cab_adaptation: string
  priority: 'high' | 'medium' | 'low'
}

export interface RetestSchedule {
  urgent_retest?: string[]
  three_month_retest?: string[]
  six_month_retest?: string[]
  annual_retest?: string[]
}

export interface CGMData {
  id: string
  client_id: string
  device_type: 'dexcom_g6' | 'freestyle_libre' | 'other'
  reading_datetime: Date
  glucose_value: number
  trend_arrow?: 'rising_rapidly' | 'rising' | 'stable' | 'falling' | 'falling_rapidly'
  meal_tag?: string
  notes?: string
  screenshot_url?: string
  extracted_from_image: boolean
  created_at: Date
}

export interface PatternLibrary {
  id: string
  pattern_name: string
  pattern_category: string
  description: string
  required_markers: string[]
  optional_markers?: string[]
  detection_rules: PatternDetectionRule[]
  clinical_interpretation: string
  functional_medicine_approach: string
  truck_driver_considerations: string
  intervention_priority: 'immediate' | 'high' | 'moderate' | 'low'
  created_at: Date
  updated_at: Date
}

export interface PatternDetectionRule {
  marker: string
  operator: '>' | '<' | '>=' | '<=' | '=' | 'between'
  value: number | [number, number]
  weight?: number
}

export interface AIAnalysis {
  summary: string
  key_findings: string[]
  functional_assessment: FunctionalAssessment
  pattern_analysis: PatternAnalysis
  root_causes: string[]
  clinical_pearls: string[]
  truck_driver_specific: TruckDriverAnalysis
}

export interface FunctionalAssessment {
  metabolic_health: HealthScore
  hormonal_balance: HealthScore
  inflammatory_status: HealthScore
  nutritional_status: HealthScore
  detoxification: HealthScore
  overall_vitality: HealthScore
}

export interface HealthScore {
  score: number // 0-100
  status: 'optimal' | 'good' | 'suboptimal' | 'poor' | 'critical'
  key_markers: string[]
  interpretation: string
}

export interface PatternAnalysis {
  primary_patterns: LabPattern[]
  secondary_patterns: LabPattern[]
  emerging_patterns: LabPattern[]
}

export interface TruckDriverAnalysis {
  dot_compliance: DOTCompliance
  occupational_risks: string[]
  lifestyle_factors: string[]
  priority_interventions: string[]
  road_compatible_solutions: string[]
}

export interface DOTCompliance {
  status: 'compliant' | 'at_risk' | 'non_compliant'
  concerning_markers: string[]
  certification_impact: string
  action_required: string
}

export interface ConfidenceScores {
  ocr_accuracy: number
  value_extraction: number
  pattern_detection: number
  overall_confidence: number
}

export interface LabComparison {
  id: string
  client_id: string
  test_catalog_id: string
  previous_value: number
  previous_date: Date
  current_value: number
  current_date: Date
  change_amount: number
  change_percentage: number
  trend: 'improving' | 'worsening' | 'stable'
  rate_of_change: number
  clinical_significance?: string
  created_at: Date
}

// OCR Related Types
export interface OCRResult {
  success: boolean
  text?: string
  structured_data?: ExtractedLabData
  confidence: number
  errors?: string[]
}

export interface ExtractedLabData {
  patient_info?: PatientInfo
  lab_info?: LabInfo
  test_results: ExtractedTestResult[]
  metadata?: Record<string, any>
}

export interface PatientInfo {
  name?: string
  date_of_birth?: string
  patient_id?: string
  gender?: string
}

export interface LabInfo {
  lab_name?: string
  collection_date?: string
  report_date?: string
  ordering_provider?: string
  specimen_id?: string
}

export interface ExtractedTestResult {
  test_name: string
  value?: string
  unit?: string
  reference_range?: string
  flag?: string
  confidence: number
}

// Request/Response Types
export interface LabUploadRequest {
  client_id: string
  files: File[]
  analysis_type?: 'comprehensive' | 'quick' | 'patterns_only'
}

export interface LabAnalysisResponse {
  success: boolean
  lab_result_id: string
  processing_status: string
  detected_patterns?: LabPattern[]
  ai_analysis?: AIAnalysis
  protocols?: LabProtocol[]
  errors?: string[]
}

export interface PatternDetectionRequest {
  lab_values: LabValue[]
  include_subclinical?: boolean
  focus_areas?: string[]
}

export interface ProtocolGenerationRequest {
  lab_result_id: string
  client_preferences?: ClientPreferences
  include_lifestyle?: boolean
  include_supplements?: boolean
}

export interface ClientPreferences {
  supplement_budget?: 'low' | 'medium' | 'high'
  dietary_restrictions?: string[]
  medication_interactions?: string[]
  preferred_brands?: string[]
}