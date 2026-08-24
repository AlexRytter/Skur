import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { sendMessage } from './actions'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: tools } = await supabase
    .from('tools')
    .select('*')
    .order('price_per_day', { ascending: true })

  return (
    <div>
      <header className="hero">
        <div className="eyebrow">Åbent i Jægerspris</div>
        <h1>Lej værktøj, <em>ikke hele forretningen.</em></h1>
        <p className="lead">
          Skur er et skur fuld af værktøj, du kan låne for en dag eller en uge — uden at skulle eje det selv.
        </p>
      </header>

      <section className="section">
        <div className="section-head">
          <h2>I skuret lige nu</h2>
        </div>

        {tools && tools.length > 0 ? (
          <div className="tool-grid">
            {tools.map((tool) => (
              <Link
                href={tool.available ? `/book/${tool.id}` : '#'}
                className={`tool-card ${!tool.available ? 'unavailable' : ''}`}
                key={tool.id}
                style={{ textDecoration: 'none', color: 'inherit', pointerEvents: tool.available ? 'auto' : 'none' }}
              >
                <h3>{tool.name}</h3>
                <div className="price">{tool.price_per_day} kr / dag</div>
                <div className="avail">{tool.available ? 'Ledig i dag — book nu' : 'Udlejet'}</div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">Der er ikke registreret værktøj endnu.</div>
        )}
      </section>

      {user && (
        <section className="section">
          <div className="section-head">
            <h2>Spørgsmål?</h2>
          </div>
          <form action={sendMessage} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <textarea
              name="body"
              placeholder="Skriv din besked her..."
              required
              rows={3}
              style={{ flex: 1, minWidth: 240, padding: 10 }}
            />
            <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '10px 20px', alignSelf: 'flex-start' }}>
              Send
            </button>
          </form>
        </section>
      )}
    </div>
  )
}
