import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CustomerListClient } from './CustomerListClient'

export default async function CustomersPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: customers } = await supabase
    .from('customers')
    .select('*, repairs(id, status, machine_info, opened_at)')
    .order('created_at', { ascending: false })

  return <CustomerListClient customers={customers ?? []} />
}
