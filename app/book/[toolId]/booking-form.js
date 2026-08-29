'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { calculateDeliveryPrice } from '@/app/lib/delivery'

export default function BookingForm({ tool }) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [deliveryType, setDeliveryType] = useState('pickup')
  const [address, setAddress] = useState('')
  const [deliveryInfo, setDeliveryInfo] = useState(null)
  const [checkingDelivery, setCheckingDelivery] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const days =
    startDate && endDate
      ? Math.max(1, Math.round((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1)
      : 0

  const rentalPrice = days * tool.price_per_day
  const deliveryPrice = deliveryType === 'delivery' && deliveryInfo?.price ? deliveryInfo.price : 0
  const totalPrice = rentalPrice + deliveryPrice

  async function handleCheckDelivery() {
    if (!address) return
    setCheckingDelivery(true)
    setDeliveryInfo(null)
    setError('')

    const result = await calculateDeliveryPrice(address)

    if (result.error) {
      setError(result.error)
    } else {
      setDeliveryInfo(result)
    }
    setCheckingDelivery(false)
  }

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
    if (deliveryType === 'delivery' && !deliveryInfo) {
      setError('Beregn leveringsprisen først ved at klikke "Beregn pris".')
      return
    }

    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    const { data: units } = await supabase
      .from('tool_units')
      .select('*')
      .eq('tool_id', tool.id)
      .in('status', ['available', 'rented'])

    if (!units || units.length === 0) {
      setError('Der er ikke oprettet noget fysisk eksemplar af dette værktøj endnu.')
      setLoading(false)
      return
    }

    const { data: existingBookings } = await supabase
      .from('bookings')
      .select('*')
      .in('tool_unit_id', units.map((u) => u.id))

    const freeUnit = units.find((unit) => {
      const overlapping = (existingBookings || []).filter(
        (b) =>
          b.tool_unit_id === unit.id &&
          new Date(startDate) <= new Date(b.end_date) &&
          new Date(endDate) >= new Date(b.start_date)
      )
      return overlapping.length === 0
    })

    if (!freeUnit) {
      setError('Ingen eksemplarer af dette værktøj er ledige i den valgte periode.')
      setLoading(false)
      return
    }

    const { error: insertError } = await supabase.from('bookings').insert({
      user_id: user.id,
      tool_name: tool.name,
      tool_unit_id: freeUnit.id,
      start_date: startDate,
      end_date: endDate,
      price: totalPrice,
      delivery_type: deliveryType,
      delivery_address: deliveryType === 'delivery' ? address : null,
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

      <div className="field">
        <label>Afhentning eller levering</label>
        <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
            <input
              type="radio"
              name="deliveryType"
              value="pickup"
              checked={deliveryType === 'pickup'}
              onChange={() => setDeliveryType('pickup')}
            />
            Afhent selv (Tuevej 7)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
            <input
              type="radio"
              name="deliveryType"
              value="delivery"
              checked={deliveryType === 'delivery'}
              onChange={() => setDeliveryType('delivery')}
            />
            Lever til mig
          </label>
        </div>
      </div>

      {deliveryType === 'delivery' && (
        <div className="field">
          <label htmlFor="address">Din adresse</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              id="address"
              type="text"
              placeholder="Vejnavn, husnummer, postnummer, by"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value)
                setDeliveryInfo(null)
              }}
              style={{ flex: 1 }}
            />
            <button
              type="button"
              className="btn-primary"
              style={{ width: 'auto', padding: '10px 18px', marginTop: 0 }}
              onClick={handleCheckDelivery}
              disabled={checkingDelivery || !address}
            >
              {checkingDelivery ? 'Beregner…' : 'Beregn pris'}
            </button>
          </div>
          {deliveryInfo && (
            <p className="sub" style={{ marginTop: 10 }}>
              {deliveryInfo.km} km — levering koster <strong>{deliveryInfo.price} kr</strong>
            </p>
          )}
        </div>
      )}

      {days > 0 && (
        <p className="sub" style={{ marginTop: 18 }}>
          {days} {days === 1 ? 'dag' : 'dage'} × {tool.price_per_day} kr = {rentalPrice} kr
          {deliveryPrice > 0 && <> + {deliveryPrice} kr levering</>}
          {' '}= <strong>{totalPrice} kr</strong>
        </p>
      )}

      {error && <div className="auth-message error">{error}</div>}

      <button className="btn-primary" type="submit" disabled={loading}>
        {loading ? 'Booker…' : 'Bekræft booking'}
      </button>
    </form>
  )
}
