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
    <div className="admin-wrap">
      <div className="page-head">
        <div>
          <h1>Admin</h1>
          <p>Styr værktøj og beskeder for Skur.</p>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32, paddingBottom: 8, flexWrap: 'wrap' }}>
        <Link href="/admin/vaerktoj" className="nav-link" style={{ fontWeight: 500 }}>Værktøj</Link>
        <span style={{ color: '#9a917f' }}>-</span>
        <Link href="/admin/beskeder" className="nav-link" style={{ fontWeight: 500 }}>Beskeder</Link>
        <span style={{ color: '#9a917f' }}>-</span>
        <Link href="/admin/kunder" className="nav-link" style={{ fontWeight: 500 }}>Kunder</Link>
        <span style={{ color: '#9a917f' }}>-</span>
        <Link href="/admin/bookinger" className="nav-link" style={{ fontWeight: 500 }}>Bookinger</Link>
        <span style={{ color: '#9a917f' }}>-</span>
        <Link href="/admin/udlejet-nu" className="nav-link" style={{ fontWeight: 500, color: '#8B3A1E' }}>Udlejet nu</Link>
        <span style={{ color: '#9a917f' }}>-</span>
        <Link href="/admin/ledigt-nu" className="nav-link" style={{ fontWeight: 500, color: '#8B3A1E' }}>Ledigt lige nu</Link>
        <span style={{ color: '#9a917f' }}>-</span>
        <Link href="/admin/ikke-kommet-retur" className="nav-link" style={{ fontWeight: 500, color: '#8B3A1E' }}>Ikke kommet retur</Link>
        <span style={{ color: '#9a917f' }}>-</span>
        <Link href="/admin/arkiv" className="nav-link" style={{ fontWeight: 500 }}>Arkiv</Link>
      </div>
      {children}
    </div>
  )
}
