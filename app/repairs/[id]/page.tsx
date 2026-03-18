import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { RepairDetailClient } from './RepairDetailClient'

export default async function RepairDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: repair } = await supabase
    .from('repairs')
    .select('*, customers(*), repair_services(*)')
    .eq('id', id)
    .single()

  if (!repair) notFound()

  return <RepairDetailClient repair={repair} />
}
