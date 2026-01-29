"use server"

import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function createTemplate(formData: FormData) {
  const name = formData.get('name') as string
  const subject = formData.get('subject') as string
  const html_body = formData.get('html_body') as string
  const supabase = createServerSupabaseClient()
  const { error } = await supabase.from('email_templates').insert({ name, subject, html_body })
  if (error) {
    throw new Error(error.message)
  }
  revalidatePath('/app/templates')
}

export async function updateTemplate(id: string, formData: FormData) {
  const name = formData.get('name') as string
  const subject = formData.get('subject') as string
  const html_body = formData.get('html_body') as string
  const supabase = createServerSupabaseClient()
  const { error } = await supabase.from('email_templates').update({ name, subject, html_body }).eq('id', id)
  if (error) {
    throw new Error(error.message)
  }
  revalidatePath('/app/templates')
}

export async function deleteTemplate(id: string) {
  const supabase = createServerSupabaseClient()
  const { error } = await supabase.from('email_templates').delete().eq('id', id)
  if (error) {
    throw new Error(error.message)
  }
  revalidatePath('/app/templates')
}