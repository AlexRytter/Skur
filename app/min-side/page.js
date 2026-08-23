import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LogoutButton from './logout-button'

function formatDate(d) {
  return new Date(d).toLocaleDateString('da-DK', { day: 'numeric', month: 'short' })
}

function getStatus(startDate, endDate) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const start = new Date(startDate)
  const end = new Date(endDate)

  if (today < start) return { label: 'Kommer op', className: 'upcoming' }
  if (today > end) return { label: 'Afsluttet', className: 'done' }
  return { label: 'Udlejet nu', className: 'active' }
}

export default async function MinSide() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // ikke logget ind -> send til login i stedet for at vise siden
  if (!user) {
    redirect('/login')
  }

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*')
    .eq('user_id', user.id)
    .order('start_date', { ascending: false })

  return (
    <div className="page-wrap">
      <div className="page-head">
        <div>
          <h1>Hej {user.email}</h1>
          <p>Her er dine lejemål og din profil hos Skur.</p>
        </div>
        <LogoutButton />
      </div>

      <div className="section-title">Dine lejemål</div>

      {bookings && bookings.length > 0 ? (
        <div className="booking-list">
          {bookings.map((b) => {
            const status = getStatus(b.start_date, b.end_date)
            return (
              <div className="booking-row" key={b.id}>
                <div>
                  <div className="tool-name">{b.tool_name}</div>
                  <div className="sub">{formatDate(b.start_date)} – {formatDate(b.end_date)}</div>
                </div>
                <div className="sub">
                  {b.delivery_type === 'delivery' ? 'Leveres' : 'Afhentet på Tuevej 7'}
                </div>
                <div className={`status-chip ${status.className}`}>{status.label}</div>
                <div className="row-price">{b.price} kr</div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="empty-state">
          Du har endnu ingen lejemål. Når du booker værktøj, vises det her.
        </div>
      )}
    </div>
  )
}
