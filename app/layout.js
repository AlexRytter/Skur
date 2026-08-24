import './globals.css'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'SKUR — hvorfor købe billigt, når du kan leje godt',
  description: 'Lej værktøj lokalt i Jægerspris',
}

export default async function RootLayout({ children }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <html lang="da">
      <body>
        <nav className="site-nav">
          <div className="inner">
            <Link href="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 10L12 4L21 10V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V10Z" fill="#8B3A1E"/>
                <path d="M3 10L12 4L21 10" stroke="#5C2412" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="10" y="14" width="4" height="7" fill="#F4EFE6"/>
              </svg>
              <div>
                <div className="logo" style={{ lineHeight: 1.1 }}>SKUR</div>
                <div style={{ fontSize: 11, color: '#8a8478', letterSpacing: 0.2 }}>
                  Hvorfor købe billigt, når du kan leje godt
                </div>
              </div>
            </Link>
            {user ? (
              <Link className="nav-link" href="/min-side">Min side</Link>
            ) : (
              <Link className="nav-link" href="/login">Log ind</Link>
            )}
          </div>
        </nav>
        {children}
      </body>
    </html>
  )
}
