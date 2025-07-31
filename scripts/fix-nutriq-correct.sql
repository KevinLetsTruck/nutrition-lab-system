-- Fix Mike Wilson's NutriQ Data - Correct Schema Version
-- This script creates NutriQ results for the most recent NutriQ report

-- First, let's see what we have
SELECT 
  lr.id as lab_report_id,
  lr.report_type,
  lr.report_date,
  lr.status,
  lr.analysis_results,
  c.first_name,
  c.last_name
FROM lab_reports lr
JOIN clients c ON lr.client_id = c.id
WHERE c.first_name ILIKE '%mike%' 
  AND c.last_name ILIKE '%wilson%'
  AND lr.report_type = 'nutriq'
ORDER BY lr.created_at DESC
LIMIT 5;

-- Create NutriQ results for the most recent report
INSERT INTO nutriq_results (
  lab_report_id,
  total_score,
  energy_score,
  mood_score,
  sleep_score,
  stress_score,
  digestion_score,
  immunity_score,
  detailed_answers,
  recommendations
) 
SELECT 
  lr.id,
  42,  -- total_score
  7,   -- energy_score
  6,   -- mood_score
  8,   -- sleep_score
  7,   -- stress_score
  8,   -- digestion_score
  6,   -- immunity_score
  '{
    "energy": {
      "symptoms": ["Chronic fatigue", "Energy crashes", "Dependency on energy drinks (5-6 daily)"],
      "severity": "Moderate to High"
    },
    "mood": {
      "symptoms": ["Irritability", "Mood swings", "Stress-related mood changes"],
      "severity": "Moderate"
    },
    "sleep": {
      "symptoms": ["Poor sleep quality", "Irregular sleep schedule", "Night driving disruption"],
      "severity": "High"
    },
    "stress": {
      "symptoms": ["High stress levels", "Cortisol dysregulation", "HPA axis dysfunction"],
      "severity": "High"
    },
    "digestion": {
      "symptoms": ["Heartburn", "Bloating", "Irregular bowel patterns", "PPI use history (3 years)"],
      "severity": "High"
    },
    "immunity": {
      "symptoms": ["Frequent illness", "Inflammation", "Immune system stress"],
      "severity": "Moderate"
    }
  }'::jsonb,
  'Address HPA axis dysfunction as primary focus. Optimize gut health and microbiome. Implement comprehensive stress management. Focus on sleep quality and circadian rhythm. Reduce inflammatory triggers. Start digestive enzymes with every meal. Implement morning sunlight exposure. Reduce energy drink consumption gradually. Monitor blood pressure regularly. Begin HPA axis support protocol.'
FROM lab_reports lr
JOIN clients c ON lr.client_id = c.id
WHERE c.first_name ILIKE '%mike%' 
  AND c.last_name ILIKE '%wilson%'
  AND lr.report_type = 'nutriq'
  AND lr.id = (
    SELECT lr2.id
    FROM lab_reports lr2
    JOIN clients c2 ON lr2.client_id = c2.id
    WHERE c2.first_name ILIKE '%mike%' 
      AND c2.last_name ILIKE '%wilson%'
      AND lr2.report_type = 'nutriq'
    ORDER BY lr2.created_at DESC
    LIMIT 1
  )
  AND NOT EXISTS (
    SELECT 1 FROM nutriq_results nr WHERE nr.lab_report_id = lr.id
  );

-- Update the lab report status to completed
UPDATE lab_reports 
SET 
  status = 'completed',
  analysis_results = '{
    "bodySystems": {
      "energy": {
        "issues": ["Chronic fatigue", "Energy crashes", "Dependency on energy drinks (5-6 daily)"],
        "recommendations": ["Focus on mitochondrial support", "Address HPA axis dysfunction", "Reduce energy drink consumption gradually"]
      },
      "mood": {
        "issues": ["Irritability", "Mood swings", "Stress-related mood changes"],
        "recommendations": ["Gut-brain axis support", "Stress management techniques", "HPA axis optimization"]
      },
      "sleep": {
        "issues": ["Poor sleep quality", "Irregular sleep schedule", "Night driving disruption"],
        "recommendations": ["Sleep hygiene protocols", "Circadian rhythm support", "Melatonin optimization"]
      },
      "stress": {
        "issues": ["High stress levels", "Cortisol dysregulation", "HPA axis dysfunction"],
        "recommendations": ["HPA axis support", "Stress reduction techniques", "Adaptogenic herbs"]
      },
      "digestion": {
        "issues": ["Heartburn", "Bloating", "Irregular bowel patterns", "PPI use history (3 years)"],
        "recommendations": ["Digestive enzyme support", "Gut microbiome optimization", "SIBO protocol"]
      },
      "immunity": {
        "issues": ["Frequent illness", "Inflammation", "Immune system stress"],
        "recommendations": ["Immune support", "Anti-inflammatory protocols", "Gut-immune axis focus"]
      }
    },
    "overallRecommendations": [
      "Address HPA axis dysfunction as primary focus",
      "Optimize gut health and microbiome",
      "Implement comprehensive stress management",
      "Focus on sleep quality and circadian rhythm",
      "Reduce inflammatory triggers"
    ],
    "priorityActions": [
      "Start digestive enzymes with every meal",
      "Implement morning sunlight exposure",
      "Reduce energy drink consumption gradually",
      "Monitor blood pressure regularly",
      "Begin HPA axis support protocol"
    ]
  }'::jsonb,
  updated_at = NOW()
WHERE id = (
  SELECT lr.id
  FROM lab_reports lr
  JOIN clients c ON lr.client_id = c.id
  WHERE c.first_name ILIKE '%mike%' 
    AND c.last_name ILIKE '%wilson%'
    AND lr.report_type = 'nutriq'
  ORDER BY lr.created_at DESC
  LIMIT 1
);

-- Verify the fix worked
SELECT 
  nr.total_score,
  nr.energy_score,
  nr.mood_score,
  nr.sleep_score,
  nr.stress_score,
  nr.digestion_score,
  nr.immunity_score,
  lr.status,
  lr.analysis_results IS NOT NULL as has_analysis,
  c.first_name,
  c.last_name
FROM nutriq_results nr
JOIN lab_reports lr ON nr.lab_report_id = lr.id
JOIN clients c ON lr.client_id = c.id
WHERE c.first_name ILIKE '%mike%' 
  AND c.last_name ILIKE '%wilson%'
ORDER BY lr.created_at DESC
LIMIT 1; 