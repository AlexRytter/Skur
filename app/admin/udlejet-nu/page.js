import { createClient } from '@/lib/supabase/server'

export default async function UdlejetNuPage() {
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

  const activeNow = (bookings || []).filter((b) => {
    if (b.cancelled_at || b.returned_at) return false
    const start = new Date(b.start_date)
    const end = new Date(b.end_date)
    return start <= today && end >= today
  })

  return (
    <>
      <div className="section-title">Udlejet nu</div>
      <hr style={{ border: 'none', borderTop: '2px solid #2c2c2a', margin: '0 0 8px' }} />
      <p className="sub" style={{ marginBottom: 16 }}>Alt værktøj der er ude hos en kunde lige nu.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {activeNow.length > 0 ? (
          activeNow.map((b) => {
            const customer = (customers || []).find((c) => c.id === b.user_id)
            return (
              <div
                key={b.id}
                style={{
                  background: '#FBF8F2',
                  border: '1px solid #E2DACB',
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
                  <div style={{ fontWeight: 600 }}>{b.tool_name}</div>
                  <div className="sub">
                    {customer?.full_name || 'Ukendt kunde'}
                    {customer?.phone ? ` · ${customer.phone}` : ''}
                  </div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#4a453b' }}>
                  Retur {new Date(b.end_date).toLocaleDateString('da-DK')}
                </div>
              </div>
            )
          })
        ) : (
          <div className="empty-state">Der er ikke udlejet noget værktøj lige nu.</div>
        )}
      </div>
    </>
  )
}
