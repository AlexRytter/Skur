'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleSignup(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          full_name: fullName,
          phone: phone,
          address: address,
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    setSuccess(true)
    setLoading(false)
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1>Opret dig</h1>
        <p className="sub">Opret en konto for at booke værktøj hos Skur.</p>
        {success ? (
          <div className="auth-message success">
            Tjek din email — vi har sendt et bekræftelseslink. Klik på det for at aktivere din konto.
          </div>
        ) : (
          <form onSubmit={handleSignup}>
            <div className="field">
              <label htmlFor="fullName">Fulde navn</label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="phone">Telefonnummer</label>
              <input
                id="phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="address">Adresse</label>
              <input
                id="address"
                type="text"
                required
                placeholder="Vejnavn, husnummer, postnummer, by"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
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
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <div className="auth-message error">{error}</div>}
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? 'Opretter…' : 'Opret konto'}
            </button>
          </form>
        )}
        <p className="auth-switch">Har du allerede en konto? <Link href="/login">Log ind</Link></p>
      </div>
    </div>
  )
}
