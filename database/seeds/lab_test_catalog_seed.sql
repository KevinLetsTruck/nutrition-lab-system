-- Lab Test Catalog Seed Data
-- Comprehensive functional medicine lab markers with standard, optimal, and truck driver ranges

-- Clear existing data
TRUNCATE TABLE lab_test_catalog CASCADE;

-- Metabolic Panel
INSERT INTO lab_test_catalog (test_code, test_name, category, subcategory, unit, standard_range_low, standard_range_high, optimal_range_low, optimal_range_high, truck_driver_range_low, truck_driver_range_high, critical_low, critical_high, description, clinical_significance, truck_driver_considerations, related_patterns) VALUES
('GLUCOSE', 'Glucose, Fasting', 'metabolic', 'glucose', 'mg/dL', 65, 99, 75, 85, 70, 90, 50, 400, 'Fasting blood glucose level', 'Primary marker for glucose metabolism and diabetes risk', 'Critical for DOT certification; >126 requires medical evaluation', ARRAY['insulin_resistance', 'metabolic_syndrome', 'diabetes']),
('INSULIN', 'Insulin, Fasting', 'metabolic', 'glucose', 'μIU/mL', 2.6, 24.9, 2, 5, 2, 6, NULL, 50, 'Fasting insulin level', 'Early marker for insulin resistance', 'High levels indicate metabolic dysfunction affecting alertness and fatigue', ARRAY['insulin_resistance', 'metabolic_syndrome', 'pcos']),
('HBA1C', 'Hemoglobin A1c', 'metabolic', 'glucose', '%', 4.0, 5.6, 4.5, 5.3, 4.5, 5.5, NULL, 14, '3-month average blood glucose', 'Long-term glucose control marker', 'DOT requires <10%; optimal range prevents fatigue and cognitive issues', ARRAY['diabetes', 'metabolic_syndrome', 'cardiovascular_risk']),
('HOMA_IR', 'HOMA-IR', 'metabolic', 'glucose', 'ratio', 0, 2.5, 0, 1.0, 0, 1.5, NULL, 10, 'Insulin resistance calculation', 'Gold standard for insulin resistance assessment', 'Higher values correlate with fatigue and weight gain common in truckers', ARRAY['insulin_resistance', 'metabolic_syndrome']);

-- Lipid Panel
INSERT INTO lab_test_catalog (test_code, test_name, category, subcategory, unit, standard_range_low, standard_range_high, optimal_range_low, optimal_range_high, truck_driver_range_low, truck_driver_range_high, critical_low, critical_high, description, clinical_significance, truck_driver_considerations, related_patterns) VALUES
('CHOL_TOTAL', 'Total Cholesterol', 'metabolic', 'lipids', 'mg/dL', 100, 199, 150, 180, 140, 190, NULL, 400, 'Total cholesterol level', 'Cardiovascular risk marker', 'Important for DOT cardiac risk assessment', ARRAY['dyslipidemia', 'cardiovascular_risk', 'metabolic_syndrome']),
('LDL', 'LDL Cholesterol', 'metabolic', 'lipids', 'mg/dL', 0, 99, 0, 80, 0, 90, NULL, 300, 'Low-density lipoprotein', 'Primary atherogenic particle', 'Key marker for cardiovascular health in sedentary occupation', ARRAY['dyslipidemia', 'cardiovascular_risk', 'inflammation']),
('HDL', 'HDL Cholesterol', 'metabolic', 'lipids', 'mg/dL', 40, 999, 60, 100, 50, 100, 20, NULL, 'High-density lipoprotein', 'Protective cholesterol', 'Often low in truckers due to poor diet and lack of exercise', ARRAY['dyslipidemia', 'metabolic_syndrome', 'inflammation']),
('TRIG', 'Triglycerides', 'metabolic', 'lipids', 'mg/dL', 0, 149, 0, 70, 0, 90, NULL, 1000, 'Triglyceride level', 'Marker for metabolic health and insulin resistance', 'Elevated by truck stop food and irregular meals', ARRAY['insulin_resistance', 'metabolic_syndrome', 'fatty_liver']),
('APOB', 'Apolipoprotein B', 'metabolic', 'lipids', 'mg/dL', 0, 90, 0, 70, 0, 75, NULL, 200, 'Atherogenic particle count', 'Better predictor of CVD than LDL', 'Critical for true cardiovascular risk in truckers', ARRAY['dyslipidemia', 'cardiovascular_risk']),
('LDLP', 'LDL Particle Number', 'metabolic', 'lipids', 'nmol/L', 0, 1000, 0, 700, 0, 800, NULL, 2500, 'LDL particle count', 'Advanced cardiovascular risk marker', 'More accurate than LDL-C for risk assessment', ARRAY['dyslipidemia', 'cardiovascular_risk']);

-- Thyroid Panel
INSERT INTO lab_test_catalog (test_code, test_name, category, subcategory, unit, standard_range_low, standard_range_high, optimal_range_low, optimal_range_high, truck_driver_range_low, truck_driver_range_high, critical_low, critical_high, description, clinical_significance, truck_driver_considerations, related_patterns) VALUES
('TSH', 'TSH', 'hormones', 'thyroid', 'mIU/L', 0.45, 4.5, 1.0, 2.0, 0.8, 2.5, 0.1, 20, 'Thyroid stimulating hormone', 'Primary thyroid function screen', 'Affects energy, weight, and alertness critical for driving', ARRAY['hypothyroid', 'hyperthyroid', 'autoimmune_thyroid']),
('FT4', 'Free T4', 'hormones', 'thyroid', 'ng/dL', 0.82, 1.77, 1.0, 1.5, 1.0, 1.6, 0.5, 3.0, 'Free thyroxine', 'Active thyroid hormone', 'Low levels cause fatigue and slow reaction time', ARRAY['hypothyroid', 'thyroid_conversion']),
('FT3', 'Free T3', 'hormones', 'thyroid', 'pg/mL', 2.0, 4.4, 3.0, 4.0, 2.8, 4.0, 1.0, 6.0, 'Free triiodothyronine', 'Most active thyroid hormone', 'Critical for metabolism and energy production', ARRAY['hypothyroid', 'thyroid_conversion', 'low_t3_syndrome']),
('RT3', 'Reverse T3', 'hormones', 'thyroid', 'ng/dL', 9.2, 24.1, 9, 15, 9, 16, NULL, 35, 'Reverse T3', 'Thyroid hormone brake', 'Elevated with stress common in trucking lifestyle', ARRAY['thyroid_conversion', 'stress_response', 'inflammation']),
('TPO_AB', 'TPO Antibodies', 'hormones', 'thyroid', 'IU/mL', 0, 34, 0, 10, 0, 15, NULL, 1000, 'Thyroid peroxidase antibodies', 'Autoimmune thyroid marker', 'Indicates Hashimoto''s requiring monitoring', ARRAY['autoimmune_thyroid', 'hashimotos']);

-- Inflammatory Markers
INSERT INTO lab_test_catalog (test_code, test_name, category, subcategory, unit, standard_range_low, standard_range_high, optimal_range_low, optimal_range_high, truck_driver_range_low, truck_driver_range_high, critical_low, critical_high, description, clinical_significance, truck_driver_considerations, related_patterns) VALUES
('CRP_HS', 'hs-CRP', 'inflammation', 'acute', 'mg/L', 0, 3.0, 0, 1.0, 0, 1.5, NULL, 10, 'High-sensitivity C-reactive protein', 'Cardiovascular and systemic inflammation', 'Elevated by poor diet, sedentary lifestyle, and sleep deprivation', ARRAY['inflammation', 'cardiovascular_risk', 'metabolic_syndrome']),
('ESR', 'ESR', 'inflammation', 'acute', 'mm/hr', 0, 20, 0, 10, 0, 15, NULL, 100, 'Erythrocyte sedimentation rate', 'Non-specific inflammation marker', 'Can indicate chronic inflammation from lifestyle', ARRAY['inflammation', 'autoimmune']),
('HOMOCYST', 'Homocysteine', 'inflammation', 'methylation', 'μmol/L', 0, 15, 5, 8, 5, 9, NULL, 50, 'Homocysteine level', 'Methylation and cardiovascular risk', 'Often elevated due to poor B-vitamin status', ARRAY['methylation_dysfunction', 'cardiovascular_risk', 'b_vitamin_deficiency']),
('FERRITIN', 'Ferritin', 'inflammation', 'iron', 'ng/mL', 30, 400, 50, 150, 40, 170, 10, 1000, 'Iron storage protein', 'Iron status and inflammation marker', 'Can be elevated with inflammation or hemochromatosis', ARRAY['iron_overload', 'inflammation', 'hemochromatosis']);

-- Hormone Panel (Male)
INSERT INTO lab_test_catalog (test_code, test_name, category, subcategory, unit, standard_range_low, standard_range_high, optimal_range_low, optimal_range_high, truck_driver_range_low, truck_driver_range_high, critical_low, critical_high, description, clinical_significance, truck_driver_considerations, related_patterns) VALUES
('TEST_TOTAL', 'Testosterone, Total', 'hormones', 'sex_male', 'ng/dL', 264, 916, 500, 800, 450, 800, 100, 1500, 'Total testosterone', 'Primary male hormone', 'Low levels common in truckers; affects energy, mood, libido', ARRAY['hypogonadism', 'metabolic_syndrome', 'andropause']),
('TEST_FREE', 'Testosterone, Free', 'hormones', 'sex_male', 'pg/mL', 8.7, 25.1, 15, 23, 12, 23, 5, 50, 'Free testosterone', 'Bioavailable testosterone', 'Better marker than total for symptoms', ARRAY['hypogonadism', 'andropause']),
('ESTRADIOL', 'Estradiol', 'hormones', 'sex_male', 'pg/mL', 7.6, 42.6, 20, 30, 15, 35, NULL, 100, 'Estradiol in males', 'Estrogen in males', 'Elevated with obesity common in truckers', ARRAY['estrogen_dominance', 'metabolic_syndrome']),
('SHBG', 'SHBG', 'hormones', 'sex_binding', 'nmol/L', 16.5, 55.9, 25, 45, 20, 50, 10, 150, 'Sex hormone binding globulin', 'Binds sex hormones', 'Low with insulin resistance and obesity', ARRAY['insulin_resistance', 'hypogonadism']);

-- Adrenal Hormones
INSERT INTO lab_test_catalog (test_code, test_name, category, subcategory, unit, standard_range_low, standard_range_high, optimal_range_low, optimal_range_high, truck_driver_range_low, truck_driver_range_high, critical_low, critical_high, description, clinical_significance, truck_driver_considerations, related_patterns) VALUES
('CORTISOL_AM', 'Cortisol, AM', 'hormones', 'adrenal', 'μg/dL', 6.2, 19.4, 10, 18, 8, 18, 2, 50, 'Morning cortisol', 'Stress hormone peak', 'Often dysregulated with shift work and poor sleep', ARRAY['adrenal_dysfunction', 'hpa_axis_dysfunction', 'chronic_stress']),
('DHEA_S', 'DHEA-S', 'hormones', 'adrenal', 'μg/dL', 88, 427, 200, 350, 150, 350, 50, 700, 'DHEA sulfate', 'Adrenal reserve marker', 'Depleted with chronic stress common in trucking', ARRAY['adrenal_dysfunction', 'chronic_stress', 'aging']);

-- Nutritional Markers
INSERT INTO lab_test_catalog (test_code, test_name, category, subcategory, unit, standard_range_low, standard_range_high, optimal_range_low, optimal_range_high, truck_driver_range_low, truck_driver_range_high, critical_low, critical_high, description, clinical_significance, truck_driver_considerations, related_patterns) VALUES
('VIT_D', 'Vitamin D, 25-OH', 'nutritional', 'vitamins', 'ng/mL', 30, 100, 50, 80, 40, 80, 10, 150, '25-hydroxyvitamin D', 'Vitamin D status', 'Often deficient due to limited sun exposure in cab', ARRAY['vitamin_d_deficiency', 'immune_dysfunction', 'mood_disorders']),
('VIT_B12', 'Vitamin B12', 'nutritional', 'vitamins', 'pg/mL', 232, 1245, 500, 900, 400, 950, 100, 2000, 'Cobalamin level', 'B12 status', 'Can be low with poor diet or gut issues', ARRAY['b12_deficiency', 'methylation_dysfunction', 'anemia']),
('FOLATE', 'Folate', 'nutritional', 'vitamins', 'ng/mL', 3.1, 20.5, 10, 20, 8, 20, 2, 50, 'Folate level', 'Methylation and DNA synthesis', 'Often low with processed food diet', ARRAY['folate_deficiency', 'methylation_dysfunction', 'anemia']),
('IRON', 'Iron', 'nutritional', 'minerals', 'μg/dL', 38, 169, 70, 130, 60, 140, 20, 300, 'Serum iron', 'Iron availability', 'Can be low with poor diet or high with inflammation', ARRAY['iron_deficiency', 'anemia', 'iron_overload']),
('MAG_RBC', 'Magnesium, RBC', 'nutritional', 'minerals', 'mg/dL', 4.2, 6.8, 5.5, 6.5, 5.2, 6.5, 3.0, 8.0, 'Red blood cell magnesium', 'Cellular magnesium status', 'Critical for energy, sleep, and muscle function', ARRAY['magnesium_deficiency', 'muscle_cramps', 'fatigue']),
('ZINC_RBC', 'Zinc, RBC', 'nutritional', 'minerals', 'μg/dL', 700, 1200, 900, 1100, 850, 1100, 500, 1500, 'Red blood cell zinc', 'Cellular zinc status', 'Important for immune function and wound healing', ARRAY['zinc_deficiency', 'immune_dysfunction']);

-- Kidney Function
INSERT INTO lab_test_catalog (test_code, test_name, category, subcategory, unit, standard_range_low, standard_range_high, optimal_range_low, optimal_range_high, truck_driver_range_low, truck_driver_range_high, critical_low, critical_high, description, clinical_significance, truck_driver_considerations, related_patterns) VALUES
('CREAT', 'Creatinine', 'metabolic', 'kidney', 'mg/dL', 0.57, 1.35, 0.7, 1.1, 0.7, 1.2, 0.3, 4.0, 'Creatinine level', 'Kidney function marker', 'Can be elevated with dehydration common in truckers', ARRAY['kidney_dysfunction', 'dehydration']),
('BUN', 'BUN', 'metabolic', 'kidney', 'mg/dL', 6, 24, 10, 20, 8, 22, 2, 100, 'Blood urea nitrogen', 'Kidney function and hydration', 'Often elevated with high protein diet and dehydration', ARRAY['kidney_dysfunction', 'dehydration', 'high_protein_diet']),
('EGFR', 'eGFR', 'metabolic', 'kidney', 'mL/min/1.73m²', 90, 999, 90, 120, 85, 120, 15, NULL, 'Estimated GFR', 'Kidney filtration rate', 'Important for medication dosing and DOT health', ARRAY['kidney_dysfunction']);

-- Liver Function
INSERT INTO lab_test_catalog (test_code, test_name, category, subcategory, unit, standard_range_low, standard_range_high, optimal_range_low, optimal_range_high, truck_driver_range_low, truck_driver_range_high, critical_low, critical_high, description, clinical_significance, truck_driver_considerations, related_patterns) VALUES
('ALT', 'ALT', 'metabolic', 'liver', 'U/L', 0, 44, 10, 30, 10, 35, NULL, 500, 'Alanine aminotransferase', 'Liver enzyme', 'Can be elevated with fatty liver common in truckers', ARRAY['fatty_liver', 'liver_dysfunction', 'metabolic_syndrome']),
('AST', 'AST', 'metabolic', 'liver', 'U/L', 0, 40, 10, 30, 10, 35, NULL, 500, 'Aspartate aminotransferase', 'Liver and muscle enzyme', 'Elevated with liver issues or muscle damage', ARRAY['fatty_liver', 'liver_dysfunction', 'muscle_damage']),
('GGT', 'GGT', 'metabolic', 'liver', 'U/L', 0, 65, 10, 30, 10, 40, NULL, 500, 'Gamma-glutamyl transferase', 'Liver and bile duct enzyme', 'Sensitive marker for fatty liver and alcohol', ARRAY['fatty_liver', 'liver_dysfunction', 'alcohol_use']);

-- Create pattern detection rules
INSERT INTO pattern_library (pattern_name, pattern_category, description, required_markers, optional_markers, detection_rules, clinical_interpretation, functional_medicine_approach, truck_driver_considerations, intervention_priority) VALUES
('insulin_resistance', 'metabolic', 'Insulin resistance pattern', 
 ARRAY['GLUCOSE', 'INSULIN'], 
 ARRAY['HBA1C', 'TRIG', 'HDL', 'ALT'], 
 '{"rules": [{"marker": "HOMA_IR", "operator": ">", "value": 1.0}, {"marker": "INSULIN", "operator": ">", "value": 5}, {"marker": "TRIG", "operator": ">", "value": 100}]}'::jsonb,
 'Early metabolic dysfunction preceding diabetes',
 'Address through diet, exercise, supplements like berberine and chromium',
 'Common in truckers due to sedentary job and poor food choices. Requires immediate intervention to prevent diabetes and maintain DOT certification.',
 'high'),

('thyroid_dysfunction', 'hormonal', 'Thyroid dysfunction pattern',
 ARRAY['TSH', 'FT4', 'FT3'],
 ARRAY['RT3', 'TPO_AB'],
 '{"rules": [{"marker": "TSH", "operator": ">", "value": 2.5}, {"marker": "FT3", "operator": "<", "value": 3.0}, {"marker": "FT4", "operator": "<", "value": 1.2}]}'::jsonb,
 'Suboptimal thyroid function affecting metabolism',
 'Support thyroid with selenium, iodine, and address underlying inflammation',
 'Causes fatigue and weight gain. May need thyroid support to maintain energy for safe driving.',
 'high'),

('chronic_inflammation', 'inflammatory', 'Systemic inflammation pattern',
 ARRAY['CRP_HS'],
 ARRAY['ESR', 'FERRITIN', 'GGT'],
 '{"rules": [{"marker": "CRP_HS", "operator": ">", "value": 1.0}, {"marker": "ESR", "operator": ">", "value": 15}, {"marker": "FERRITIN", "operator": ">", "value": 200}]}'::jsonb,
 'Chronic inflammatory state increasing disease risk',
 'Anti-inflammatory diet, omega-3s, curcumin, address root causes',
 'Linked to poor diet, stress, and sedentary lifestyle. Increases risk of heart disease critical for DOT certification.',
 'high'),

('testosterone_deficiency', 'hormonal', 'Low testosterone pattern',
 ARRAY['TEST_TOTAL', 'TEST_FREE'],
 ARRAY['SHBG', 'LH', 'ESTRADIOL'],
 '{"rules": [{"marker": "TEST_TOTAL", "operator": "<", "value": 500}, {"marker": "TEST_FREE", "operator": "<", "value": 15}]}'::jsonb,
 'Hypogonadism affecting energy, mood, and metabolism',
 'Address through lifestyle, weight loss, stress management, consider TRT if severe',
 'Very common in truckers. Affects energy, mood, and alertness. May need hormone optimization.',
 'moderate');