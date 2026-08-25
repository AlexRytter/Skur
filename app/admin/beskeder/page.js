import { createClient } from '@/lib/supabase/server'
import { replyToMessage } from '../actions'

export default async function BeskederPage() {
  const supabase = await createClient()

  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false })

  return (
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
  )
}
