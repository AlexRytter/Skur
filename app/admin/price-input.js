'use client'

import { useState } from 'react'

export default function PriceInput({ name, defaultValue = '', placeholder = '0', style }) {
  const [display, setDisplay] = useState(
    defaultValue !== '' && defaultValue !== null && defaultValue !== undefined
      ? String(defaultValue)
      : ''
  )

  function handleChange(e) {
    let raw = e.target.value.replace(/[^0-9.]/g, '')
    const parts = raw.split('.')
    if (parts.length > 2) {
      raw = parts[0] + '.' + parts.slice(1).join('')
    }
    setDisplay(raw)
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
      <input type="hidden" name={name} value={display} />
    </>
  )
}
