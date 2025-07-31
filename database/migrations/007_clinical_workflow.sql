-- Clinical Workflow System Migration
-- Adds tables for FNTP practitioner clinical workflow

-- Client notes table for tracking all client interactions
CREATE TABLE client_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    note_type VARCHAR(50) NOT NULL CHECK (note_type IN ('interview', 'coaching_call', 'admin', 'follow_up')),
    content TEXT NOT NULL,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Client documents table for uploaded files
CREATE TABLE client_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    document_name VARCHAR(255) NOT NULL,
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('lab_result', 'intake_form', 'protocol', 'other')),
    file_url TEXT,
    file_size INTEGER,
    mime_type VARCHAR(100),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    uploaded_by UUID REFERENCES users(id)
);

-- Protocols table for FNTP protocols
CREATE TABLE protocols (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    phase_number INTEGER NOT NULL,
    phase_name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL, -- Full protocol text
    is_active BOOLEAN DEFAULT false,
    generated_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_client_notes_client_id ON client_notes(client_id);
CREATE INDEX idx_client_notes_type ON client_notes(note_type);
CREATE INDEX idx_client_notes_created_at ON client_notes(created_at);
CREATE INDEX idx_client_documents_client_id ON client_documents(client_id);
CREATE INDEX idx_client_documents_type ON client_documents(document_type);
CREATE INDEX idx_protocols_client_id ON protocols(client_id);
CREATE INDEX idx_protocols_active ON protocols(is_active);
CREATE INDEX idx_protocols_phase ON protocols(phase_number);

-- Add triggers for updated_at columns
CREATE TRIGGER update_client_notes_updated_at BEFORE UPDATE ON client_notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_protocols_updated_at BEFORE UPDATE ON protocols
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create view for client summary with recent activity
CREATE VIEW client_clinical_summary AS
SELECT 
    c.id,
    c.first_name,
    c.last_name,
    c.email,
    c.phone,
    COUNT(DISTINCT cn.id) as total_notes,
    COUNT(DISTINCT cd.id) as total_documents,
    COUNT(DISTINCT p.id) as total_protocols,
    MAX(cn.created_at) as last_note_date,
    MAX(cd.uploaded_at) as last_document_date,
    MAX(p.created_at) as last_protocol_date,
    p_current.phase_name as current_protocol_phase,
    p_current.is_active as has_active_protocol
FROM clients c
LEFT JOIN client_notes cn ON c.id = cn.client_id
LEFT JOIN client_documents cd ON c.id = cd.client_id
LEFT JOIN protocols p ON c.id = p.client_id
LEFT JOIN protocols p_current ON c.id = p_current.client_id AND p_current.is_active = true
GROUP BY c.id, c.first_name, c.last_name, c.email, c.phone, p_current.phase_name, p_current.is_active;

-- Add some helpful functions for clinical workflow

-- Function to get client's complete data for protocol generation
CREATE OR REPLACE FUNCTION get_client_complete_data(client_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'demographics', json_build_object(
            'id', c.id,
            'name', c.first_name || ' ' || c.last_name,
            'email', c.email,
            'phone', c.phone,
            'date_of_birth', c.date_of_birth,
            'medical_history', c.medical_history,
            'allergies', c.allergies,
            'current_medications', c.current_medications
        ),
        'notes', COALESCE(
            (SELECT json_agg(json_build_object(
                'type', cn.note_type,
                'content', cn.content,
                'date', cn.created_at
            ) ORDER BY cn.created_at DESC)
            FROM client_notes cn WHERE cn.client_id = client_uuid), 
            '[]'::json
        ),
        'documents', COALESCE(
            (SELECT json_agg(json_build_object(
                'name', cd.document_name,
                'type', cd.document_type,
                'uploaded_at', cd.uploaded_at
            ) ORDER BY cd.uploaded_at DESC)
            FROM client_documents cd WHERE cd.client_id = client_uuid),
            '[]'::json
        ),
        'lab_reports', COALESCE(
            (SELECT json_agg(json_build_object(
                'type', lr.report_type,
                'date', lr.report_date,
                'results', lr.analysis_results
            ) ORDER BY lr.report_date DESC)
            FROM lab_reports lr WHERE lr.client_id = client_uuid),
            '[]'::json
        ),
        'protocols', COALESCE(
            (SELECT json_agg(json_build_object(
                'phase', p.phase_name,
                'is_active', p.is_active,
                'created_at', p.created_at
            ) ORDER BY p.created_at DESC)
            FROM protocols p WHERE p.client_id = client_uuid),
            '[]'::json
        )
    ) INTO result
    FROM clients c
    WHERE c.id = client_uuid;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to deactivate all protocols for a client (when setting a new one as active)
CREATE OR REPLACE FUNCTION deactivate_client_protocols(client_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE protocols 
    SET is_active = false, updated_at = NOW()
    WHERE client_id = client_uuid;
END;
$$ LANGUAGE plpgsql; 