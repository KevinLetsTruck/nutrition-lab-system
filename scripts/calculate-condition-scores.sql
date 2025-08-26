-- Functional Medicine Condition Scoring System
-- Calculates percentage-based scores for each functional medicine condition

-- Function to calculate condition scores for a specific assessment
CREATE OR REPLACE FUNCTION calculate_condition_scores(assessment_id text)
RETURNS TABLE (
    condition text,
    percentage numeric,
    question_count integer,
    actual_score integer,
    max_possible_score integer,
    priority_rank integer
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sr.category as condition,
        ROUND((SUM(sr.score)::numeric / (COUNT(*) * 5) * 100), 2) as percentage,
        COUNT(*)::integer as question_count,
        SUM(sr.score)::integer as actual_score,
        (COUNT(*) * 5)::integer as max_possible_score,
        ROW_NUMBER() OVER (ORDER BY (SUM(sr.score)::numeric / (COUNT(*) * 5) * 100) DESC)::integer as priority_rank
    FROM "SimpleResponse" sr 
    WHERE sr."assessmentId" = assessment_id
    GROUP BY sr.category
    ORDER BY percentage DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to update ConditionScores table for specific assessment
CREATE OR REPLACE FUNCTION update_condition_scores(assessment_id text)
RETURNS integer AS $$
DECLARE
    rows_affected integer;
BEGIN
    -- Delete existing scores for this assessment
    DELETE FROM "ConditionScores" WHERE "assessmentId" = assessment_id;
    
    -- Insert new calculated scores
    INSERT INTO "ConditionScores" ("id", "assessmentId", "condition", "actualScore", "maxPossibleScore", "percentage", "questionCount")
    SELECT 
        'cs_' || assessment_id || '_' || category || '_' || extract(epoch from now())::text as id,
        assessment_id as "assessmentId",
        category as condition,
        SUM(score) as "actualScore", 
        (COUNT(*) * 5) as "maxPossibleScore",
        ROUND((SUM(score)::numeric / (COUNT(*) * 5) * 100), 2) as percentage,
        COUNT(*) as "questionCount"
    FROM "SimpleResponse" 
    WHERE "assessmentId" = assessment_id
    GROUP BY category;
    
    GET DIAGNOSTICS rows_affected = ROW_COUNT;
    RETURN rows_affected;
END;
$$ LANGUAGE plpgsql;

-- View for practitioner dashboard showing condition priorities
CREATE OR REPLACE VIEW assessment_condition_summary AS
SELECT 
    sa.id as "assessmentId",
    sa."clientId",
    sa.status,
    sa."startedAt",
    sa."completedAt",
    cs.condition,
    cs.percentage,
    cs."questionCount",
    cs."actualScore",
    cs."maxPossibleScore",
    ROW_NUMBER() OVER (PARTITION BY sa.id ORDER BY cs.percentage DESC) as priority_rank,
    CASE 
        WHEN cs.percentage >= 70 THEN 'HIGH'
        WHEN cs.percentage >= 50 THEN 'MODERATE'  
        ELSE 'LOW'
    END as severity_level
FROM "SimpleAssessment" sa
JOIN "ConditionScores" cs ON sa.id = cs."assessmentId"
ORDER BY sa."startedAt" DESC, cs.percentage DESC;

-- Clinical interpretation guidelines
/*
CONDITION SCORE INTERPRETATION:

Percentage Ranges:
- 70-100%: HIGH PRIORITY - Immediate functional medicine intervention needed
- 50-69%:  MODERATE PRIORITY - Support protocols recommended
- 30-49%:  LOW PRIORITY - Monitor and lifestyle support
- 0-29%:   OPTIMAL RANGE - Maintain current support

Priority Ranking:
- Rank 1-3: Primary conditions for treatment focus
- Rank 4-6: Secondary conditions to address after primary
- Rank 7+:  Monitor and support as needed

Sample Treatment Protocol Priorities:
1. Address top 2-3 conditions simultaneously
2. Use foundational protocols that support multiple systems
3. Monitor progress with follow-up assessments
4. Adjust protocols based on percentage improvements
*/
