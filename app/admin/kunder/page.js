import { createClient } from '@/lib/supabase/server'
import { setCustomerHold } from '../actions.js'

export default async function AdminCustomersPage() {
  const supabase = await createClient()

  const { data: customers } = await supabase
    .from('customer_profiles')
    .select('*')
    .order('created_at', { ascending: false })

  async function holdAction(formData) {
    'use server'
    const id = formData.get('id')
    const reason = formData.get('reason')
    await setCustomerHold(id, true, reason)
  }

  async function unholdAction(formData) {
    'use server'
    const id = formData.get('id')
    await setCustomerHold(id, false, null)
  }

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>Kunder</h2>
      {(!customers || customers.length === 0) && <p className="sub">Ingen kunder oprettet endnu.</p>}
      {customers?.map((c) => (
        <div
          key={c.id}
          style={{
            border: '1px solid #1C201B',
            borderRadius: 8,
            padding: 16,
            marginBottom: 12,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <p style={{ fontWeight: 600, margin: 0 }}>{c.full_name}</p>
              <p className="sub" style={{ margin: '4px 0 0' }}>{c.phone} · {c.address}</p>
              <p className="sub" style={{ margin: '4px 0 0' }}>
                Status:{' '}
                <strong style={{ color: c.status === 'on_hold' ? '#b3261e' : 'inherit' }}>
                  {c.status === 'on_hold' ? 'På hold' : 'Aktiv'}
                </strong>
                {c.status === 'on_hold' && c.hold_reason && ` — ${c.hold_reason}`}
              </p>
            </div>

            {c.status === 'on_hold' ? (
              <form action={unholdAction}>
                <input type="hidden" name="id" value={c.id} />
                <button className="btn-primary" type="submit" style={{ width: 'auto', padding: '8px 16px' }}>
                  Fjern hold
                </button>
              </form>
            ) : (
              <form action={holdAction} style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <input type="hidden" name="id" value={c.id} />
                <input
                  type="text"
                  name="reason"
                  placeholder="Årsag (valgfri)"
                  style={{ width: 200 }}
                />
                <button className="btn-primary" type="submit" style={{ width: 'auto', padding: '8px 16px' }}>
                  Sæt på hold
                </button>
              </form>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
