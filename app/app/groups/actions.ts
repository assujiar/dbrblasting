"use server"

import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function createGroup(formData: FormData) {
  const name = formData.get('name') as string
  const supabase = createServerSupabaseClient()
  const { error } = await supabase.from('contact_groups').insert({ name })
  if (error) {
    throw new Error(error.message)
  }
  revalidatePath('/app/groups')
}

export async function deleteGroup(id: string) {
  const supabase = createServerSupabaseClient()
  const { error } = await supabase.from('contact_groups').delete().eq('id', id)
  if (error) {
    throw new Error(error.message)
  }
  revalidatePath('/app/groups')
}

export async function addLeadToGroup(groupId: string, leadId: string) {
  const supabase = createServerSupabaseClient()
  const { error } = await supabase.from('contact_group_members').insert({ group_id: groupId, lead_id: leadId })
  if (error) {
    throw new Error(error.message)
  }
  revalidatePath('/app/groups')
}

export async function removeLeadFromGroup(memberId: string) {
  const supabase = createServerSupabaseClient()
  const { error } = await supabase.from('contact_group_members').delete().eq('id', memberId)
  if (error) {
    throw new Error(error.message)
  }
  revalidatePath('/app/groups')
}