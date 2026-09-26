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

export async function markBookingReturned(bookingId) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return

  await supabase
    .from('bookings')
    .update({ customer_returned_at: new Date().toISOString() })
    .eq('id', bookingId)
    .eq('user_id', user.id)

  revalidatePath('/min-side')
}

export async function cancelBooking(bookingId) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return

  const { data: booking } = await supabase
    .from('bookings')
    .select('start_date, user_id, cancelled_at, returned_at')
    .eq('id', bookingId)
    .single()

  if (!booking || booking.user_id !== user.id) return
  if (booking.cancelled_at || booking.returned_at) return

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (new Date(booking.start_date) <= today) return

  await supabase
    .from('bookings')
    .update({ cancelled_at: new Date().toISOString() })
    .eq('id', bookingId)
    .eq('user_id', user.id)

  revalidatePath('/min-side')
}
