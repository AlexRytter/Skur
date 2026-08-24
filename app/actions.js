'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function sendMessage(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return

  await supabase.from('messages').insert({
    user_id: user.id,
    user_email: user.email,
    body: formData.get('body'),
  })

  revalidatePath('/min-side')
  redirect('/min-side?sendt=1')
}
