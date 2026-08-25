'use client'

import { useState } from 'react'

export default function PriceInput({ name, defaultValue = '', placeholder = '0', style }) {
  const [display, setDisplay] = useState(
    defaultValue ? Number(defaultValue).toLocaleString('da-DK') : ''
  )

  function handleChange(e) {
    const raw = e.target.value.replace(/\D/g, '')
    setDisplay(raw ? Number(raw).toLocaleString('da-DK') : '')
  }

  return (
    <>
      <input
        type="text"
        inputMode="numeric"
        value={display}
        onChange={handleChange}
        placeholder={placeholder}
        style={style}
      />
      <input type="hidden" name={name} value={display.replace(/\D/g, '')} />
    </>
  )
}
