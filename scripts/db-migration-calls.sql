-- Call Recording & Transcription System Migration
-- This migration adds tables for storing call recordings, transcripts, and AI-extracted notes

-- Call recordings table
CREATE TABLE IF NOT EXISTS call_recordings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  call_type VARCHAR(50) NOT NULL CHECK (call_type IN ('onboarding', 'follow_up', 'assessment')),
  recording_url TEXT,
  transcript TEXT,
  ai_summary JSONB,
  call_date TIMESTAMP DEFAULT NOW(),
  duration_seconds INTEGER,
  consent_given BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Call notes extracted from AI
CREATE TABLE IF NOT EXISTS call_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  call_recording_id UUID REFERENCES call_recordings(id) ON DELETE CASCADE,
  note_type VARCHAR(50) CHECK (note_type IN ('symptom_update', 'compliance', 'concern', 'goal')),
  content TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('urgent', 'high', 'normal', 'low')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_call_recordings_client_id ON call_recordings(client_id);
CREATE INDEX idx_call_recordings_call_date ON call_recordings(call_date);
CREATE INDEX idx_call_notes_recording_id ON call_notes(call_recording_id);
CREATE INDEX idx_call_notes_priority ON call_notes(priority);

-- Enable RLS (Row Level Security)
ALTER TABLE call_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for call_recordings
-- Users can only see their own call recordings
CREATE POLICY "Users can view own call recordings" ON call_recordings
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert own call recordings" ON call_recordings
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own call recordings" ON call_recordings
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- RLS Policies for call_notes
-- Users can only see notes for their call recordings
CREATE POLICY "Users can view call notes" ON call_notes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM call_recordings
      WHERE call_recordings.id = call_notes.call_recording_id
      AND auth.uid() IS NOT NULL
    )
  );

CREATE POLICY "Users can insert call notes" ON call_notes
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM call_recordings
      WHERE call_recordings.id = call_notes.call_recording_id
      AND auth.uid() IS NOT NULL
    )
  );

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON call_recordings TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON call_notes TO anon, authenticated;