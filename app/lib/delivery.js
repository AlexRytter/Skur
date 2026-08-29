'use server'

import { createClient } from '@/lib/supabase/server'

const PICKUP_ADDRESS = 'Tuevej 7, 3630 Jægerspris, Denmark'

export async function calculateDeliveryPrice(customerAddress) {
  const supabase = await createClient()

  const { data: settings } = await supabase
    .from('delivery_settings')
    .select('*')
    .eq('id', 1)
    .single()

  const baseFee = settings?.base_fee ?? 50
  const pricePerKm = settings?.price_per_km ?? 2.5

  const apiKey = process.env.GOOGLE_MAPS_API_KEY

  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(PICKUP_ADDRESS)}&destinations=${encodeURIComponent(customerAddress)}&units=metric&key=${apiKey}`

  const response = await fetch(url)
  const data = await response.json()

  const element = data?.rows?.[0]?.elements?.[0]

  if (!element || element.status !== 'OK') {
    return { error: 'Kunne ikke beregne afstand for den adresse. Tjek at adressen er korrekt.' }
  }

  const distanceMeters = element.distance.value
  const km = distanceMeters / 1000
  const price = Math.round(baseFee + km * pricePerKm)

  return { km: Math.round(km * 10) / 10, price }
}
