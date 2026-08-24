import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LogoutButton from './logout-button'
import { sendMessage } from '../actions'

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

export default async function MinSide({ searchParams }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const params = await searchParams
  const justSent = params?.sendt === '1'

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*')
    .eq('user_id', user.id)
    .order('start_date', { ascending: false })

  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

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
        <div className="booking-list" style={{ marginBottom: 48 }}>
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
        <div className="empty-state" style={{ marginBottom: 48 }}>
          Du har endnu ingen lejemål. Når du booker værktøj, vises det her.
        </div>
      )}

      <div className="section-title">Dine beskeder</div>

      {justSent && (
        <div
          style={{
            background: '#e1f5ee',
            color: '#04342c',
            borderRadius: 8,
            padding: '10px 14px',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#0f6e56', display: 'inline-block' }} />
          Din besked er sendt
        </div>
      )}

      <form action={sendMessage} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
        <textarea
          name="body"
          placeholder="Skriv en besked til Skur..."
          required
          rows={3}
          style={{ flex: 1, minWidth: 240, padding: 10 }}
        />
        <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '10px 20px', alignSelf: 'flex-start' }}>
          Send
        </button>
      </form>

      {messages && messages.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                background: '#f4efe6',
                borderRadius: 10,
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div className="sub">{new Date(msg.created_at).toLocaleString('da-DK')}</div>
              <p style={{ margin: 0 }}>{msg.body}</p>
              {msg.reply ? (
                <div style={{ background: '#e1f5ee', borderRadius: 8, padding: 10 }}>
                  <div style={{ fontSize: 12, color: '#0f6e56', marginBottom: 4 }}>Svar fra Skur</div>
                  <p style={{ margin: 0, color: '#04342c' }}>{msg.reply}</p>
                </div>
              ) : (
                <div className="sub" style={{ fontStyle: 'italic' }}>Afventer svar...</div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">Du har ikke sendt nogen beskeder endnu.</div>
      )}
    </div>
  )
}
