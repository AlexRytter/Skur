
'use client'

import { useState } from 'react'

export default function ToolPriceHistory({ history }) {
  const [open, setOpen] = useState(false)

  if (!history || history.length === 0) return null

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          background: 'transparent',
          border: '1px solid #1C201B',
          borderRadius: 6,
          padding: '4px 10px',
          fontSize: 12,
          cursor: 'pointer',
        }}
      >
        {open ? 'Skjul historik ▴' : 'Vis historik ▾'}
      </button>

      {open && (
        <div
          style={{
            background: '#fff',
            border: '1px solid #1C201B',
            borderRadius: 10,
            padding: '4px 16px',
            marginTop: 8,
          }}
        >
          {history.map((entry, i) => (
            <div
              key={entry.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0',
                borderTop: i === 0 ? 'none' : '1px solid rgba(28,32,27,0.1)',
                fontSize: 13,
                flexWrap: 'wrap',
                gap: 6,
              }}
            >
              <span>
                {Number(entry.old_value).toLocaleString('da-DK')} kr → <strong>{Number(entry.new_value).toLocaleString('da-DK')} kr</strong>
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
