-- AI Email Generation feature migration
-- Tracks generated emails and daily usage quotas per subscription tier

-- Table for storing AI generated email history (kept for 7 days)
CREATE TABLE IF NOT EXISTS ai_email_generations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Generation specification
    design_spec JSONB NOT NULL DEFAULT '{}',
    email_purpose JSONB NOT NULL DEFAULT '{}',
    additional_notes TEXT,
    logo_url TEXT,

    -- Generated content
    generated_subject TEXT,
    generated_html TEXT,

    -- Status tracking
    status TEXT NOT NULL DEFAULT 'generated' CHECK (status IN ('generating', 'generated', 'saved', 'failed')),
    saved_template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
    error_message TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days')
);

-- Table for tracking daily AI generation usage
CREATE TABLE IF NOT EXISTS ai_generation_daily_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
    generations_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(organization_id, usage_date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_email_generations_user_id ON ai_email_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_email_generations_org_id ON ai_email_generations(organization_id);
CREATE INDEX IF NOT EXISTS idx_ai_email_generations_status ON ai_email_generations(status);
CREATE INDEX IF NOT EXISTS idx_ai_email_generations_expires_at ON ai_email_generations(expires_at);
CREATE INDEX IF NOT EXISTS idx_ai_generation_daily_usage_org_date ON ai_generation_daily_usage(organization_id, usage_date);

-- Function to clean up expired generations (older than 7 days and not saved)
CREATE OR REPLACE FUNCTION cleanup_expired_ai_generations()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM ai_email_generations
    WHERE expires_at < NOW()
    AND status != 'saved';

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get AI generation tier limits
CREATE OR REPLACE FUNCTION get_ai_generation_limit(tier subscription_tier)
RETURNS INTEGER AS $$
BEGIN
    RETURN CASE tier
        WHEN 'free' THEN 0
        WHEN 'basic' THEN 1
        WHEN 'regular' THEN 2
        WHEN 'pro' THEN 5
        ELSE 0
    END;
END;
$$ LANGUAGE plpgsql;

-- Function to check if organization can generate AI email
CREATE OR REPLACE FUNCTION can_generate_ai_email(org_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    org_tier subscription_tier;
    daily_limit INTEGER;
    current_usage INTEGER;
BEGIN
    -- Get organization tier
    SELECT subscription_tier INTO org_tier
    FROM organizations
    WHERE id = org_id;

    -- Get tier limit
    daily_limit := get_ai_generation_limit(org_tier);

    -- Free tier cannot generate
    IF daily_limit = 0 THEN
        RETURN FALSE;
    END IF;

    -- Get current usage
    SELECT COALESCE(generations_count, 0) INTO current_usage
    FROM ai_generation_daily_usage
    WHERE organization_id = org_id
    AND usage_date = CURRENT_DATE;

    RETURN current_usage < daily_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to get remaining AI generations for today
CREATE OR REPLACE FUNCTION get_remaining_ai_generations(org_id UUID)
RETURNS INTEGER AS $$
DECLARE
    org_tier subscription_tier;
    daily_limit INTEGER;
    current_usage INTEGER;
BEGIN
    -- Get organization tier
    SELECT subscription_tier INTO org_tier
    FROM organizations
    WHERE id = org_id;

    -- Get tier limit
    daily_limit := get_ai_generation_limit(org_tier);

    -- Get current usage
    SELECT COALESCE(generations_count, 0) INTO current_usage
    FROM ai_generation_daily_usage
    WHERE organization_id = org_id
    AND usage_date = CURRENT_DATE;

    RETURN GREATEST(daily_limit - current_usage, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to increment AI generation usage
CREATE OR REPLACE FUNCTION increment_ai_generation_usage(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    INSERT INTO ai_generation_daily_usage (organization_id, usage_date, generations_count)
    VALUES (org_id, CURRENT_DATE, 1)
    ON CONFLICT (organization_id, usage_date)
    DO UPDATE SET
        generations_count = ai_generation_daily_usage.generations_count + 1,
        updated_at = NOW();

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE ai_email_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generation_daily_usage ENABLE ROW LEVEL SECURITY;

-- Users can view their own generations
CREATE POLICY "Users can view own generations"
    ON ai_email_generations FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own generations
CREATE POLICY "Users can insert own generations"
    ON ai_email_generations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own generations
CREATE POLICY "Users can update own generations"
    ON ai_email_generations FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can view their organization's usage
CREATE POLICY "Users can view org usage"
    ON ai_generation_daily_usage FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
        )
    );

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_ai_generation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ai_email_generations_updated_at
    BEFORE UPDATE ON ai_email_generations
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_generation_updated_at();

CREATE TRIGGER ai_generation_daily_usage_updated_at
    BEFORE UPDATE ON ai_generation_daily_usage
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_generation_updated_at();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON ai_email_generations TO authenticated;
GRANT SELECT ON ai_generation_daily_usage TO authenticated;
