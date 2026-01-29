"use server"

import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function createLead(formData: FormData) {
  const name = formData.get('name') as string
  const company = formData.get('company') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const supabase = createServerSupabaseClient()
  const { error } = await supabase.from('leads').insert({ name, company, email, phone })
  if (error) {
    throw new Error(error.message)
  }
  revalidatePath('/app/leads')
}

export async function updateLead(id: string, formData: FormData) {
  const name = formData.get('name') as string
  const company = formData.get('company') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const supabase = createServerSupabaseClient()
  const { error } = await supabase.from('leads').update({ name, company, email, phone }).eq('id', id)
  if (error) {
    throw new Error(error.message)
  }
  revalidatePath('/app/leads')
}

export async function deleteLead(id: string) {
  const supabase = createServerSupabaseClient()
  const { error } = await supabase.from('leads').delete().eq('id', id)
  if (error) {
    throw new Error(error.message)
  }
  revalidatePath('/app/leads')
}