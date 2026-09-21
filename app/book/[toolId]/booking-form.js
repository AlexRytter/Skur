'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { calculateDeliveryPrice } from '@/app/lib/delivery'
import AvailabilityCalendar from './availability-calendar'

export default function BookingForm({ tool }) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [deliveryType, setDeliveryType] = useState('pickup')

  const [street, setStreet] = useState('')
  const [postnr, setPostnr] = useState('')
  const [by, setBy] = useState('')
  const [floorDoor, setFloorDoor] = useState('')
  const [company, setCompany] = useState('')
  const [contactPerson, setContactPerson] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [noPhone, setNoPhone] = useState(false)
  const [remark, setRemark] = useState('')

  const [deliveryInfo, setDeliveryInfo] = useState(null)
  const [checkingDelivery, setCheckingDelivery] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const supabase = createClient()
  const streetInputRef = useRef(null)
  const contactPhoneRef = useRef(null)

  const days =
    startDate && endDate
      ? Math.max(1, Math.round((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1)
      : 0

  const rentalPrice = days * tool.price_per_day
  const deliveryPrice = deliveryType === 'delivery' && deliveryInfo?.price ? deliveryInfo.price : 0
  const totalPrice = rentalPrice + deliveryPrice

  const phoneUnresolved =
    deliveryType === 'delivery' && contactPerson.trim() !== '' && contactPhone.trim() === '' && !noPhone

  useEffect(() => {
    if (deliveryType !== 'delivery') return

    function initAutocomplete() {
      if (!streetInputRef.current || !window.google) return

      const autocomplete = new window.google.maps.places.Autocomplete(streetInputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'dk' },
      })

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace()
        if (!place.address_components) return

        let streetNumber = ''
        let route = ''
        let newPostnr = ''
        let newBy = ''

        for (const comp of place.address_components) {
          if (comp.types.includes('street_number')) streetNumber = comp.long_name
          if (comp.types.includes('route')) route = comp.long_name
          if (comp.types.includes('postal_code')) newPostnr = comp.long_name
          if (comp.types.includes('postal_town') || comp.types.includes('locality')) newBy = comp.long_name
        }

        setStreet([route, streetNumber].filter(Boolean).join(' '))
        setPostnr(newPostnr)
        setBy(newBy)
        setDeliveryInfo(null)
      })
    }

    if (window.google && window.google.maps && window.google.maps.places) {
      initAutocomplete()
    } else {
      const existingScript = document.getElementById('google-maps-script')
      if (existingScript) {
        existingScript.addEventListener('load', initAutocomplete)
      } else {
        const script = document.createElement('script')
        script.id = 'google-maps-script'
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
        script.async = true
        script.defer = true
        script.onload = initAutocomplete
        document.head.appendChild(script)
      }
    }
  }, [deliveryType])

  async function handleCheckDelivery() {
    if (!street || !postnr || !by) return
    setCheckingDelivery(true)
    setDeliveryInfo(null)
    setError('')

    const fullAddress = `${street}, ${postnr} ${by}`
    const result = await calculateDeliveryPrice(fullAddress)

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
      setError('Vælg både start- og slutdato i kalenderen.')
      return
    }
    if (new Date(endDate) < new Date(startDate)) {
      setError('Slutdato skal ligge efter startdato.')
      return
    }
    if (deliveryType === 'delivery') {
      if (!street || !postnr || !by) {
        setError('Udfyld adressen (vejnavn, postnr. og by).')
        return
      }
      if (!deliveryInfo) {
        setError('Beregn leveringsprisen først ved at klikke "Beregn pris".')
        return
      }
      if (phoneUnresolved) {
        setError('Angiv et telefonnummer på kontaktpersonen, eller markér at der ikke er noget.')
        return
      }
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

    const fullAddress = deliveryType === 'delivery' ? `${street}, ${postnr} ${by}` : null

    const detailLines = []
    if (deliveryType === 'delivery') {
      if (floorDoor.trim()) detailLines.push(`Etage/dørnummer: ${floorDoor.trim()}`)
      if (company.trim()) detailLines.push(`Firma: ${company.trim()}`)
      if (contactPerson.trim()) {
        const phoneText = contactPhone.trim() ? contactPhone.trim() : 'intet nummer oplyst'
        detailLines.push(`Kontaktperson: ${contactPerson.trim()} (${phoneText})`)
      }
      if (remark.trim()) detailLines.push(`Bemærkning: ${remark.trim()}`)
    }
    const deliveryDetails = detailLines.length > 0 ? detailLines.join('\n') : null

    const { error: insertError } = await supabase.from('bookings').insert({
      user_id: user.id,
      tool_name: tool.name,
      tool_unit_id: freeUnit.id,
      start_date: startDate,
      end_date: endDate,
      price: totalPrice,
      delivery_type: deliveryType,
      delivery_address: fullAddress,
      delivery_details: deliveryDetails,
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
        <label>Vælg periode</label>
        <AvailabilityCalendar
          toolId={tool.id}
          startDate={startDate}
          endDate={endDate}
          onChange={(newStart, newEnd) => {
            setStartDate(newStart)
            setEndDate(newEnd)
          }}
        />
        {startDate && (
          <p className="sub" style={{ marginTop: 8 }}>
            {endDate ? `Valgt: ${startDate} – ${endDate}` : `Startdato valgt: ${startDate} — vælg slutdato`}
          </p>
        )}
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
        <>
          <div className="field">
            <label htmlFor="street">Vejnavn og husnummer</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                id="street"
                name="skur-vejnavn"
                autoComplete="off"
                ref={streetInputRef}
                type="text"
                placeholder="F.eks. Tuevej 7"
                value={street}
                onChange={(e) => {
                  setStreet(e.target.value)
                  setDeliveryInfo(null)
                }}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className="btn-primary"
                style={{ width: 'auto', padding: '10px 18px', marginTop: 0 }}
                onClick={handleCheckDelivery}
                disabled={checkingDelivery || !street || !postnr || !by}
              >
                {checkingDelivery ? 'Beregner…' : 'Beregn pris'}
              </button>
            </div>
          </div>

          <div className="field" style={{ display: 'flex', gap: 8 }}>
            <div style={{ width: 90 }}>
              <label htmlFor="postnr">Postnr.</label>
              <input
                id="postnr"
                name="skur-postnr"
                autoComplete="off"
                type="text"
                value={postnr}
                onChange={(e) => {
                  setPostnr(e.target.value)
                  setDeliveryInfo(null)
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label htmlFor="by">By</label>
              <input
                id="by"
                name="skur-by"
                autoComplete="off"
                type="text"
                value={by}
                onChange={(e) => {
                  setBy(e.target.value)
                  setDeliveryInfo(null)
                }}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="floorDoor">
              <i className="ti ti-door" style={{ verticalAlign: 'middle', marginRight: 4 }} />
              Etage / dørnummer <span style={{ color: 'var(--text-muted)' }}>(valgfrit)</span>
            </label>
            <input
              id="floorDoor"
              name="skur-etage"
              autoComplete="off"
              type="text"
              placeholder="F.eks. 2. th."
              value={floorDoor}
              onChange={(e) => setFloorDoor(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="company">
              Firma <span style={{ color: 'var(--text-muted)' }}>(valgfrit)</span>
            </label>
            <input
              id="company"
              name="skur-firma"
              autoComplete="off"
              type="text"
              placeholder="F.eks. Novo Nordisk"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>

          <div className="field" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ flex: '1 1 150px' }}>
              <label htmlFor="contactPerson">
                Kontaktperson <span style={{ color: 'var(--text-muted)' }}>(valgfrit)</span>
              </label>
              <input
                id="contactPerson"
                name="skur-kontakt"
                autoComplete="off"
                type="text"
                placeholder="F.eks. Anne Jensen"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                onBlur={() => {
                  if (contactPerson.trim() && !contactPhone.trim() && !noPhone) {
                    contactPhoneRef.current?.focus()
                  }
                }}
              />
            </div>
            <div style={{ flex: '1 1 110px' }}>
              <label htmlFor="contactPhone">Telefon</label>
              <input
                id="contactPhone"
                name="skur-telefon"
                autoComplete="off"
                ref={contactPhoneRef}
                type="tel"
                placeholder={phoneUnresolved ? 'Angiv tlf.' : ''}
                value={contactPhone}
                onChange={(e) => {
                  setContactPhone(e.target.value)
                  if (e.target.value.trim()) setNoPhone(false)
                }}
                style={
                  phoneUnresolved
                    ? { borderColor: 'var(--border-danger)', color: 'var(--text-danger)' }
                    : undefined
                }
              />
            </div>
            {contactPerson.trim() && !contactPhone.trim() && (
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)', flexBasis: '100%', marginTop: 4 }}>
                <input
                  type="checkbox"
                  checked={noPhone}
                  onChange={(e) => setNoPhone(e.target.checked)}
                />
                Kunden har ikke oplyst noget telefonnummer
              </label>
            )}
          </div>

          <div className="field">
            <label htmlFor="remark">
              Bemærkning til levering <span style={{ color: 'var(--text-muted)' }}>(valgfrit)</span>
            </label>
            <textarea
              id="remark"
              name="skur-bemaerkning"
              autoComplete="off"
              rows={3}
              placeholder="F.eks. Ring på ved ankomst, hunden er i haven"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              style={{ width: '100%', resize: 'vertical', fontFamily: 'inherit', fontSize: 'inherit', padding: '10px 12px' }}
            />
            <p className="sub" style={{ marginTop: 6 }}>
              Bruges kun til at finde vej ved levering — vises ikke offentligt.
            </p>
          </div>

          {deliveryInfo && (
            <p className="sub" style={{ marginTop: 10 }}>
              {deliveryInfo.km} km — levering koster <strong>{deliveryInfo.price} kr</strong>
            </p>
          )}
        </>
      )}

      {days > 0 && (
        <p className="sub" style={{ marginTop: 18 }}>
          {days} {days === 1 ? 'dag' : 'dage'} × {tool.price_per_day} kr = {rentalPrice} kr
          {deliveryPrice > 0 && <> + {deliveryPrice} kr levering</>}
          {' '}= <strong>{totalPrice} kr</strong>
        </p>
      )}

      {error && <div className="auth-message error">{error}</div>}

      <button
