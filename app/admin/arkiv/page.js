import { createClient } from '@/lib/supabase/server'
import ArchiveList from './archive-list'

export default async function ArkivPage() {
  const supabase = await createClient()

  const { data: tools } = await supabase
    .from('tools')
    .select('*')
    .neq('status', 'aktiv')
    .order('archived_at', { ascending: false })

  const { data: units } = await supabase
    .from('tool_units')
    .select('*')

  const { data: customers } = await supabase
    .from('customer_profiles')
    .select('id, full_name')

  const items = (tools || []).map((tool) => ({
    ...tool,
    units: (units || []).filter((u) => u.tool_id === tool.id),
    customerName: tool.sold_to_customer_id
      ? (customers || []).find((c) => c.id === tool.sold_to_customer_id)?.full_name
      : null,
  }))

  return (
    <>
      <div className="section-title">Arkiv</div>
      <hr style={{ border: 'none', borderTop: '2px solid #2c2c2a', margin: '0 0 16px' }} />
      <ArchiveList items={items} />
    </>
  )
}
