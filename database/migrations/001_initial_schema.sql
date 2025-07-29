-- Initial database schema for Nutrition Lab Management System

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    date_of_birth DATE,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lab reports table
CREATE TABLE IF NOT EXISTS public.lab_reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    filename TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lab results table
CREATE TABLE IF NOT EXISTS public.lab_results (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    lab_report_id UUID REFERENCES public.lab_reports(id) ON DELETE CASCADE NOT NULL,
    test_name TEXT NOT NULL,
    value TEXT NOT NULL,
    unit TEXT,
    reference_range TEXT,
    status TEXT CHECK (status IN ('normal', 'high', 'low', 'critical')),
    raw_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI analysis results table
CREATE TABLE IF NOT EXISTS public.ai_analysis (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    lab_report_id UUID REFERENCES public.lab_reports(id) ON DELETE CASCADE NOT NULL,
    analysis_type TEXT NOT NULL,
    content JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lab_reports_user_id ON public.lab_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_lab_reports_status ON public.lab_reports(status);
CREATE INDEX IF NOT EXISTS idx_lab_results_report_id ON public.lab_results(lab_report_id);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_report_id ON public.ai_analysis(lab_report_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analysis ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Profiles: Users can only see their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Lab reports: Users can only see their own reports
CREATE POLICY "Users can view own lab reports" ON public.lab_reports
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own lab reports" ON public.lab_reports
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lab reports" ON public.lab_reports
    FOR UPDATE USING (auth.uid() = user_id);

-- Lab results: Users can only see results from their own reports
CREATE POLICY "Users can view own lab results" ON public.lab_results
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.lab_reports 
            WHERE lab_reports.id = lab_results.lab_report_id 
            AND lab_reports.user_id = auth.uid()
        )
    );

-- AI analysis: Users can only see analysis from their own reports
CREATE POLICY "Users can view own ai analysis" ON public.ai_analysis
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.lab_reports 
            WHERE lab_reports.id = ai_analysis.lab_report_id 
            AND lab_reports.user_id = auth.uid()
        )
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lab_reports_updated_at BEFORE UPDATE ON public.lab_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
