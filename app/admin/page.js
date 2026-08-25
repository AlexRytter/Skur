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
  await supabase
    .from('tools')
    .update({
      name: formData.get('name'),
      price_per_day: Number(formData.get('price_per_day')),
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
