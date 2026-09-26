'use client'

import { useState } from 'react'

export default function PriceInput({ name, defaultValue = '', placeholder = '0', style }) {
  const [display, setDisplay] = useState(
    defaultValue !== '' && defaultValue !== null && defaultValue !== undefined
      ? Number(defaultValue).toLocaleString('da-DK', { maximumFractionDigits: 2 })
      : ''
  )

  function handleChange(e) {
    const raw = e.target.value.replace(/[^0-9,]/g, '')
    setDisplay(raw)
  }

  function getNumericValue() {
    if (!display) return ''
    const normalized = display.replace(/\./g, '').replace(',', '.')
    const num = parseFloat(normalized)
    return isNaN(num) ? '' : num
  }

  return (
    <>
      <input
        type="text"
        inputMode="decimal"
        value={display}
        onChange={handleChange}
        placeholder={placeholder}
        autoComplete="off"
        style={style}
      />
      <input type="hidden" name={name} value={getNumericValue()} />
    </>
  )
}
