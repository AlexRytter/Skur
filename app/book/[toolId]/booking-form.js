'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function BookingForm({ tool }) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const days =
    startDate && endDate
      ? Math.max(1, Math.round((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1)
      : 0
  const price = days * tool.price_per_day

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!startDate || !endDate) {
      setError('Vælg både start- og slutdato.')
      return
    }
    if (new Date(endDate) < new Date(startDate)) {
      setError('Slutdato skal ligge efter startdato.')
      return
    }

    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    const { error: insertError } = await supabase.from('bookings').insert({
      user_id: user.id,
      tool_name: tool.name,
      start_date: startDate,
      end_date: endDate,
      price,
      delivery_type: 'pickup',
    })

    if (insertError) {
      setError('Der gik noget galt. Prøv igen.')
      setLoading(false)
      return
    }

    router.push('/min-side')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="start">Startdato</label>
        <input
          id="start"
          type="date"
          required
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="end">Slutdato</label>
        <input
          id="end"
          type="date"
          required
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      {days > 0 && (
        <p className="sub" style={{ marginTop: 18 }}>
          {days} {days === 1 ? 'dag' : 'dage'} × {tool.price_per_day} kr = <strong>{price} kr</strong>
        </p>
      )}

      {error && <div className="auth-message error">{error}</div>}

      <button className="btn-primary" type="submit" disabled={loading}>
        {loading ? 'Booker…' : 'Bekræft booking'}
      </button>
    </form>
  )
}
