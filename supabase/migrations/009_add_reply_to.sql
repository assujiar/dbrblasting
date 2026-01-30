-- Add smtp_reply_to field to organizations table
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS smtp_reply_to TEXT;

-- Comment
COMMENT ON COLUMN organizations.smtp_reply_to IS 'Custom Reply-To email address for email campaigns';
