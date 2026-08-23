'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Forkert email eller password. Prøv igen.')
      setLoading(false)
      return
    }

    router.push('/min-side')
    router.refresh()
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1>Log ind</h1>
        <p className="sub">Log ind for at se dine lejemål hos Skur.</p>

        <form onSubmit={handleLogin}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <div className="auth-message error">{error}</div>}

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Logger ind…' : 'Log ind'}
          </button>
        </form>

        <p className="auth-switch">Ny kunde? <Link href="/signup">Opret dig her</Link></p>
      </div>
    </div>
  )
}
