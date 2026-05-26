import { createClient } from '@supabase/supabase-js'
import { createClient as createCookieClient } from './server'
import { NextResponse } from 'next/server'

/**
 * Gets an authenticated Supabase client using the Bearer token sent in request headers.
 * If no token is present, falls back to the Next.js session cookie client.
 */
export async function getSupabaseApiClient(req: Request) {
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  if (token) {
    return createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    })
  }

  // Fallback to cookie-based Next.js server client
  return await createCookieClient()
}

// CORS Headers Helper
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

/**
 * Generates a JSON response with proper CORS headers.
 */
export function corsResponse(data: any, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: corsHeaders,
  })
}

/**
 * Generates a 204 response for preflight OPTIONS requests with CORS headers.
 */
export function corsOptions() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  })
}
