import { getSupabaseApiClient, corsResponse, corsOptions } from '@/lib/supabase/api'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { service_name, price } = body

    if (!service_name || typeof price !== 'number') {
      return corsResponse({ error: 'Hizmet ismi ve geçerli fiyat zorunludur.' }, 400)
    }

    const supabase = await getSupabaseApiClient(req)
    
    // Insert new service/part item linked to repair
    const { data, error } = await supabase
      .from('repair_services')
      .insert({
        repair_id: id,
        service_name,
        price
      })
      .select()
      .single()

    if (error) {
      return corsResponse({ error: error.message }, 400)
    }

    return corsResponse(data, 201)
  } catch (err: any) {
    console.error(err)
    return corsResponse({ error: 'Sunucu hatası oluştu.' }, 500)
  }
}

export async function OPTIONS() {
  return corsOptions()
}
