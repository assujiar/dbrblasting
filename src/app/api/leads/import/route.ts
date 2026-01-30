import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isValidEmail } from '@/lib/utils'
import * as XLSX from 'xlsx'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Read Excel file
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<string, unknown>[]

    if (jsonData.length === 0) {
      return NextResponse.json({ error: 'File is empty or has no valid data' }, { status: 400 })
    }

    // Validate and transform data
    const leads: { name: string; email: string; company: string; phone: string }[] = []
    const errors: string[] = []

    jsonData.forEach((row, index) => {
      const rowNum = index + 2 // Excel rows start at 1, plus header row

      // Get values with case-insensitive key matching
      const getValue = (keys: string[]): string => {
        for (const key of keys) {
          const found = Object.keys(row).find(k => k.toLowerCase() === key.toLowerCase())
          if (found && row[found]) {
            return String(row[found]).trim()
          }
        }
        return ''
      }

      const name = getValue(['name', 'nama', 'full_name', 'fullname', 'contact_name'])
      const email = getValue(['email', 'e-mail', 'email_address', 'alamat_email'])
      const company = getValue(['company', 'perusahaan', 'company_name', 'organization', 'organisasi'])
      const phone = getValue(['phone', 'telepon', 'hp', 'mobile', 'phone_number', 'nomor_hp', 'nomor_telepon'])

      if (!name) {
        errors.push(`Row ${rowNum}: Name is required`)
        return
      }

      if (!email) {
        errors.push(`Row ${rowNum}: Email is required`)
        return
      }

      if (!isValidEmail(email)) {
        errors.push(`Row ${rowNum}: Invalid email format (${email})`)
        return
      }

      leads.push({
        name,
        email: email.toLowerCase(),
        company,
        phone,
      })
    })

    if (leads.length === 0) {
      return NextResponse.json({
        error: 'No valid leads found in file',
        details: errors
      }, { status: 400 })
    }

    // Deduplicate by email (keep first occurrence)
    const uniqueLeads = leads.reduce((acc, lead) => {
      if (!acc.find(l => l.email === lead.email)) {
        acc.push(lead)
      }
      return acc
    }, [] as typeof leads)

    // Insert leads (upsert to handle duplicates)
    const insertData = uniqueLeads.map(lead => ({
      user_id: user.id,
      name: lead.name,
      email: lead.email,
      company: lead.company,
      phone: lead.phone,
    }))

    const { data, error } = await supabase
      .from('leads')
      .upsert(insertData, {
        onConflict: 'user_id,email',
        ignoreDuplicates: false
      })
      .select()

    if (error) {
      console.error('Import error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      imported: data?.length || 0,
      total: jsonData.length,
      duplicatesSkipped: leads.length - uniqueLeads.length,
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
    })
  } catch (error) {
    console.error('Leads import error:', error)
    return NextResponse.json({ error: 'Failed to process file' }, { status: 500 })
  }
}

// Download template endpoint
export async function GET() {
  try {
    // Create sample data
    const sampleData = [
      { name: 'John Doe', email: 'john@example.com', company: 'Acme Corp', phone: '+1234567890' },
      { name: 'Jane Smith', email: 'jane@example.com', company: 'Tech Inc', phone: '+0987654321' },
      { name: 'Ahmad Wijaya', email: 'ahmad@example.com', company: 'PT Maju Jaya', phone: '+628123456789' },
    ]

    // Create workbook
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(sampleData)

    // Set column widths
    worksheet['!cols'] = [
      { wch: 20 }, // name
      { wch: 25 }, // email
      { wch: 20 }, // company
      { wch: 15 }, // phone
    ]

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads')

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="leads_template.xlsx"',
      },
    })
  } catch (error) {
    console.error('Template download error:', error)
    return NextResponse.json({ error: 'Failed to generate template' }, { status: 500 })
  }
}
