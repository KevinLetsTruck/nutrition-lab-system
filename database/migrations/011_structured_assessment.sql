-- Structured Assessment System Updates
-- This adds support for structured questions and responses

-- Update conversation_messages table for structured responses
ALTER TABLE conversation_messages 
ADD COLUMN IF NOT EXISTS structured_response JSONB,
ADD COLUMN IF NOT EXISTS question_type VARCHAR(30),
ADD COLUMN IF NOT EXISTS response_options JSONB,
ADD COLUMN IF NOT EXISTS question_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS follow_up_trigger JSONB,
ADD COLUMN IF NOT EXISTS message_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS section VARCHAR(50);

-- Create structured questions table for question templates
CREATE TABLE IF NOT EXISTS structured_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id VARCHAR(100) UNIQUE NOT NULL,
  section VARCHAR(50) NOT NULL,
  question_text TEXT NOT NULL,
  response_type VARCHAR(30) NOT NULL, -- scale, multiple_choice, binary, frequency
  options JSONB NOT NULL,
  ai_context TEXT,
  truck_driver_context TEXT,
  follow_up_logic JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create pattern definitions table
CREATE TABLE IF NOT EXISTS assessment_patterns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pattern_name VARCHAR(100) UNIQUE NOT NULL,
  display_name VARCHAR(200) NOT NULL,
  description TEXT,
  detection_rules JSONB NOT NULL,
  confidence_threshold DECIMAL(3,2) DEFAULT 0.70,
  related_questions JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create detected patterns table for tracking
CREATE TABLE IF NOT EXISTS detected_patterns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE,
  pattern_id UUID REFERENCES assessment_patterns(id),
  confidence DECIMAL(3,2) NOT NULL,
  evidence JSONB,
  detected_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_structured_questions_section ON structured_questions(section);
CREATE INDEX IF NOT EXISTS idx_structured_questions_question_id ON structured_questions(question_id);
CREATE INDEX IF NOT EXISTS idx_detected_patterns_conversation ON detected_patterns(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_question_id ON conversation_messages(question_id);

-- Update ai_conversations to track structured assessment progress
ALTER TABLE ai_conversations
ADD COLUMN IF NOT EXISTS assessment_type VARCHAR(30) DEFAULT 'conversational', -- conversational or structured
ADD COLUMN IF NOT EXISTS current_question_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS questions_answered INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS estimated_questions_remaining INTEGER;