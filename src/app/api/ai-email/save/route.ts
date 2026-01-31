import { NextRequest, NextResponse } from 'next/server'
import { getClientForUser } from '@/lib/supabase/admin'

interface SaveRequest {
  generationId: string
  templateName: string
  subject?: string
  html?: string
}

// POST - Save AI generated email as a template
export async function POST(request: NextRequest) {
  try {
    const { client, user, profile } = await getClientForUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!profile?.organization_id) {
      return NextResponse.json({ error: 'No organization assigned' }, { status: 403 })
    }

    const body: SaveRequest = await request.json()
    const { generationId, templateName, subject, html } = body

    if (!generationId || !templateName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get the generation record
    const { data: generation, error: genError } = await client
      .from('ai_email_generations')
      .select('*')
      .eq('id', generationId)
      .eq('user_id', user.id)
      .single()

    if (genError || !generation) {
      return NextResponse.json({ error: 'Generation not found' }, { status: 404 })
    }

    if (generation.status === 'saved') {
      return NextResponse.json({
        error: 'This email has already been saved',
        templateId: generation.saved_template_id,
      }, { status: 400 })
    }

    // Use provided subject/html or fall back to generation values
    const finalSubject = subject || generation.generated_subject
    const finalHtml = html || generation.generated_html

    if (!finalSubject || !finalHtml) {
      return NextResponse.json({ error: 'No content to save' }, { status: 400 })
    }

    // Create template
    const { data: template, error: templateError } = await client
      .from('email_templates')
      .insert({
        user_id: user.id,
        organization_id: profile.organization_id,
        name: templateName,
        subject: finalSubject,
        html_body: finalHtml,
      })
      .select()
      .single()

    if (templateError || !template) {
      console.error('Failed to create template:', templateError)
      return NextResponse.json({ error: 'Failed to save template' }, { status: 500 })
    }

    // Update generation record to mark as saved
    await client
      .from('ai_email_generations')
      .update({
        status: 'saved',
        saved_template_id: template.id,
      })
      .eq('id', generationId)

    return NextResponse.json({
      data: {
        templateId: template.id,
        message: 'Email saved as template successfully',
      }
    })
  } catch (error) {
    console.error('AI email save error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
