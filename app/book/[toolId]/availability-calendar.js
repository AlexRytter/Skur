'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

const MONTH_NAMES = ['Januar', 'Februar', 'Marts', 'April', 'Maj', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'December']
const DAY_NAMES = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn']

function toISODate(d) {
  return d.toISOString().slice(0, 10)
}

function addDays(dateStr, n) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + n)
  return toISODate(d)
}

export default function AvailabilityCalendar({ toolId, startDate, endDate, onChange }) {
  const [units, setUnits] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [monthOffset, setMonthOffset] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data: unitData } = await supabase
        .from('tool_units')
        .select('*')
        .eq('tool_id', toolId)
        .in('status', ['available', 'rented'])

      const unitIds = (unitData || []).map((u) => u.id)

      let bookingData = []
      if (unitIds.length > 0) {
        const { data } = await supabase
          .from('bookings')
          .select('tool_unit_id, start_date, end_date')
          .in('tool_unit_id', unitIds)
        bookingData = data || []
      }

      setUnits(unitData || [])
      setBookings(bookingData)
      setLoading(false)
    }
    load()
  }, [toolId])

  const busyByUnit = useMemo(() => {
    const map = {}
    for (const unit of units) {
      map[unit.id] = bookings
        .filter((b) => b.tool_unit_id === unit.id)
        .map((b) => ({ start: b.start_date, end: addDays(b.end_date, 1) }))
    }
    return map
  }, [units, bookings])

  function isDateFullyBooked(dateStr) {
    if (units.length === 0) return true
    return units.every((unit) =>
      (busyByUnit[unit.id] || []).some((range) => dateStr >= range.start && dateStr <= range.end)
    )
  }

  const todayStr = toISODate(new Date())

  function handleDayClick(dateStr) {
    if (dateStr < todayStr) return
    if (isDateFullyBooked(dateStr)) return

    if (!startDate || (startDate && endDate)) {
      onChange(dateStr, '')
      return
    }

    if (dateStr < startDate) {
      onChange(dateStr, '')
      return
    }

    onChange(startDate, dateStr)
  }

  function renderMonth(offset) {
    const base = new Date()
    base.setDate(1)
    base.setMonth(base.getMonth() + offset)

    const year = base.getFullYear()
    const month = base.getMonth()
    const firstDay = new Date(year, month, 1)
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const startWeekday = (firstDay.getDay() + 6) % 7

    const cells = []
    for (let i = 0; i < startWeekday; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(d)

    return (
      <div style={{ flex: '1 1 260px', minWidth: 240 }}>
        <div style={{ textAlign: 'center', fontWeight: 600, marginBottom: 8 }}>
          {MONTH_NAMES[month]} {year}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
          {DAY_NAMES.map((d) => (
            <div key={d} style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)' }}>{d}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {cells.map((day, i) => {
            if (day === null) return <div key={i} />
            const dateStr = toISODate(new Date(year, month, day))
            const isPast = dateStr < todayStr
            const booked = !isPast && isDateFullyBooked(dateStr)
            const inRange = startDate && endDate && dateStr >= startDate && dateStr <= endDate
            const isStart = dateStr === startDate
            const isEnd = dateStr === endDate

            let background = 'transparent'
            let color = 'inherit'
            let cursor = 'pointer'

            if (isPast) {
              color = 'var(--text-muted)'
              cursor = 'default'
            } else if (booked) {
              background = '#f6d9d3'
              color = '#8b3a1e'
              cursor = 'not-allowed'
            } else {
              background = '#dcefe0'
              color = '#1f5c33'
            }

            if (inRange || isStart || isEnd) {
              background = '#8B3A1E'
              color = '#fff'
            }

            return (
              <button
                key={i}
                type="button"
                onClick={() => handleDayClick(dateStr)}
                disabled={isPast || (booked && !isStart && !isEnd)}
                style={{
                  aspectRatio: '1 / 1',
                  border: 'none',
                  borderRadius: 6,
                  background,
                  color,
                  cursor,
                  fontSize: 13,
                }}
              >
                {day}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  if (loading) {
    return <p className="sub">Indlæser ledige datoer…</p>
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <button type="button" onClick={() => setMonthOffset((m) => Math.max(0, m - 1))} disabled={monthOffset === 0}>
          ‹
        </button>
        <div style={{ display: 'flex', gap: 12, fontSize: 12 }}>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#dcefe0', borderRadius: 2, marginRight: 4 }} />Ledig</span>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#f6d9d3', borderRadius: 2, marginRight: 4 }} />Optaget</span>
        </div>
        <button type="button" onClick={() => setMonthOffset((m) => m + 1)}>
          ›
        </button>
      </div>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {renderMonth(monthOffset)}
        {renderMonth(monthOffset + 1)}
      </div>
    </div>
  )
}
