'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { markToolSold, markToolDeleted, reactivateTool } from '../actions'

export default function ToolArchiveActions({ tool, customers }) {
  const [mode, setMode] = useState(null)
  const [soldType, setSoldType] = useState('kunde')
  const [customerId, setCustomerId] = useState('')
  const [note, setNote] = useState('')
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  async function confirmSold() {
    setSaving(true)
    await markToolSold(tool.id, {
      customerId: soldType === 'kunde' ? customerId || null : null,
      note: soldType === 'andet' ? note : null,
    })
    setSaving(false)
    setMode(null)
    router.refresh()
  }

  async function confirmDeleted() {
    setSaving(true)
    await markToolDeleted(tool.id, reason)
    setSaving(false)
    setMode(null)
    router.refresh()
  }

  if (mode === 'solgt') {
    return (
      <div style={{ background: '#fff', borderRadius: 8, padding: 12, display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 500 }}>Marker "{tool.name}" som solgt</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <input type="radio" checked={soldType === 'kunde'} onChange={() => setSoldType('kunde')} />
            Solgt til Skur-kunde
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <input type="radio" checked={soldType === 'andet'} onChange={() => setSoldType('andet')} />
            Solgt via andet (Facebook m.v.)
          </label>
        </div>

        {soldType === 'kunde' ? (
          <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} style={{ padding: 8 }}>
            <option value="">Vælg kunde…</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.full_name}{c.phone ? ` — ${c.phone}` : ''}</option>
            ))}
          </select>
        ) : (
          <textarea
            rows={2}
            placeholder="F.eks. Facebook — Peter, 2000 kr"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={{ padding: 8 }}
          />
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" onClick={() => setMode(null)} style={{ padding: '8px 14px' }}>
            Annullér
          </button>
          <button
            type="button"
            className="btn-primary"
            style={{ width: 'auto', padding: '8px 14px' }}
            onClick={confirmSold}
            disabled={saving || (soldType === 'kunde' && !customerId)}
          >
            {saving ? 'Gemmer…' : 'Bekræft salg'}
          </button>
        </div>
      </div>
    )
  }

  if (mode === 'slettet') {
    return (
      <div style={{ background: '#fff', borderRadius: 8, padding: 12, display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 500 }}>Marker "{tool.name}" som slettet</div>
        <textarea
          rows={2}
          placeholder="Årsag (valgfrit), f.eks. Defekt, kasseret"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          style={{ padding: 8 }}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" onClick={() => setMode(null)} style={{ padding: '8px 14px' }}>
            Annullér
          </button>
          <button
            type="button"
            className="btn-primary"
            style={{ width: 'auto', padding: '8px 14px' }}
            onClick={confirmDeleted}
            disabled={saving}
          >
            {saving ? 'Gemmer…' : 'Bekræft sletning'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <button
        type="button"
        onClick={() => setMode('solgt')}
        style={{ color: '#3b6d11', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13 }}
      >
        Marker som solgt
      </button>
      <button
        type="button"
        onClick={() => setMode('slettet')}
        style={{ color: '#993c1d', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13 }}
      >
        Marker som slettet
      </button>
    </div>
  )
}
