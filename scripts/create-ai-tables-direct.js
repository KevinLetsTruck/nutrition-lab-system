require('dotenv').config({ path: '.env.local' });

console.log('🚀 Creating AI Conversation Tables via Supabase Dashboard...\n');

console.log('Please run these SQL commands in your Supabase SQL Editor:');
console.log('https://supabase.com/dashboard/project/[your-project-id]/sql/new\n');

const sql = `
-- AI Conversations System Tables
-- This creates support for AI-powered health assessments

-- Main conversation tracking table
CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  conversation_type VARCHAR(50) DEFAULT 'health_assessment',
  status VARCHAR(20) DEFAULT 'in_progress', -- in_progress, completed, paused
  current_section VARCHAR(50),
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  total_duration INTEGER, -- in minutes
  metadata JSONB, -- for storing additional data like urgent concerns
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Individual messages in the conversation
CREATE TABLE IF NOT EXISTS conversation_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('ai', 'client')), -- 'ai' or 'client'
  content TEXT NOT NULL,
  message_type VARCHAR(30) DEFAULT 'chat', -- chat, validation, pattern_recognition, clarification
  section VARCHAR(50),
  timestamp TIMESTAMP DEFAULT NOW(),
  metadata JSONB, -- for storing analysis data, patterns, etc
  created_at TIMESTAMP DEFAULT NOW()
);

-- Analysis results from conversations
CREATE TABLE IF NOT EXISTS conversation_analysis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE,
  section VARCHAR(50),
  symptoms_identified JSONB,
  patterns_detected JSONB,
  severity_scores JSONB,
  root_causes JSONB,
  confidence_scores JSONB,
  truck_driver_factors JSONB,
  recommendations JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_ai_conversations_client_id ON ai_conversations(client_id);
CREATE INDEX idx_ai_conversations_status ON ai_conversations(status);
CREATE INDEX idx_conversation_messages_conversation_id ON conversation_messages(conversation_id);
CREATE INDEX idx_conversation_messages_timestamp ON conversation_messages(timestamp);
CREATE INDEX idx_conversation_analysis_conversation_id ON conversation_analysis(conversation_id);

-- Enable Row Level Security
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_analysis ENABLE ROW LEVEL SECURITY;

-- RLS Policies (adjust based on your auth setup)
CREATE POLICY "Users can view their own conversations" ON ai_conversations
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view their own messages" ON conversation_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM ai_conversations 
      WHERE ai_conversations.id = conversation_messages.conversation_id
    )
  );

CREATE POLICY "Users can view their own analysis" ON conversation_analysis
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM ai_conversations 
      WHERE ai_conversations.id = conversation_analysis.conversation_id
    )
  );
`;

console.log(sql);
console.log('\n✅ Copy and paste the above SQL into your Supabase SQL Editor and run it.');
console.log('📝 This will create all the necessary tables for the AI Conversation system.');