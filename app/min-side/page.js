import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LogoutButton from './logout-button'

export default async function MinSide() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // ikke logget ind -> send til login i stedet for at vise siden
  if (!user) {
    redirect('/login')
  }

  return (
    <div className="auth-wrap" style={{ maxWidth: 560 }}>
      <div className="auth-card">
        <h1>Hej {user.email}</h1>
        <p className="sub">Du er logget ind. Dette er din rigtige session fra Supabase — ikke længere eksempeldata.</p>

        <div className="field">
          <label>Kunde-ID</label>
          <input value={user.id} readOnly className="mono" />
        </div>
        <div className="field">
          <label>Oprettet</label>
          <input value={new Date(user.created_at).toLocaleDateString('da-DK')} readOnly />
        </div>

        <p className="sub" style={{ marginTop: 24 }}>
          Næste skridt: koble en "bookinger"-tabel til, så dine rigtige lejemål vises her i stedet for denne testvisning.
        </p>

        <LogoutButton />
      </div>
    </div>
  )
}
