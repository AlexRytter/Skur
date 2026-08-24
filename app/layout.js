import './globals.css'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Skur',
  description: 'Lej værktøj lokalt',
}

export default async function RootLayout({ children }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <html lang="da">
      <body>
        <nav className="site-nav">
          <div className="inner">
            <Link href="/" className="logo" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="logo-mark"></div>
              Skur
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
