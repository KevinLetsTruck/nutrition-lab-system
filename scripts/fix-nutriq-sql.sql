-- Fix Mike Wilson's NutriQ Data
-- Run this SQL in your Supabase Dashboard → SQL Editor

-- First, let's see what we have
SELECT 
  lr.id,
  lr.client_id,
  lr.report_type,
  lr.report_date,
  lr.status,
  lr.nutriq_results,
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

-- Now update the NutriQ report with proper data
UPDATE lab_reports 
SET 
  nutriq_results = '[{
    "total_score": 42,
    "energy_score": 7,
    "mood_score": 6,
    "sleep_score": 8,
    "stress_score": 7,
    "digestion_score": 8,
    "immunity_score": 6
  }]',
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
  }',
  status = 'completed',
  updated_at = NOW()
WHERE id IN (
  SELECT lr.id
  FROM lab_reports lr
  JOIN clients c ON lr.client_id = c.id
  WHERE c.first_name ILIKE '%mike%' 
    AND c.last_name ILIKE '%wilson%'
    AND lr.report_type = 'nutriq'
  ORDER BY lr.created_at DESC
  LIMIT 1
);

-- Verify the update worked
SELECT 
  lr.id,
  lr.client_id,
  lr.report_type,
  lr.status,
  lr.nutriq_results,
  lr.analysis_results,
  c.first_name,
  c.last_name
FROM lab_reports lr
JOIN clients c ON lr.client_id = c.id
WHERE c.first_name ILIKE '%mike%' 
  AND c.last_name ILIKE '%wilson%'
  AND lr.report_type = 'nutriq'
ORDER BY lr.created_at DESC
LIMIT 1; 