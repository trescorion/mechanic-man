import { createClient } from '@/lib/supabase/server'
import { RepairListClient } from '@/components/repairs/RepairListClient'
import { Button } from '@/components/ui/button'
import { Repair } from '@/lib/types'
import Link from 'next/link'
import { Plus, LogOut, Users } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: repairs } = await supabase
    .from('repairs')
    .select('*, customers(*)')
    .order('opened_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-orange-600">Tamirci Paneli</h1>
          <div className="flex items-center gap-2">
            <Link href="/customers">
              <Button variant="ghost" size="icon">
                <Users className="w-5 h-5" />
              </Button>
            </Link>
            <form action="/auth/signout" method="post">
              <Button variant="ghost" size="icon" type="submit">
                <LogOut className="w-5 h-5" />
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Yeni kayıt butonu */}
        <Link href="/repairs/new">
          <Button className="w-full bg-orange-500 hover:bg-orange-600 h-12 text-base font-semibold">
            <Plus className="w-5 h-5 mr-2" />
            Yeni Tamir Kaydı Aç
          </Button>
        </Link>

        {/* Kayıtlar */}
        <RepairListClient repairs={(repairs ?? []) as Repair[]} />
      </main>
    </div>
  )
}
