'use client'

import { useState } from 'react'

function formatFieldName(field) {
  if (field === 'base_fee') return 'Grundgebyr'
  if (field === 'price_per_km') return 'Pris pr. km'
  return field
}

export default function DeliveryPriceHistory({ history }) {
  const [open, setOpen] = useState(false)

  if (!history || history.length === 0) return null

  return (
    <div style={{ marginBottom: 32 }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          background: 'transparent',
          border: '1px solid #1C201B',
          borderRadius: 6,
          padding: '6px 14px',
          fontSize: 13,
          cursor: 'pointer',
        }}
      >
        {open ? 'Skjul prishistorik ▴' : 'Vis prishistorik ▾'}
      </button>

      {open && (
        <div
          style={{
            background: '#f4efe6',
            border: '1px solid #1C201B',
            borderRadius: 10,
            padding: '4px 20px',
            marginTop: 10,
          }}
        >
          {history.map((entry, i) => (
            <div
              key={entry.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 0',
                borderTop: i === 0 ? 'none' : '1px solid rgba(28,32,27,0.1)',
                fontSize: 13,
                flexWrap: 'wrap',
                gap: 6,
              }}
            >
              <span>
                {formatFieldName(entry.field)}: {Number(entry.old_value).toLocaleString('da-DK')} kr → <strong>{Number(entry.new_value).toLocaleString('da-DK')} kr</strong>
              </span>
              <span style={{ fontSize: 12, color: '#857c68', whiteSpace: 'nowrap' }}>
                {new Date(entry.changed_at).toLocaleDateString('da-DK')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
