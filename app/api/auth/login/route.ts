import { getSupabaseApiClient, corsResponse, corsOptions } from '@/lib/supabase/api'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return corsResponse({ error: 'Email ve şifre zorunludur.' }, 400)
    }

    const supabase = await getSupabaseApiClient(req)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return corsResponse({ error: error.message }, 401)
    }

    return corsResponse({
      user: data.user,
      session: data.session,
    })
  } catch (err: any) {
    console.error(err)
    return corsResponse({ error: 'Sunucu hatası oluştu.' }, 500)
  }
}

export async function OPTIONS() {
  return corsOptions()
}
