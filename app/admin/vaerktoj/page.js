import { createClient } from '@/lib/supabase/server'
import PriceInput from '../price-input'
import {
  addTool,
  updateTool,
  toggleAvailable,
  deleteTool,
  updateToolDetails,
  addToolUnit,
  deleteToolUnit,
  updateToolUnitStatus,
} from '../actions'

export default async function VaerktojPage() {
  const supabase = await createClient()

  const { data: tools } = await supabase
    .from('tools')
    .select('*')
    .order('name', { ascending: true })

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*')

  const { data: units } = await supabase
    .from('tool_units')
    .select('*')
    .order('unit_code', { ascending: true })

  return (
    <>
      <div className="section-title">Tilføj nyt værktøj</div>
      <form action={addTool} style={{ display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap' }}>
        <input name="name" placeholder="Navn (fx Boremaskine)" required style={{ flex: 1, minWidth: 160, padding: 10 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <PriceInput name="price_per_day" placeholder="Pris pr. dag" style={{ width: 140, padding: 10 }} />
          <span style={{ fontSize: 13, color: '#5f5e5a' }}>kr</span>
        </div>
        <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '10px 20px' }}>
          Tilføj
        </button>
      </form>

      <div className="section-title">Alle værktøjer</div>
      <hr style={{ border: 'none', borderTop: '2px solid #2c2c2a', margin: '0 0 16px' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {tools && tools.length > 0 ? (
          tools.map((tool) => {
            const toolUnits = units ? units.filter((u) => u.tool_id === tool.id) : []

            const earnings = bookings
              ? bookings
                  .filter((b) => b.tool_name === tool.name)
                  .reduce((sum, b) => sum + Number(b.price || 0), 0)
              : 0
            const rentCount = bookings
              ? bookings.filter((b) => b.tool_name === tool.name).length
              : 0

            let serviceWarning = false
            if (tool.last_serviced && tool.service_interval_months) {
              const last = new Date(tool.last_serviced)
              const next = new Date(last)
              next.setMonth(next.getMonth() + Number(tool.service_interval_months))
              serviceWarning = new Date() >= next
            }

            return (
              <div
                key={tool.id}
                style={{
                  background: '#f4efe6',
                  borderRadius: 10,
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  border: '1px solid #1C201B',
                }}
              >
                <form
                  action={async (formData) => {
                    'use server'
                    await updateTool(tool.id, formData)
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}
                >
                  <input name="name" defaultValue={tool.name} placeholder="Navn" style={{ flex: 1, minWidth: 140, padding: 8 }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <PriceInput name="price_per_day" defaultValue={tool.price_per_day} style={{ width: 100, padding: 8 }} />
                    <span style={{ fontSize: 13, color: '#5f5e5a' }}>kr</span>
                  </div>
                  <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '8px 14px' }}>
                    Gem
                  </button>
                  <button
                    formAction={async () => {
                      'use server'
                      await toggleAvailable(tool.id, tool.available)
                    }}
                    className={`status-chip ${tool.available ? 'active' : 'unavailable'}`}
                    style={{ border: 'none', cursor: 'pointer' }}
                  >
                    {tool.available ? 'Ledig' : 'Udlejet'}
                  </button>
                  {serviceWarning && (
                    <span className="status-chip" style={{ background: '#faeeda', color: '#633806' }}>
                      Service snart
                    </span>
                  )}
                  {tool.for_sale && !tool.sold && (
                    <span className="status-chip" style={{ background: '#eaf3de', color: '#173404' }}>
                      Til salg
                    </span>
                  )}
                  <button
                    formAction={async () => {
                      'use server'
                      await deleteTool(tool.id)
                    }}
                    style={{ color: '#993c1d', border: 'none', background: 'none', cursor: 'pointer' }}
                  >
                    Slet
                  </button>
                </form>

                <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#5f5e5a' }}>
                  <span>Udlejet {rentCount} gange</span>
                  <span>Indtjent {earnings.toLocaleString('da-DK')} kr</span>
                </div>

                <form
                  action={async (formData) => {
                    'use server'
                    await updateToolDetails(tool.id, formData)
                  }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 8, borderTop: '0.5px solid #d3d1c7', paddingTop: 12 }}
                  encType="multipart/form-data"
                >
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                    {tool.image_url && (
                      <img src={tool.image_url} alt={tool.name} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }} />
                    )}
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <label style={{ fontSize: 12, color: '#5f5e5a' }}>Billede</label>
                      <input type="file" name="image" accept="image/*" style={{ display: 'block', marginTop: 4 }} />
                    </div>
                  </div>

                  <label style={{ fontSize: 12, color: '#5f5e5a' }}>Beskrivelse (vises til kunder)</label>
                  <textarea
                    name="description"
                    defaultValue={tool.description || ''}
                    placeholder="Fx: Kraftig borehammer velegnet til beton og mursten"
                    rows={2}
                    style={{ padding: 8 }}
                  />

                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <div>
                      <label style={{ fontSize: 12, color: '#5f5e5a' }}>Sidst serviceret</label>
                      <input type="date" name="last_serviced" defaultValue={tool.last_serviced || ''} style={{ display: 'block', padding: 8 }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, color: '#5f5e5a' }}>Service-interval (mdr)</label>
                      <input type="number" name="service_interval_months" defaultValue={tool.service_interval_months || 12} style={{ display: 'block', padding: 8, width: 80 }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                      <input type="checkbox" name="for_sale" defaultChecked={tool.for_sale} />
                      Sæt til salg
                    </label>
                    <div>
                      <label style={{ fontSize: 12, color: '#5f5e5a' }}>Salgspris</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <PriceInput name="sale_price" defaultValue={tool.sale_price} style={{ padding: 8, width: 100 }} />
                        <span style={{ fontSize: 13, color: '#5f5e5a' }}>kr</span>
                      </div>
                    </div>
                    <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '8px 14px', alignSelf: 'flex-end' }}>
                      Gem detaljer
                    </button>
                  </div>
                </form>

                <div style={{ borderTop: '0.5px solid #d3d1c7', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>Fysiske eksemplarer ({toolUnits.length})</div>

                  {toolUnits.map((unit) => (
                    <div
                      key={unit.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        flexWrap: 'wrap',
                        background: '#fff',
                        borderRadius: 8,
                        padding: 8,
                      }}
                    >
                      <span style={{ fontFamily: 'monospace', fontWeight: 500 }}>{unit.unit_code}</span>
                      {unit.serial_number && <span style={{ fontSize: 12, color: '#5f5e5a' }}>SN: {unit.serial_number}</span>}
                      {unit.purchase_price && (
                        <span style={{ fontSize: 12, color: '#5f5e5a' }}>
                          {Number(unit.purchase_price).toLocaleString('da-DK')} kr
                        </span>
                      )}

                      <form
                        action={async (formData) => {
                          'use server'
                          await updateToolUnitStatus(unit.id, formData.get('status'))
                        }}
                        style={{ display: 'flex', gap: 6, alignItems: 'center' }}
                      >
                        <select name="status" defaultValue={unit.status} style={{ padding: 6 }}>
                          <option value="available">Ledig</option>
                          <option value="rented">Udlejet</option>
                          <option value="service">Til service</option>
                          <option value="sold">Solgt</option>
                        </select>
                        <button type="submit" style={{ padding: '6px 10px', fontSize: 12 }}>
                          Opdater
                        </button>
                      </form>

                      <form
                        action={async () => {
                          'use server'
                          await deleteToolUnit(unit.id)
                        }}
                      >
                        <button type="submit" style={{ color: '#993c1d', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13 }}>
                          Slet
                        </button>
                      </form>
                    </div>
                  ))}

                  <form
                    action={async (formData) => {
                      'use server'
                      await addToolUnit(tool.id, formData)
                    }}
                    style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}
                  >
                    <div>
                      <label style={{ fontSize: 12, color: '#5f5e5a' }}>Mærke</label>
                      <input name="brand" defaultValue={tool.brand || ''} required placeholder="Hilti" style={{ display: 'block', padding: 8, width: 120 }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, color: '#5f5e5a' }}>Serienummer</label>
                      <input name="serial_number" placeholder="fra værktøjet" style={{ display: 'block', padding: 8, width: 140 }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, color: '#5f5e5a' }}>Købsdato</label>
                      <input type="date" name="purchase_date" style={{ display: 'block', padding: 8 }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, color: '#5f5e5a' }}>Købspris</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <PriceInput name="purchase_price" style={{ padding: 8, width: 100 }} />
                        <span style={{ fontSize: 13, color: '#5f5e5a' }}>kr</span>
                      </div>
                    </div>
                    <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '8px 14px' }}>
                      Tilføj eksemplar
                    </button>
                  </form>
                </div>
              </div>
            )
          })
        ) : (
          <div className="empty-state">Ingen værktøjer endnu.</div>
        )}
      </div>
    </>
  )
}
