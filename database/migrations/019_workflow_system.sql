-- Workflow execution tracking
CREATE TABLE IF NOT EXISTS workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  analysis_id UUID,
  workflow_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  results JSONB,
  protocols JSONB,
  steps JSONB,
  total_duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Client protocols storage
CREATE TABLE IF NOT EXISTS client_protocols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  protocols JSONB NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for performance
CREATE INDEX idx_workflow_executions_client_id ON workflow_executions(client_id);
CREATE INDEX idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX idx_workflow_executions_created_at ON workflow_executions(created_at DESC);

CREATE INDEX idx_client_protocols_client_id ON client_protocols(client_id);
CREATE INDEX idx_client_protocols_active ON client_protocols(active);

-- Enable RLS
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_protocols ENABLE ROW LEVEL SECURITY;

-- RLS policies for workflow_executions
CREATE POLICY "Users can view their own workflows" ON workflow_executions
  FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "Service role can manage all workflows" ON workflow_executions
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- RLS policies for client_protocols
CREATE POLICY "Users can view their own protocols" ON client_protocols
  FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "Service role can manage all protocols" ON client_protocols
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_workflow_executions_updated_at BEFORE UPDATE
  ON workflow_executions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_protocols_updated_at BEFORE UPDATE
  ON client_protocols FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();