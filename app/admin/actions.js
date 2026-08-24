'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addTool(formData) {
  const supabase = await createClient()
  await supabase.from('tools').insert({
    name: formData.get('name'),
    price_per_day: Number(formData.get('price_per_day')),
    available: true,
  })
  revalidatePath('/admin')
  revalidatePath('/')
}

export async function updateTool(id, formData) {
  const supabase = await createClient()
  await supabase
    .from('tools')
    .update({
      name: formData.get('name'),
      price_per_day: Number(formData.get('price_per_day')),
    })
    .eq('id', id)
  revalidatePath('/admin')
  revalidatePath('/')
}

export async function toggleAvailable(id, currentValue) {
  const supabase = await createClient()
  await supabase
    .from('tools')
    .update({ available: !currentValue })
    .eq('id', id)
  revalidatePath('/admin')
  revalidatePath('/')
}

export async function deleteTool(id) {
  const supabase = await createClient()
  await supabase.from('tools').delete().eq('id', id)
  revalidatePath('/admin')
  revalidatePath('/')
}

export async function replyToMessage(id, formData) {
  const supabase = await createClient()
  await supabase
    .from('messages')
    .update({ reply: formData.get('reply') })
    .eq('id', id)
  revalidatePath('/admin')
}
