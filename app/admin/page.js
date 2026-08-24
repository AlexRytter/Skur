import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { addTool, updateTool, toggleAvailable, deleteTool, replyToMessage } from './actions'

const ADMIN_EMAIL = 'alex@gardinmageren.dk'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== ADMIN_EMAIL) {
    redirect('/')
  }

  const { data: tools } = await supabase
    .from('tools')
    .select('*')
    .order('name', { ascending: true })

  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="page-wrap">
      <div className="page-head">
        <div>
          <h1>Værktøj</h1>
          <p>Tilføj, ret og fjern værktøj i skuret.</p>
        </div>
      </div>

      <div className="section-title">Tilføj nyt værktøj</div>
      <form action={addTool} style={{ display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap' }}>
        <input name="name" placeholder="Navn" required style={{ flex: 1, minWidth: 160, padding: 10 }} />
        <input name="price_per_day" type="number" placeholder="Pris pr. dag" required style={{ width: 140, padding: 10 }} />
        <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '10px 20px' }}>
          Tilføj
        </button>
      </form>

      <div className="section-title">Alle værktøjer</div>
      <div className="booking-list" style={{ marginBottom: 48 }}>
        {tools && tools.length > 0 ? (
          tools.map((tool) => (
            <form
              action={async (formData) => {
                'use server'
                await updateTool(tool.id, formData)
              }}
              className="booking-row"
              key={tool.id}
              style={{ alignItems: 'center', gap: 12 }}
            >
              <input name="name" defaultValue={tool.name} style={{ flex: 1, padding: 8 }} />
              <input name="price_per_day" type="number" defaultValue={tool.price_per_day} style={{ width: 100, padding: 8 }} />
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
          ))
        ) : (
          <div className="empty-state">Ingen værktøjer endnu.</div>
        )}
      </div>

      <div className="section-title">Beskeder</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {messages && messages.length > 0 ? (
          messages.map((msg) => (
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
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <strong>{msg.user_email}</strong>
                <span className="sub">{new Date(msg.created_at).toLocaleString('da-DK')}</span>
              </div>

              <p style={{ margin: 0 }}>{msg.body}</p>

              {msg.reply && (
                <div style={{ background: '#e1f5ee', borderRadius: 8, padding: 10 }}>
                  <div style={{ fontSize: 12, color: '#0f6e56', marginBottom: 4 }}>Dit svar</div>
                  <p style={{ margin: 0, color: '#04342c' }}>{msg.reply}</p>
                </div>
              )}

              <form
                action={async (formData) => {
                  'use server'
                  await replyToMessage(msg.id, formData)
                }}
                style={{ display: 'flex', gap: 8, marginTop: 4 }}
              >
                <input
                  name="reply"
                  defaultValue={msg.reply || ''}
                  placeholder="Skriv et svar..."
                  style={{ flex: 1, padding: 10 }}
                />
                <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '10px 18px' }}>
                  Svar
                </button>
              </form>
            </div>
          ))
        ) : (
          <div className="empty-state">Ingen beskeder endnu.</div>
        )}
      </div>
    </div>
  )
}
