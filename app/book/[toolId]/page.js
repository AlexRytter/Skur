import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BookingForm from './booking-form'

export default async function BookTool({ params }) {
  const { toolId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // ikke logget ind -> send til login først
  if (!user) {
    redirect('/login')
  }

  const { data: tool } = await supabase
    .from('tools')
    .select('*')
    .eq('id', toolId)
    .single()

  if (!tool) {
    notFound()
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1>{tool.name}</h1>
        <p className="sub">{tool.price_per_day} kr / dag — vælg den periode du vil leje.</p>
        <BookingForm tool={tool} />
      </div>
    </div>
  )
}
