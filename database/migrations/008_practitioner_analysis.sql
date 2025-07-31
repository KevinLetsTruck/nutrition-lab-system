-- Migration 008: Practitioner Analysis System
-- This migration adds support for the comprehensive practitioner analysis system

-- Create analysis_versions table for tracking report versions
CREATE TABLE IF NOT EXISTS analysis_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  version_id VARCHAR(255) NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  generated_by VARCHAR(50) NOT NULL CHECK (generated_by IN ('manual', 'ai')),
  snapshot JSONB NOT NULL,
  changes JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create client_notes table for storing practitioner notes
CREATE TABLE IF NOT EXISTS client_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('interview', 'coaching_call', 'assistant')),
  content TEXT NOT NULL,
  author VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create protocols table for storing client protocols
CREATE TABLE IF NOT EXISTS protocols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  phase VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  content TEXT,
  compliance INTEGER CHECK (compliance >= 0 AND compliance <= 100),
  status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_analysis_versions_client_id ON analysis_versions(client_id);
CREATE INDEX IF NOT EXISTS idx_analysis_versions_generated_at ON analysis_versions(generated_at);
CREATE INDEX IF NOT EXISTS idx_analysis_versions_generated_by ON analysis_versions(generated_by);

CREATE INDEX IF NOT EXISTS idx_client_notes_client_id ON client_notes(client_id);
CREATE INDEX IF NOT EXISTS idx_client_notes_type ON client_notes(type);
CREATE INDEX IF NOT EXISTS idx_client_notes_created_at ON client_notes(created_at);

CREATE INDEX IF NOT EXISTS idx_protocols_client_id ON protocols(client_id);
CREATE INDEX IF NOT EXISTS idx_protocols_status ON protocols(status);
CREATE INDEX IF NOT EXISTS idx_protocols_start_date ON protocols(start_date);

-- Add RLS policies for security
ALTER TABLE analysis_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocols ENABLE ROW LEVEL SECURITY;

-- Analysis versions policies
CREATE POLICY "Users can view their own analysis versions" ON analysis_versions
  FOR SELECT USING (auth.uid() IN (
    SELECT user_id FROM user_clients WHERE client_id = analysis_versions.client_id
  ));

CREATE POLICY "Users can insert their own analysis versions" ON analysis_versions
  FOR INSERT WITH CHECK (auth.uid() IN (
    SELECT user_id FROM user_clients WHERE client_id = analysis_versions.client_id
  ));

-- Client notes policies
CREATE POLICY "Users can view their own client notes" ON client_notes
  FOR SELECT USING (auth.uid() IN (
    SELECT user_id FROM user_clients WHERE client_id = client_notes.client_id
  ));

CREATE POLICY "Users can insert their own client notes" ON client_notes
  FOR INSERT WITH CHECK (auth.uid() IN (
    SELECT user_id FROM user_clients WHERE client_id = client_notes.client_id
  ));

CREATE POLICY "Users can update their own client notes" ON client_notes
  FOR UPDATE USING (auth.uid() IN (
    SELECT user_id FROM user_clients WHERE client_id = client_notes.client_id
  ));

-- Protocols policies
CREATE POLICY "Users can view their own protocols" ON protocols
  FOR SELECT USING (auth.uid() IN (
    SELECT user_id FROM user_clients WHERE client_id = protocols.client_id
  ));

CREATE POLICY "Users can insert their own protocols" ON protocols
  FOR INSERT WITH CHECK (auth.uid() IN (
    SELECT user_id FROM user_clients WHERE client_id = protocols.client_id
  ));

CREATE POLICY "Users can update their own protocols" ON protocols
  FOR UPDATE USING (auth.uid() IN (
    SELECT user_id FROM user_clients WHERE client_id = protocols.client_id
  ));

-- Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_client_notes_updated_at 
  BEFORE UPDATE ON client_notes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_protocols_updated_at 
  BEFORE UPDATE ON protocols 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO client_notes (client_id, type, content, author) VALUES
  ((SELECT id FROM clients LIMIT 1), 'interview', 'Initial consultation completed. Client reports fatigue, digestive issues, and difficulty maintaining healthy eating habits while on the road. Currently taking blood pressure medication.', 'Dr. Smith'),
  ((SELECT id FROM clients LIMIT 1), 'coaching_call', 'Weekly check-in - client has been consistent with supplement protocol. Energy levels continue to improve. Discussed stress management techniques for truck driving.', 'Coach Johnson');

INSERT INTO protocols (client_id, phase, start_date, content, compliance, status) VALUES
  ((SELECT id FROM clients LIMIT 1), 'Phase 1: Gut Restoration', '2024-01-15', 'GREETING\nHello John,\n\nThank you for completing your comprehensive health assessment. Based on your lab results and our consultation, I\'ve created a personalized protocol to address your health goals.\n\nPHASE 1: GUT RESTORATION & INFLAMMATION REDUCTION\n\nDURATION: 8 weeks\nCLINICAL FOCUS: Reduce inflammation, improve gut health, increase energy levels\nCURRENT STATUS: Based on your assessment data, we\'ll focus on foundational health improvements\n\nPRIORITY SUPPLEMENTS\n\nNAME OF PRODUCT: Biotics Research - Bio-D-Mulsion Forte\nDOSE: 1 drop daily\nTIMING: With breakfast\nPURPOSE: Optimize vitamin D levels for immune function and inflammation reduction\n\nNAME OF PRODUCT: Biotics Research - CytoFlora\nDOSE: 1 capsule twice daily\nTIMING: 30 minutes before meals\nPURPOSE: Support healthy gut microbiome and reduce inflammation\n\nNAME OF PRODUCT: Biotics Research - Magnesium Glycinate\nDOSE: 200mg twice daily\nTIMING: With meals\nPURPOSE: Support muscle function and energy production\n\nDAILY PROTOCOL SCHEDULE\n\nUPON WAKING: 16oz water with lemon, 1 drop Bio-D-Mulsion Forte\nBEFORE BREAKFAST: 1 CytoFlora capsule\nBETWEEN BREAKFAST & LUNCH: 200mg Magnesium Glycinate\nBEFORE LUNCH: 1 CytoFlora capsule\nWITH LARGEST MEAL: 200mg Magnesium Glycinate\nBETWEEN LUNCH & DINNER: Hydration focus, herbal tea\n\nPROTOCOL NOTES\n\n• Focus on whole foods, avoiding processed foods and added sugars\n• Prioritize sleep hygiene - aim for 7-8 hours per night\n• Consider meal prep strategies for truck stops\n• Monitor energy levels and digestive symptoms', 75, 'active'); 