import { getSupabaseApiClient, corsResponse, corsOptions } from '@/lib/supabase/api'

export async function GET(req: Request) {
  try {
    const supabase = await getSupabaseApiClient(req)
    
    // Fetch repairs with nested customer and services
    const { data, error } = await supabase
      .from('repairs')
      .select('*, customers(*), repair_services(*)')
      .order('opened_at', { ascending: false })

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
    const { 
      customer_id, 
      new_customer, 
      machine_info, 
      problem_desc, 
      repair_notes,
      initial_services 
    } = body

    if (!machine_info || !problem_desc) {
      return corsResponse({ error: 'Cihaz Bilgisi ve Arıza Açıklaması zorunludur.' }, 400)
    }

    const supabase = await getSupabaseApiClient(req)
    let targetCustomerId = customer_id

    // If new customer needs to be created first
    if (!targetCustomerId && new_customer) {
      const { full_name, phone, address, notes } = new_customer
      if (!full_name || !phone) {
        return corsResponse({ error: 'Müşteri oluşturulurken Ad Soyad ve Telefon zorunludur.' }, 400)
      }

      const { data: customer, error: custError } = await supabase
        .from('customers')
        .insert({
          full_name,
          phone,
          address: address || '',
          notes: notes || null
        })
        .select()
        .single()

      if (custError) {
        return corsResponse({ error: `Müşteri oluşturulamadı: ${custError.message}` }, 400)
      }
      targetCustomerId = customer.id
    }

    if (!targetCustomerId) {
      return corsResponse({ error: 'Bir müşteri seçmeli veya yeni bir müşteri oluşturmalısınız.' }, 400)
    }

    // Insert Repair
    const { data: repair, error: repError } = await supabase
      .from('repairs')
      .insert({
        customer_id: targetCustomerId,
        machine_info,
        problem_desc,
        status: 'open',
        repair_notes: repair_notes || null
      })
      .select()
      .single()

    if (repError) {
      return corsResponse({ error: `Tamir kaydı oluşturulamadı: ${repError.message}` }, 400)
    }

    // Insert initial services if provided
    if (initial_services && Array.isArray(initial_services) && initial_services.length > 0) {
      const servicesToInsert = initial_services.map(item => ({
        repair_id: repair.id,
        service_name: item.service_name,
        price: item.price
      }))

      const { error: srvError } = await supabase
        .from('repair_services')
        .insert(servicesToInsert)

      if (srvError) {
        console.error('Initial services insertion failed:', srvError.message)
      }
    }

    // Return the complete joined record
    const { data: completeRepair, error: finalError } = await supabase
      .from('repairs')
      .select('*, customers(*), repair_services(*)')
      .eq('id', repair.id)
      .single()

    if (finalError) {
      return corsResponse(repair, 201)
    }

    return corsResponse(completeRepair, 201)
  } catch (err: any) {
    console.error(err)
    return corsResponse({ error: 'Sunucu hatası oluştu.' }, 500)
  }
}

export async function OPTIONS() {
  return corsOptions()
}
