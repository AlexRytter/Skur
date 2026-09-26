'use client'

import { useState, useTransition } from 'react'
import { cancelBooking } from '../actions'

export default function CancelButton({ bookingId }) {
  const [confirming, setConfirming] = useState(false)
  const [isPending, startTransition] = useTransition()

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        style={{
          fontSize: 13,
          padding: '6px 12px',
          background: 'transparent',
          border: '1px solid #b4443a',
          color: '#b4443a',
          borderRadius: 6,
        }}
      >
        Annullér leje
      </button>
    )
  }

  return (
    <div
      style={{
        background: '#fbeaea',
        borderRadius: 8,
        padding: '12px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <div style={{ fontSize: 13, color: '#712b13' }}>
        Er du sikker på at du vil annullere denne leje?
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => cancelBooking(bookingId))}
          style={{
            fontSize: 13,
            fontWeight: 500,
            padding: '6px 12px',
            background: '#b4443a',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
          }}
        >
          {isPending ? 'Annullerer...' : 'Ja, annullér'}
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => setConfirming(false)}
          style={{
            fontSize: 13,
            padding: '6px 12px',
            background: 'transparent',
            border: '1px solid #c9bfa9',
            color: '#4a453b',
            borderRadius: 6,
          }}
        >
          Fortryd
        </button>
      </div>
    </div>
  )
}
