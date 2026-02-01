import { NextRequest, NextResponse } from 'next/server'
import { getClientForUser } from '@/lib/supabase/admin'
import { TIER_LIMITS, SubscriptionTier } from '@/app/api/organization/usage/route'
import type { AIEmailDesignSpec, AIEmailPurpose } from '@/types/database'

// Gemini API configuration
const GEMINI_MODEL = 'gemini-2.0-flash'
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

interface GenerateRequest {
  designSpec: AIEmailDesignSpec
  emailPurpose: AIEmailPurpose
  additionalNotes?: string
  logoUrl?: string
}

// Build prompt for Gemini based on specifications
function buildPrompt(spec: GenerateRequest): string {
  const { designSpec, emailPurpose, additionalNotes, logoUrl } = spec

  let prompt = `You are an expert email marketing designer and copywriter. Generate a professional HTML email based on the following specifications.

## Design Specifications:
- Layout: ${designSpec.layout}
- Color Scheme: ${designSpec.colorScheme}
- Primary Color: ${designSpec.primaryColor}
- Secondary Color: ${designSpec.secondaryColor}
- Accent Color #1: ${designSpec.accentColor1}
- Accent Color #2: ${designSpec.accentColor2}
- Accent Color #3: ${designSpec.accentColor3}
- Font Family: ${designSpec.fontFamily}
- Font Size: ${designSpec.fontSize}
- Header Style: ${designSpec.headerStyle}
- Footer Style: ${designSpec.footerStyle}
- Button Style: ${designSpec.buttonStyle}
- Image Position: ${designSpec.imagePosition}
- Spacing: ${designSpec.spacing}
- Border Style: ${designSpec.borderStyle}
- Shadow Style: ${designSpec.shadowStyle}
- Visual Effects: ${designSpec.visualEffects}
- Responsive Design: ${designSpec.responsiveDesign ? 'Yes' : 'No'}
- Dark Mode Support: ${designSpec.darkModeSupport ? 'Yes' : 'No'}

## Email Purpose:
- Email Type: ${emailPurpose.emailType}
- Industry: ${emailPurpose.industry}
- Target Audience: ${emailPurpose.targetAudience}
- Primary Goal: ${emailPurpose.primaryGoal}
- Call to Action: ${emailPurpose.callToAction}
- Urgency Level: ${emailPurpose.urgencyLevel}
- Personalization Fields: ${emailPurpose.personalization.join(', ') || 'None'}
- Language: ${emailPurpose.language}
- Writing Style: ${emailPurpose.writingStyle}
- Tone: ${emailPurpose.tone}
- Formality: ${emailPurpose.formality}
- Content Length: ${emailPurpose.contentLength}
- Include Elements: ${emailPurpose.includeElements.join(', ') || 'None'}
`

  if (logoUrl) {
    prompt += `\n## Logo:
Include this logo in the email header: ${logoUrl}
`
  }

  if (additionalNotes) {
    prompt += `\n## Additional Notes:
${additionalNotes}
`
  }

  prompt += `
## Requirements:
1. Generate a complete, valid HTML email that works across major email clients (Gmail, Outlook, Apple Mail)
2. Use inline CSS styles for maximum compatibility
3. Use table-based layout for email client compatibility
4. Include proper DOCTYPE and meta tags
5. Make it mobile-responsive using media queries in a <style> tag
6. Use the personalization placeholders in format {{placeholder_name}} for: ${emailPurpose.personalization.join(', ') || 'name, company'}
7. Include an unsubscribe link placeholder at the bottom

## Output Format:
Respond with a JSON object containing exactly two fields:
1. "subject": A compelling email subject line (max 60 characters)
2. "html": The complete HTML email code

IMPORTANT: Only return the JSON object, no additional text or markdown formatting.
Example format:
{"subject": "Your Subject Here", "html": "<!DOCTYPE html>..."}
`

  return prompt
}

// Call Gemini API
async function generateWithGemini(prompt: string): Promise<{ subject: string; html: string }> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured')
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Gemini API error:', response.status, errorText)
    console.error('Gemini API URL used:', GEMINI_API_URL)

    // Parse error for more details
    try {
      const errorJson = JSON.parse(errorText)
      const errorMessage = errorJson.error?.message || `Gemini API error: ${response.status}`
      throw new Error(errorMessage)
    } catch {
      throw new Error(`Gemini API error: ${response.status}`)
    }
  }

  const data = await response.json()
  const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text

  if (!generatedText) {
    throw new Error('No content generated from Gemini')
  }

  // Parse the JSON response
  try {
    // Clean up the response - remove markdown code blocks if present
    let cleanedText = generatedText.trim()
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.slice(7)
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.slice(3)
    }
    if (cleanedText.endsWith('```')) {
      cleanedText = cleanedText.slice(0, -3)
    }
    cleanedText = cleanedText.trim()

    const result = JSON.parse(cleanedText)

    if (!result.subject || !result.html) {
      throw new Error('Invalid response format from Gemini')
    }

    return {
      subject: result.subject,
      html: result.html,
    }
  } catch {
    console.error('Failed to parse Gemini response:', generatedText)
    throw new Error('Failed to parse AI response')
  }
}

// POST - Generate AI email
export async function POST(request: NextRequest) {
  try {
    const { client, user, profile } = await getClientForUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!profile?.organization_id) {
      return NextResponse.json({ error: 'No organization assigned' }, { status: 403 })
    }

    // Get organization tier
    const { data: org, error: orgError } = await client
      .from('organizations')
      .select('id, subscription_tier')
      .eq('id', profile.organization_id)
      .single()

    if (orgError || !org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    const tier = (org.subscription_tier || 'free') as SubscriptionTier
    const limits = TIER_LIMITS[tier]

    // Check if tier allows AI generation
    if (limits.maxAIGenerationsPerDay === 0) {
      return NextResponse.json({
        error: 'AI email generation is not available on your current plan',
        upgradeRequired: true,
      }, { status: 403 })
    }

    // Check daily quota
    const today = new Date().toISOString().split('T')[0]
    const { data: usageData } = await client
      .from('ai_generation_daily_usage')
      .select('generations_count')
      .eq('organization_id', profile.organization_id)
      .eq('usage_date', today)
      .single()

    const currentUsage = usageData?.generations_count || 0
    if (currentUsage >= limits.maxAIGenerationsPerDay) {
      return NextResponse.json({
        error: 'Daily AI generation quota exceeded',
        quotaExceeded: true,
        remaining: 0,
        limit: limits.maxAIGenerationsPerDay,
      }, { status: 429 })
    }

    // Parse request body
    const body: GenerateRequest = await request.json()
    const { designSpec, emailPurpose, additionalNotes, logoUrl } = body

    if (!designSpec || !emailPurpose) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create generation record with 'generating' status
    const { data: generation, error: insertError } = await client
      .from('ai_email_generations')
      .insert({
        user_id: user.id,
        organization_id: profile.organization_id,
        design_spec: designSpec,
        email_purpose: emailPurpose,
        additional_notes: additionalNotes || null,
        logo_url: logoUrl || null,
        status: 'generating',
      })
      .select()
      .single()

    if (insertError || !generation) {
      console.error('Failed to create generation record:', insertError)
      return NextResponse.json({ error: 'Failed to create generation record' }, { status: 500 })
    }

    try {
      // Build prompt and generate with Gemini
      const prompt = buildPrompt(body)
      const result = await generateWithGemini(prompt)

      // Update generation record with result
      const { data: updatedGeneration, error: updateError } = await client
        .from('ai_email_generations')
        .update({
          generated_subject: result.subject,
          generated_html: result.html,
          status: 'generated',
        })
        .eq('id', generation.id)
        .select()
        .single()

      if (updateError) {
        console.error('Failed to update generation record:', updateError)
      }

      // Increment daily usage
      await client
        .from('ai_generation_daily_usage')
        .upsert({
          organization_id: profile.organization_id,
          usage_date: today,
          generations_count: currentUsage + 1,
        }, {
          onConflict: 'organization_id,usage_date',
        })

      return NextResponse.json({
        data: {
          id: generation.id,
          subject: result.subject,
          html: result.html,
          remaining: limits.maxAIGenerationsPerDay - currentUsage - 1,
        }
      })
    } catch (genError) {
      // Update generation record with error
      await client
        .from('ai_email_generations')
        .update({
          status: 'failed',
          error_message: genError instanceof Error ? genError.message : 'Unknown error',
        })
        .eq('id', generation.id)

      throw genError
    }
  } catch (error) {
    console.error('AI email generation error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to generate email',
    }, { status: 500 })
  }
}
