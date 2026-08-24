import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: tools } = await supabase
    .from('tools')
    .select('*')
    .order('price_per_day', { ascending: true })

  return (
    <div>
      <nav className="site-nav">
        <div className="inner">
          <div className="logo">
            <div className="logo-mark"></div>
            Skur
          </div>
          {user ? (
            <Link className="nav-link" href="/min-side">Min side</Link>
          ) : (
            <Link className="nav-link" href="/login">Log ind</Link>
          )}
        </div>
      </nav>

      <header className="hero">
        <div className="eyebrow">Åbent i Jægerspris</div>
        <h1>Lej værktøj, <em>ikke hele forretningen.</em></h1>
        <p className="lead">
          Skur er et skur fuld af værktøj, du kan låne for en dag eller en uge — uden at skulle eje det selv.
        </p>
        {!user && (
          <p className="auth-switch" style={{ textAlign: 'left', marginTop: 20 }}>
            <Link href="/signup" className="btn-primary" style={{ display: 'inline-block', width: 'auto', padding: '12px 22px' }}>
              Opret dig
            </Link>
          </p>
        )}
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
    </div>
  )
}
