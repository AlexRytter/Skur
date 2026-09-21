'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { reactivateTool } from '../actions'

export default function ArchiveList({ items }) {
  const [search, setSearch] = useState('')
  const [reactivatingId, setReactivatingId] = useState(null)
  const router = useRouter()

  const filtered = items.filter((item) => {
    const term = search.trim().toLowerCase()
    if (!term) return true
    if (item.name.toLowerCase().includes(term)) return true
    return item.units.some((u) => u.unit_code.toLowerCase().includes(term))
  })

  async function handleReactivate(id) {
    setReactivatingId(id)
    await reactivateTool(id)
    setReactivatingId(null)
    router.refresh()
  }

  return (
    <>
      <input
        type="text"
        placeholder="Søg på navn eller id, fx HI-001"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: '100%', padding: 10, marginBottom: 20 }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.length > 0 ? (
          filtered.map((item) => (
            <div
              key={item.id}
              style={{
                background: '#f4efe6',
                border: '1px solid #1C201B',
                borderRadius: 10,
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <span style={{ fontWeight: 500 }}>{item.name}</span>
                <span
                  className="status-chip"
                  style={
                    item.status === 'solgt'
                      ? { background: '#eaf3de', color: '#173404' }
                      : { background: '#fbeaea', color: '#712b13' }
                  }
                >
                  {item.status === 'solgt' ? 'Solgt' : 'Slettet'}
                </span>
              </div>

              <div style={{ fontSize: 12, color: '#5f5e5a' }}>
                {item.units.map((u) => u.unit_code).join(', ') || 'Ingen eksemplarer'}
                {item.archived_at && ` · ${new Date(item.archived_at).toLocaleDateString('da-DK')}`}
              </div>

              {item.status === 'solgt' && (
                <div style={{ fontSize: 13, color: '#5f5e5a' }}>
                  {item.customerName
                    ? `Solgt til Skur-kunde: ${item.customerName}`
                    : item.sold_to_note
                    ? item.sold_to_note
                    : 'Ingen yderligere info'}
                </div>
              )}

              {item.status === 'slettet' && item.archived_reason && (
                <div style={{ fontSize: 13, color: '#5f5e5a' }}>{item.archived_reason}</div>
              )}

              <button
                type="button"
                className="btn-primary"
                style={{ width: 'auto', padding: '8px 14px', marginTop: 4, alignSelf: 'flex-start' }}
                onClick={() => handleReactivate(item.id)}
                disabled={reactivatingId === item.id}
              >
                {reactivatingId === item.id ? 'Aktiverer…' : 'Aktivér igen'}
              </button>
            </div>
          ))
        ) : (
          <div className="empty-state">Ingen arkiverede værktøjer fundet.</div>
        )}
      </div>
    </>
  )
}
