import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1>Skur</h1>
        <p className="sub">
          {user ? `Du er logget ind som ${user.email}` : 'Login-systemet er sat op og virker.'}
        </p>
        {user ? (
          <Link href="/min-side"><button className="btn-primary">Gå til Min side</button></Link>
        ) : (
          <>
            <Link href="/login"><button className="btn-primary">Log ind</button></Link>
            <p className="auth-switch">Ny kunde? <Link href="/signup">Opret dig her</Link></p>
          </>
        )}
      </div>
    </div>
  )
}
