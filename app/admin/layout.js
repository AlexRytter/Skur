import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const ADMIN_EMAIL = 'alex@gardinmageren.dk'

export default async function AdminLayout({ children }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== ADMIN_EMAIL) {
    redirect('/')
  }

  return (
    <div className="page-wrap">
      <div className="page-head">
        <div>
          <h1>Admin</h1>
          <p>Styr værktøj og beskeder for Skur.</p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 32, borderBottom: '1px solid #1C201B', paddingBottom: 8 }}>
        <Link href="/admin/vaerktoj" className="nav-link" style={{ fontWeight: 500 }}>Værktøj</Link>
        <Link href="/admin/beskeder" className="nav-link" style={{ fontWeight: 500 }}>Beskeder</Link>
        <Link href="/admin/kunder" className="nav-link" style={{ fontWeight: 500 }}>Kunder</Link>
      </div>
      {children}
    </div>
  )
}
