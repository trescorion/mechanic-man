import { getSupabaseApiClient, corsResponse, corsOptions } from '@/lib/supabase/api'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await getSupabaseApiClient(req)

    const { data, error } = await supabase
      .from('repairs')
      .select('*, customers(*), repair_services(*)')
      .eq('id', id)
      .single()

    if (error) {
      return corsResponse({ error: error.message }, 404)
    }

    return corsResponse(data)
  } catch (err: any) {
    console.error(err)
    return corsResponse({ error: 'Sunucu hatası oluştu.' }, 500)
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { status, repair_notes } = body

    const supabase = await getSupabaseApiClient(req)

    // Build update object
    const updateData: any = {}
    if (repair_notes !== undefined) {
      updateData.repair_notes = repair_notes
    }

    if (status !== undefined) {
      if (status === 'closed') {
        updateData.status = 'closed'
        updateData.closed_at = new Date().toISOString()
      } else if (status === 'open') {
        updateData.status = 'open'
        updateData.closed_at = null
      } else {
        return corsResponse({ error: 'Geçersiz durum (open veya closed olmalı).' }, 400)
      }
    }

    const { data, error } = await supabase
      .from('repairs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return corsResponse({ error: error.message }, 400)
    }

    // Fetch joined record
    const { data: completeRepair, error: finalError } = await supabase
      .from('repairs')
      .select('*, customers(*), repair_services(*)')
      .eq('id', id)
      .single()

    if (finalError) {
      return corsResponse(data)
    }

    return corsResponse(completeRepair)
  } catch (err: any) {
    console.error(err)
    return corsResponse({ error: 'Sunucu hatası oluştu.' }, 500)
  }
}

export async function OPTIONS() {
  return corsOptions()
}
