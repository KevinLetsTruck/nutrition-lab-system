-- Create email_verifications table
CREATE TABLE IF NOT EXISTS email_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Index for token lookups
    INDEX idx_email_verifications_token (token),
    -- Index for cleanup of expired tokens
    INDEX idx_email_verifications_expires_at (expires_at)
);

-- Add comment
COMMENT ON TABLE email_verifications IS 'Stores email verification tokens for user registration';