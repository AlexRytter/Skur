export async function updateTool(id, formData) {
  const supabase = await createClient()
  const newPrice = Number(formData.get('price_per_day'))

  try {
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
  } catch (err) {
    console.error('Uventet fejl i prishistorik-logik:', err)
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
