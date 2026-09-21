import { createClient } from '@/lib/supabase/server'
import { confirmBookingReceived } from '../actions'

export default async function BookingerPage() {
  const supabase = await createClient()

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*')
    .order('start_date', { ascending: false })

  const { data: customers } = await supabase
    .from('customer_profiles')
    .select('id, full_name, phone')

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <>
      <div className="section-title">Bookinger</div>
      <hr style={{ border: 'none', borderTop: '2px solid #2c2c2a', margin: '0 0 16px' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {bookings && bookings.length > 0 ? (
          bookings.map((b) => {
            const customer = (customers || []).find((c) => c.id === b.user_id)
            const isOverdue = new Date(b.end_date) < today && !b.returned_at

            return (
              <div
                key={b.id}
                style={{
                  background: '#f4efe6',
                  borderRadius: 10,
                  padding: 16,
                  border: '1px solid #1C201B',
                }}
              >
                {isOverdue && (
                  <div
                    style={{
                      background: '#fbeaea',
                      color: '#712b13',
                      padding: '10px 12px',
                      borderRadius: 8,
                      marginBottom: 10,
                      fontWeight: 500,
                      fontSize: 13,
                    }}
                  >
                    For sent! {customer?.full_name || 'Ukendt kunde'}
                    {customer?.phone ? ` (${customer.phone})` : ''} har ikke afleveret {b.tool_name} — skulle have været tilbage {new Date(b.end_date).toLocaleDateString('da-DK')}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <span style={{ fontWeight: 500 }}>{b.tool_name}</span>
                  <span
                    title={
                      b.delivery_type === 'delivery'
                        ? 'Værktøjet skal leveres til kundens adresse.'
                        : 'Kunden henter selv værktøjet på Tuevej 7.'
                    }
                    className="status-chip"
                    style={
                      b.delivery_type === 'delivery'
                        ? { background: '#e6f1fb', color: '#0c447c', cursor: 'help' }
                        : { background: '#eaf3de', color: '#173404', cursor: 'help' }
                    }
                  >
                    {b.delivery_type === 'delivery' ? 'Levering' : 'Afhentning'}
                  </span>
                </div>

                <p style={{ fontSize: 13, color: '#5f5e5a', margin: '4px 0' }}>
                  {new Date(b.start_date).toLocaleDateString('da-DK')} – {new Date(b.end_date).toLocaleDateString('da-DK')} · {customer?.full_name || 'Ukendt kunde'}
                  {customer?.phone ? ` · ${customer.phone}` : ''}
                </p>
                <p style={{ fontSize: 13, color: '#5f5e5a', margin: '0 0 8px' }}>
                  {Number(b.price || 0).toLocaleString('da-DK')} kr
                </p>

                {b.delivery_type === 'delivery' && (
                  <div style={{ background: '#fff', borderRadius: 8, padding: 10, fontSize: 13, color: '#5f5e5a', marginBottom: 8 }}>
                    <div>{b.delivery_address}</div>
                    {b.delivery_details &&
                      b.delivery_details.split('\n').map((line, i) => <div key={i}>{line}</div>)}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', fontSize: 13 }}>
                  {b.customer_returned_at && (
                    <span style={{ color: '#3b6d11' }}>
                      Kunden markerede afleveret {new Date(b.customer_returned_at).toLocaleDateString('da-DK')}
                    </span>
                  )}
                  {b.returned_at ? (
                    <span style={{ color: '#3b6d11', fontWeight: 500 }}>
                      Bekræftet modtaget {new Date(b.returned_at).toLocaleDateString('da-DK')}
                    </span>
                  ) : (
                    <form
                      action={async () => {
                        'use server'
                        await confirmBookingReceived(b.id)
                      }}
                    >
                      <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '6px 12px', fontSize: 13 }}>
                        Bekræft modtaget
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )
          })
        ) : (
          <div className="empty-state">Ingen bookinger endnu.</div>
        )}
      </div>
    </>
  )
}
