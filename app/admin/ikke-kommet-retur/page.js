import { createClient } from '@/lib/supabase/server'

export default async function IkkeKommetReturPage() {
  const supabase = await createClient()

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*')
    .order('end_date', { ascending: true })

  const { data: customers } = await supabase
    .from('customer_profiles')
    .select('id, full_name, phone')

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const ikkeKommetRetur = (bookings || []).filter((b) => {
    if (b.cancelled_at || b.returned_at) return false
    const end = new Date(b.end_date)
    return end < today
  })

  return (
    <>
      <div className="section-title">Ikke kommet retur</div>
      <hr style={{ border: 'none', borderTop: '2px solid #2c2c2a', margin: '0 0 8px' }} />
      <p className="sub" style={{ marginBottom: 16 }}>Overskredet slutdato uden bekræftet aflevering.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {ikkeKommetRetur.length > 0 ? (
          ikkeKommetRetur.map((b) => {
            const customer = (customers || []).find((c) => c.id === b.user_id)
            const end = new Date(b.end_date)
            const daysLate = Math.floor((today - end) / (1000 * 60 * 60 * 24))

            return (
              <div
                key={b.id}
                style={{
                  background: '#FBEAEA',
                  border: '1px solid #EFC6BC',
                  borderRadius: 10,
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: '#712b13' }}>{b.tool_name}</div>
                  <div style={{ fontSize: 13, color: '#8a4030' }}>
                    {customer?.full_name || 'Ukendt kunde'}
                    {customer?.phone ? ` · ${customer.phone}` : ''}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#712b13' }}>
                    Skulle retur {end.toLocaleDateString('da-DK', { day: 'numeric', month: 'short' })}
                  </span>
                  <span style={{ fontSize: 12, color: '#8a4030' }}>
                    {daysLate} {daysLate === 1 ? 'dag' : 'dage'} for sent
                  </span>
                </div>
              </div>
            )
          })
        ) : (
          <div className="empty-state">Tom liste er en god ting — betyder at alt er kommet retur til tiden.</div>
        )}
      </div>
    </>
  )
}
