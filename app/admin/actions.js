'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addTool(formData) {
  const supabase = await createClient()
  await supabase.from('tools').insert({
    name: formData.get('name'),
    price_per_day: Number(formData.get('price_per_day')),
    available: true,
  })
  revalidatePath('/admin')
  revalidatePath('/')
}

export async function updateTool(id, formData) {
  const supabase = await createClient()

  const newPrice = Number(formData.get('price_per_day'))

  const { data: current, error: fetchError } = await supabase
    .from('tools')
    .select('price_per_day')
    .eq('id', id)
    .single()

  if (fetchError) {
    console.error('Fejl ved hentning af nuværende pris:', fetchError)
  }

  if (current && Number(current.price_per_day) !== newPrice) {
    const { error: historyError } = await supabase.from('tool_price_history').insert({
      tool_id: id,
      old_value: current.price_per_day,
      new_value: newPrice,
    })
    if (historyError) {
      console.error('Fejl ved gemning af prishistorik:', historyError)
    }
  }

  await supabase
    .from('tools')
    .update({
      name: formData.get('name'),
      price_per_day: newPrice,
    })
    .eq('id', id)
  revalidatePath('/admin')
  revalidatePath('/')
}

export async function toggleAvailable(id, currentValue) {
  const supabase = await createClient()
  await supabase
    .from('tools')
    .update({ available: !currentValue })
    .eq('id', id)
  revalidatePath('/admin')
  revalidatePath('/')
}

export async function deleteTool(id) {
  const supabase = await createClient()
  await supabase.from('tools').delete().eq('id', id)
  revalidatePath('/admin')
  revalidatePath('/')
}

export async function replyToMessage(id, formData) {
  const supabase = await createClient()
  await supabase
    .from('messages')
    .update({ reply: formData.get('reply') })
    .eq('id', id)
  revalidatePath('/admin')
}

export async function updateToolDetails(id, formData) {
  const supabase = await createClient()
  const updates = {
    description: formData.get('description') || null,
    last_serviced: formData.get('last_serviced') || null,
    service_interval_months: formData.get('service_interval_months') ? Number(formData.get('service_interval_months')) : 12,
    for_sale: formData.get('for_sale') === 'on',
    sale_price: formData.get('sale_price') ? Number(formData.get('sale_price')) : null,
  }
  const imageFile = formData.get('image')
  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split('.').pop()
    const fileName = `${id}-${Date.now()}.${fileExt}`
    const { error: uploadError } = await supabase.storage
      .from('tool-images')
      .upload(fileName, imageFile, { upsert: true })
    if (!uploadError) {
      const { data: publicUrlData } = supabase.storage
        .from('tool-images')
        .getPublicUrl(fileName)
      updates.image_url = publicUrlData.publicUrl
    }
  }
  await supabase.from('tools').update(updates).eq('id', id)
  revalidatePath('/admin')
  revalidatePath('/')
}

export async function addToolUnit(toolId, formData) {
  const supabase = await createClient()
  const brand = formData.get('brand')
  const serial_number = formData.get('serial_number') || null
  const purchase_date = formData.get('purchase_date') || null
  const purchase_price = formData.get('purchase_price') ? Number(formData.get('purchase_price')) : null
  const prefix = brand.trim().slice(0, 2).toUpperCase()
  const { data: existing } = await supabase
    .from('tool_units')
    .select('unit_code')
    .ilike('unit_code', `${prefix}-%`)
  let maxNum = 0
  if (existing) {
    for (const row of existing) {
      const num = parseInt(row.unit_code.split('-')[1], 10)
      if (!isNaN(num) && num > maxNum) maxNum = num
    }
  }
  const unit_code = `${prefix}-${String(maxNum + 1).padStart(3, '0')}`
  await supabase.from('tool_units').insert({
    tool_id: toolId,
    unit_code,
    serial_number,
    purchase_date,
    purchase_price,
    status: 'available',
  })
  await supabase.from('tools').update({ brand }).eq('id', toolId)
  revalidatePath('/admin')
}

export async function deleteToolUnit(id) {
  const supabase = await createClient()
  await supabase.from('tool_units').delete().eq('id', id)
  revalidatePath('/admin')
}

export async function updateToolUnitStatus(id, status) {
  const supabase = await createClient()
  await supabase.from('tool_units').update({ status }).eq('id', id)
  revalidatePath('/admin')
}

export async function setCustomerHold(customerId, shouldHold, reason) {
  const supabase = await createClient()
  await supabase
    .from('customer_profiles')
    .update({
      status: shouldHold ? 'on_hold' : 'active',
      hold_reason: shouldHold ? (reason || null) : null,
    })
    .eq('id', customerId)
  revalidatePath('/admin/kunder')
}

export async function markToolSold(toolId, { customerId, note }) {
  const supabase = await createClient()
  await supabase
    .from('tools')
    .update({
      status: 'solgt',
      archived_at: new Date().toISOString(),
      archived_reason: null,
      sold_to_customer_id: customerId || null,
      sold_to_note: note || null,
    })
    .eq('id', toolId)
  revalidatePath('/admin/vaerktoj')
  revalidatePath('/admin/arkiv')
  revalidatePath('/')
}

export async function markToolDeleted(toolId, reason) {
  const supabase = await createClient()
  await supabase
    .from('tools')
    .update({
      status: 'slettet',
      archived_at: new Date().toISOString(),
      archived_reason: reason || null,
      sold_to_customer_id: null,
      sold_to_note: null,
    })
    .eq('id', toolId)
  revalidatePath('/admin/vaerktoj')
  revalidatePath('/admin/arkiv')
  revalidatePath('/')
}

export async function reactivateTool(toolId) {
  const supabase = await createClient()
  await supabase
    .from('tools')
    .update({
      status: 'aktiv',
      archived_at: null,
      archived_reason: null,
      sold_to_customer_id: null,
      sold_to_note: null,
    })
    .eq('id', toolId)
  revalidatePath('/admin/vaerktoj')
  revalidatePath('/admin/arkiv')
  revalidatePath('/')
}
export async function confirmBookingReceived(bookingId) {
  const supabase = await createClient()
  await supabase
    .from('bookings')
    .update({ returned_at: new Date().toISOString() })
    .eq('id', bookingId)
  revalidatePath('/admin/bookinger')
}

export async function updateDeliverySettings(formData) {
  const supabase = await createClient()

  const newBaseFee = Number(formData.get('base_fee'))
  const newPricePerKm = Number(formData.get('price_per_km'))

  const { data: current } = await supabase
    .from('delivery_settings')
    .select('*')
    .eq('id', 1)
    .single()

  const historyEntries = []

  if (current && Number(current.base_fee) !== newBaseFee) {
    historyEntries.push({
      field: 'base_fee',
      old_value: current.base_fee,
      new_value: newBaseFee,
    })
  }
  if (current && Number(current.price_per_km) !== newPricePerKm) {
    historyEntries.push({
      field: 'price_per_km',
      old_value: current.price_per_km,
      new_value: newPricePerKm,
    })
  }

  if (historyEntries.length > 0) {
    await supabase.from('delivery_price_history').insert(historyEntries)
  }

  await supabase
    .from('delivery_settings')
    .upsert({ id: 1, base_fee: newBaseFee, price_per_km: newPricePerKm })

  revalidatePath('/admin/vaerktoj')
}
