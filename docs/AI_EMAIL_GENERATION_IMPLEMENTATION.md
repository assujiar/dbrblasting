# AI Email Generation Feature - Implementation Guide

## Overview

This document provides a comprehensive guide for implementing and configuring the AI Email Generation feature in BlastMail. This feature allows users to generate professional HTML email templates using Gemini AI based on their design specifications and content requirements.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Environment Configuration](#environment-configuration)
4. [Architecture Overview](#architecture-overview)
5. [API Endpoints](#api-endpoints)
6. [Subscription Tier Limits](#subscription-tier-limits)
7. [Frontend Components](#frontend-components)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Dependencies

The following packages are required (already installed):
- `chart.js` - For dashboard visualizations
- `react-chartjs-2` - React wrapper for Chart.js

### External Services

1. **Gemini API** - Google's AI model for generating email content
   - You need a Gemini API key from Google AI Studio
   - Model used: `gemini-1.5-flash` (stable, fast)

---

## Database Setup

### Step 1: Run the Migration

Execute the migration file to create the required tables:

```sql
-- Run this in your Supabase SQL Editor
-- File: supabase/migrations/018_ai_email_generation.sql
```

This migration creates:

1. **`ai_email_generations` table** - Stores generation history
   - `id` - UUID primary key
   - `user_id` - Reference to auth.users
   - `organization_id` - Reference to organizations
   - `design_spec` - JSONB for design specifications
   - `email_purpose` - JSONB for email purpose/content specs
   - `additional_notes` - Optional text notes (max 100 chars)
   - `logo_url` - Optional logo URL
   - `generated_subject` - Generated email subject
   - `generated_html` - Generated HTML content
   - `status` - generating | generated | saved | failed
   - `saved_template_id` - Reference if saved as template
   - `error_message` - Error details if failed
   - `expires_at` - Auto-expiry after 7 days

2. **`ai_generation_daily_usage` table** - Tracks daily quota usage
   - `organization_id` - Reference to organizations
   - `usage_date` - Date of usage
   - `generations_count` - Number of generations used

3. **Database Functions**:
   - `get_ai_generation_limit(tier)` - Returns daily limit for tier
   - `can_generate_ai_email(org_id)` - Checks if org can generate
   - `get_remaining_ai_generations(org_id)` - Gets remaining quota
   - `increment_ai_generation_usage(org_id)` - Increments usage
   - `cleanup_expired_ai_generations()` - Cleans up old entries

### Step 2: Verify Tables

After running the migration, verify the tables exist:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('ai_email_generations', 'ai_generation_daily_usage');
```

---

## Environment Configuration

### Step 1: Get Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Navigate to "Get API Key"
4. Create a new API key or use existing one
5. Copy the API key

### Step 2: Add Environment Variable

Add the following to your `.env.local` file:

```env
# Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here
```

**Important**: Never commit your API key to version control.

### Step 3: Verify Configuration

Test the API key by making a simple request:

```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
```

---

## Architecture Overview

### System Flow

```
User -> AI Email Page -> Design Spec Form
                      -> Email Purpose Form
                      -> Additional Notes
                      -> Generate Button
                             |
                             v
                    API: /api/ai-email/generate
                             |
                             v
                    Check Quota (Tier Limits)
                             |
                             v
                    Upload Logo (if present)
                             |
                             v
                    Build Prompt
                             |
                             v
                    Call Gemini API
                             |
                             v
                    Save to ai_email_generations
                             |
                             v
                    Return Generated Email
                             |
                             v
                    User Preview & Edit
                             |
                             v
                    Save as Template (optional)
```

### File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── ai-email/
│   │   │   ├── generate/
│   │   │   │   └── route.ts      # Main generation endpoint
│   │   │   ├── history/
│   │   │   │   └── route.ts      # Get generation history
│   │   │   └── save/
│   │   │       └── route.ts      # Save as template
│   │   └── organization/
│   │       └── usage/
│   │           └── route.ts      # Updated with AI quota
│   └── app/
│       └── ai-email/
│           └── page.tsx          # Main AI Email page
├── components/
│   └── layout/
│       └── sidebar.tsx           # Updated with AI Email menu
└── types/
    └── database.ts               # Updated with AI types
```

---

## API Endpoints

### 1. Generate Email

**POST** `/api/ai-email/generate`

Request body:
```json
{
  "designSpec": {
    "layout": "single-column",
    "colorScheme": "light",
    "primaryColor": "#2563eb",
    "secondaryColor": "#64748b",
    "fontFamily": "arial",
    "fontSize": "medium",
    "headerStyle": "centered",
    "footerStyle": "simple",
    "buttonStyle": "rounded",
    "imagePosition": "top",
    "spacing": "normal",
    "borderStyle": "none",
    "shadowStyle": "subtle",
    "responsiveDesign": true,
    "darkModeSupport": false
  },
  "emailPurpose": {
    "emailType": "promotional",
    "industry": "technology",
    "targetAudience": "b2b-managers",
    "primaryGoal": "drive-sales",
    "callToAction": "learn-more",
    "urgencyLevel": "none",
    "personalization": ["name", "company"],
    "language": "indonesian",
    "writingStyle": "professional",
    "tone": "friendly",
    "formality": "neutral",
    "contentLength": "medium",
    "includeElements": ["social-links"]
  },
  "additionalNotes": "Include 20% discount mention",
  "logoUrl": "https://example.com/logo.png"
}
```

Response (success):
```json
{
  "data": {
    "id": "uuid-here",
    "subject": "Generated Subject Line",
    "html": "<!DOCTYPE html>...",
    "remaining": 2
  }
}
```

Response (error - quota exceeded):
```json
{
  "error": "Daily AI generation quota exceeded",
  "quotaExceeded": true,
  "remaining": 0,
  "limit": 2
}
```

### 2. Get History

**GET** `/api/ai-email/history`

Response:
```json
{
  "data": [
    {
      "id": "uuid",
      "design_spec": {...},
      "email_purpose": {...},
      "generated_subject": "Subject",
      "generated_html": "<!DOCTYPE...",
      "status": "generated",
      "created_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### 3. Save as Template

**POST** `/api/ai-email/save`

Request body:
```json
{
  "generationId": "uuid-of-generation",
  "templateName": "My Email Template",
  "subject": "Optional updated subject",
  "html": "Optional updated HTML"
}
```

Response:
```json
{
  "data": {
    "templateId": "uuid-of-new-template",
    "message": "Email saved as template successfully"
  }
}
```

---

## Subscription Tier Limits

### Current Limits

| Tier    | AI Generations/Day | Other Limits |
|---------|-------------------|--------------|
| Free    | 0 (Not available) | 5 emails/day |
| Basic   | 1                 | 50 emails/day |
| Regular | 2                 | 100 emails/day |
| Pro     | 5                 | 500 emails/day |

### Configuring Limits

Limits are defined in two places:

1. **API Route** (`src/app/api/organization/usage/route.ts`):
```typescript
export const TIER_LIMITS = {
  free: { maxCampaigns: 1, maxRecipientsPerDay: 5, hasWatermark: true, maxAIGenerationsPerDay: 0 },
  basic: { maxCampaigns: 3, maxRecipientsPerDay: 50, hasWatermark: false, maxAIGenerationsPerDay: 1 },
  regular: { maxCampaigns: 5, maxRecipientsPerDay: 100, hasWatermark: false, maxAIGenerationsPerDay: 2 },
  pro: { maxCampaigns: 10, maxRecipientsPerDay: 500, hasWatermark: false, maxAIGenerationsPerDay: 5 },
}
```

2. **Database Function** (`supabase/migrations/018_ai_email_generation.sql`):
```sql
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
```

To change limits, update both locations to keep them in sync.

---

## Frontend Components

### AI Email Page Sections

The AI Email page (`src/app/app/ai-email/page.tsx`) has 4 main sections:

#### 1. Design Specification
- Layout selection
- Color scheme & custom colors
- Typography (font family, size)
- Header/Footer styles
- Button styles
- Image positioning
- Spacing, borders, shadows
- Responsive/dark mode options
- Logo upload

#### 2. Email Purpose
- Email type (promotional, newsletter, etc.)
- Industry selection
- Target audience
- Primary goal
- Call to action
- Urgency level
- Language selection
- Writing style & tone
- Formality level
- Content length
- Personalization fields
- Additional elements

#### 3. Additional Notes
- Free-form text input (max 100 characters)
- For specific instructions to the AI

#### 4. Result/Preview
- Shows generated email subject
- Full HTML preview in iframe
- Regenerate button
- Save as template button

### Component Features

1. **Quota Display**: Shows remaining generations in header
2. **History Dialog**: Access past generations (7 days)
3. **Free Tier Block**: Shows upgrade message for free users
4. **Progress Indicator**: Visual step indicator for sections
5. **Form Validation**: Required fields checked before generation

---

## Testing

### Manual Testing Checklist

1. **Free Tier User**
   - [ ] Should see "Upgrade to use this feature" message
   - [ ] Should not be able to access generation form

2. **Paid Tier User (Basic/Regular/Pro)**
   - [ ] Should see quota indicator (X/Y generations left)
   - [ ] Should be able to fill all form sections
   - [ ] Should be able to upload logo
   - [ ] Should be able to generate email
   - [ ] Should see preview of generated email
   - [ ] Should be able to save as template
   - [ ] Should be able to regenerate
   - [ ] Should see history of past generations

3. **Quota Enforcement**
   - [ ] Should decrement quota after generation
   - [ ] Should show error when quota exceeded
   - [ ] Quota should reset next day

4. **History**
   - [ ] Should show generations from last 7 days
   - [ ] Should be able to load previous generation
   - [ ] Saved generations should not appear in history

### API Testing

Test with curl or Postman:

```bash
# Test generation endpoint
curl -X POST http://localhost:3000/api/ai-email/generate \
  -H "Content-Type: application/json" \
  -H "Cookie: your-auth-cookie" \
  -d '{
    "designSpec": {...},
    "emailPurpose": {...}
  }'

# Test history endpoint
curl http://localhost:3000/api/ai-email/history \
  -H "Cookie: your-auth-cookie"

# Test save endpoint
curl -X POST http://localhost:3000/api/ai-email/save \
  -H "Content-Type: application/json" \
  -H "Cookie: your-auth-cookie" \
  -d '{
    "generationId": "uuid",
    "templateName": "Test Template"
  }'
```

---

## Troubleshooting

### Common Issues

#### 1. "GEMINI_API_KEY is not configured"
- Ensure `GEMINI_API_KEY` is set in `.env.local`
- Restart the development server after adding

#### 2. "Daily AI generation quota exceeded"
- User has used all daily generations
- Wait until next day or upgrade plan

#### 3. "AI email generation is not available on your current plan"
- User is on free tier
- Need to upgrade to Basic or higher

#### 4. "Failed to parse AI response"
- Gemini returned unexpected format
- Check Gemini API status
- Try regenerating

#### 5. Generations not showing in history
- Check if status is 'generated' (not 'saved' or 'failed')
- Check if within 7-day window
- Check organization_id matches

### Debug Logging

Enable debug logging by checking server console for:
- `AI email generation error:` - Main generation errors
- `Gemini API error:` - API call failures
- `Failed to parse Gemini response:` - Parsing issues

### Database Cleanup

To manually clean expired generations:

```sql
SELECT cleanup_expired_ai_generations();
```

To check generation status:

```sql
SELECT id, status, created_at, expires_at
FROM ai_email_generations
WHERE organization_id = 'your-org-id'
ORDER BY created_at DESC;
```

---

## Security Considerations

1. **API Key Protection**
   - Never expose Gemini API key in client-side code
   - Keep in environment variables only

2. **Rate Limiting**
   - Quota system prevents abuse
   - Consider adding request-level rate limiting

3. **Input Validation**
   - All user inputs are validated
   - Additional notes limited to 100 characters

4. **Content Safety**
   - Gemini has built-in content filters
   - Generated content should still be reviewed

---

## Future Improvements

1. **Email Templates Library**
   - Pre-designed templates based on popular specs
   - One-click generation from templates

2. **A/B Testing**
   - Generate multiple variations
   - Track performance of each

3. **Image Generation**
   - Generate email images with AI
   - Automatic image placement

4. **Scheduling**
   - Schedule generation for later
   - Batch generation

5. **Analytics Integration**
   - Track performance of AI-generated emails
   - Provide improvement suggestions

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review server logs for errors
3. Contact development team with:
   - Error message
   - User tier
   - Request payload
   - Timestamp
