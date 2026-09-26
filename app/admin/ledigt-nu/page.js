import { createClient } from '@/lib/supabase/server'

export default async function LedigtNuPage() {
  const supabase = await createClient()

  const { data: tools } = await supabase
    .from('tools')
    .select('*')
    .eq('status', 'aktiv')
    .order('name', { ascending: true })

  const { data: units } = await supabase
    .from('tool_units')
    .select('*')
    .in('status', ['available', 'rented'])

  const { data: bookings } = await supabase
    .from('bookings')
    .select('tool_unit_id, start_date, end_date')

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const busyUnitIds = new Set(
    (bookings || [])
      .filter((b) => {
        const start = new Date(b.start_date)
        const end = new Date(b.end_date)
        return start <= today && end >= today
      })
      .map((b) => b.tool_unit_id)
  )

  const ledigeVaerktoejer = (tools || []).filter((tool) => {
    const toolUnits = (units || []).filter((u) => u.tool_id === tool.id)
    if (toolUnits.length === 0) return false
    return toolUnits.some((u) => !busyUnitIds.has(u.id))
  })

  return (
    <>
      <div className="section-title">Ledigt lige nu</div>
      <hr style={{ border: 'none', borderTop: '2px solid #2c2c2a', margin: '0 0 8px' }} />
      <p className="sub" style={{ marginBottom: 16 }}>Værktøj der er klar til at blive lejet ud i dag.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {ledigeVaerktoejer.length > 0 ? (
          ledigeVaerktoejer.map((tool) => (
            <div
              key={tool.id}
              style={{
                background: '#DCEFE0',
                borderRadius: 10,
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <span style={{ fontWeight: 600, color: '#1f5c33' }}>{tool.name}</span>
              <span style={{ fontSize: 12, color: '#1f5c33' }}>Klar til udlejning</span>
            </div>
          ))
        ) : (
          <div className="empty-state">Intet værktøj er ledigt lige nu.</div>
        )}
      </div>
    </>
  )
}
