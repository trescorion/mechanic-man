import { getSupabaseApiClient, corsResponse, corsOptions } from '@/lib/supabase/api'

export async function GET(req: Request) {
  try {
    const supabase = await getSupabaseApiClient(req)
    
    // Fetch customers
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return corsResponse({ error: error.message }, 400)
    }

    return corsResponse(data)
  } catch (err: any) {
    console.error(err)
    return corsResponse({ error: 'Sunucu hatası oluştu.' }, 500)
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { full_name, phone, address, notes } = body

    if (!full_name || !phone) {
      return corsResponse({ error: 'Ad Soyad ve Telefon bilgileri zorunludur.' }, 400)
    }

    const supabase = await getSupabaseApiClient(req)
    const { data, error } = await supabase
      .from('customers')
      .insert({
        full_name,
        phone,
        address: address || '',
        notes: notes || null
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
