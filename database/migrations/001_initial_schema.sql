-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enums
CREATE TYPE report_type AS ENUM ('nutriq', 'kbmo', 'dutch', 'cgm', 'food_photo');
CREATE TYPE processing_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE meal_type AS ENUM ('breakfast', 'lunch', 'dinner', 'snack');

-- Clients table
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    phone VARCHAR(20),
    address TEXT,
    emergency_contact VARCHAR(255),
    medical_history TEXT,
    allergies TEXT,
    current_medications TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lab reports table (main container for all report types)
CREATE TABLE lab_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    report_type report_type NOT NULL,
    report_date DATE NOT NULL,
    status processing_status DEFAULT 'pending',
    file_path VARCHAR(500),
    file_size INTEGER,
    analysis_results JSONB,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- NutriQ/NAQ results table
CREATE TABLE nutriq_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lab_report_id UUID NOT NULL REFERENCES lab_reports(id) ON DELETE CASCADE,
    total_score INTEGER,
    energy_score INTEGER,
    mood_score INTEGER,
    sleep_score INTEGER,
    stress_score INTEGER,
    digestion_score INTEGER,
    immunity_score INTEGER,
    detailed_answers JSONB,
    recommendations TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- KBMO food sensitivity results table
CREATE TABLE kbmo_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lab_report_id UUID NOT NULL REFERENCES lab_reports(id) ON DELETE CASCADE,
    total_igg_score INTEGER,
    high_sensitivity_foods JSONB,
    moderate_sensitivity_foods JSONB,
    low_sensitivity_foods JSONB,
    elimination_diet_recommendations TEXT,
    reintroduction_plan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dutch hormone test results table
CREATE TABLE dutch_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lab_report_id UUID NOT NULL REFERENCES lab_reports(id) ON DELETE CASCADE,
    cortisol_am DECIMAL(5,2),
    cortisol_pm DECIMAL(5,2),
    dhea DECIMAL(5,2),
    testosterone_total DECIMAL(5,2),
    testosterone_free DECIMAL(5,2),
    estradiol DECIMAL(5,2),
    progesterone DECIMAL(5,2),
    melatonin DECIMAL(5,2),
    organic_acid_metabolites JSONB,
    hormone_analysis TEXT,
    recommendations TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CGM (Continuous Glucose Monitor) data table
CREATE TABLE cgm_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lab_report_id UUID NOT NULL REFERENCES lab_reports(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    glucose_level DECIMAL(4,1),
    meal_type meal_type,
    food_description TEXT,
    insulin_dose DECIMAL(3,1),
    activity_level VARCHAR(50),
    stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10),
    sleep_hours DECIMAL(3,1),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Food photos table
CREATE TABLE food_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lab_report_id UUID NOT NULL REFERENCES lab_reports(id) ON DELETE CASCADE,
    image_path VARCHAR(500) NOT NULL,
    meal_type meal_type,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    food_description TEXT,
    estimated_calories INTEGER,
    macro_breakdown JSONB,
    ai_analysis_results JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Processing queue table for background tasks
CREATE TABLE processing_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lab_report_id UUID REFERENCES lab_reports(id) ON DELETE CASCADE,
    task_type VARCHAR(100) NOT NULL,
    status processing_status DEFAULT 'pending',
    priority INTEGER DEFAULT 5,
    payload JSONB,
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_lab_reports_client_id ON lab_reports(client_id);
CREATE INDEX idx_lab_reports_type ON lab_reports(report_type);
CREATE INDEX idx_lab_reports_status ON lab_reports(status);
CREATE INDEX idx_lab_reports_date ON lab_reports(report_date);
CREATE INDEX idx_cgm_data_timestamp ON cgm_data(timestamp);
CREATE INDEX idx_cgm_data_lab_report_id ON cgm_data(lab_report_id);
CREATE INDEX idx_processing_queue_status ON processing_queue(status);
CREATE INDEX idx_processing_queue_priority ON processing_queue(priority);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lab_reports_updated_at BEFORE UPDATE ON lab_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_processing_queue_updated_at BEFORE UPDATE ON processing_queue
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutriq_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE kbmo_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE dutch_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE cgm_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_queue ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (you can customize these based on your auth requirements)
-- For now, allowing all operations - adjust based on your authentication setup
CREATE POLICY "Allow all operations on clients" ON clients FOR ALL USING (true);
CREATE POLICY "Allow all operations on lab_reports" ON lab_reports FOR ALL USING (true);
CREATE POLICY "Allow all operations on nutriq_results" ON nutriq_results FOR ALL USING (true);
CREATE POLICY "Allow all operations on kbmo_results" ON kbmo_results FOR ALL USING (true);
CREATE POLICY "Allow all operations on dutch_results" ON dutch_results FOR ALL USING (true);
CREATE POLICY "Allow all operations on cgm_data" ON cgm_data FOR ALL USING (true);
CREATE POLICY "Allow all operations on food_photos" ON food_photos FOR ALL USING (true);
CREATE POLICY "Allow all operations on processing_queue" ON processing_queue FOR ALL USING (true);

-- Insert some sample data for testing
INSERT INTO clients (email, first_name, last_name, date_of_birth) VALUES
('john.doe@example.com', 'John', 'Doe', '1985-03-15'),
('jane.smith@example.com', 'Jane', 'Smith', '1990-07-22'),
('mike.johnson@example.com', 'Mike', 'Johnson', '1978-11-08');

-- Create a view for easy client report access
CREATE VIEW client_reports_summary AS
SELECT 
    c.id as client_id,
    c.first_name,
    c.last_name,
    c.email,
    lr.id as report_id,
    lr.report_type,
    lr.report_date,
    lr.status,
    lr.created_at
FROM clients c
LEFT JOIN lab_reports lr ON c.id = lr.client_id
ORDER BY c.last_name, c.first_name, lr.report_date DESC;
