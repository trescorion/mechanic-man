'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CustomerSearch } from '@/components/customers/CustomerSearch'
import { Customer } from '@/lib/types'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

type Mode = 'existing' | 'new'

export default function NewRepairPage() {
  const [mode, setMode] = useState<Mode>('existing')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = e.currentTarget
    const data = new FormData(form)

    let customerId: string

    if (mode === 'new') {
      const { data: newCustomer, error } = await supabase
        .from('customers')
        .insert({
          full_name: data.get('full_name') as string,
          phone: data.get('phone') as string,
          address: data.get('address') as string,
          notes: (data.get('customer_notes') as string) || null,
        })
        .select()
        .single()

      if (error || !newCustomer) {
        toast.error('Müşteri oluşturulamadı: ' + error?.message)
        setLoading(false)
        return
      }
      customerId = newCustomer.id
    } else {
      if (!selectedCustomer) {
        toast.error('Lütfen bir müşteri seçin.')
        setLoading(false)
        return
      }
      customerId = selectedCustomer.id
    }

    const { data: repair, error: repairError } = await supabase
      .from('repairs')
      .insert({
        customer_id: customerId,
        machine_info: data.get('machine_info') as string,
        problem_desc: data.get('problem_desc') as string,
        repair_notes: (data.get('repair_notes') as string) || null,
      })
      .select()
      .single()

    if (repairError || !repair) {
      toast.error('Tamir kaydı oluşturulamadı: ' + repairError?.message)
      setLoading(false)
      return
    }

    toast.success('Tamir kaydı oluşturuldu!')
    router.push(`/repairs/${repair.id}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-bold">Yeni Tamir Kaydı</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Müşteri seçimi */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Müşteri</CardTitle>
              <div className="flex gap-2 mt-2">
                <Button
                  type="button"
                  size="sm"
                  variant={mode === 'existing' ? 'default' : 'outline'}
                  onClick={() => { setMode('existing'); setSelectedCustomer(null) }}
                >
                  Mevcut Müşteri
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={mode === 'new' ? 'default' : 'outline'}
                  onClick={() => { setMode('new'); setSelectedCustomer(null) }}
                >
                  Yeni Müşteri
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {mode === 'existing' ? (
                <CustomerSearch
                  onSelect={setSelectedCustomer}
                  selected={selectedCustomer}
                />
              ) : (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="full_name">Ad Soyad *</Label>
                    <Input id="full_name" name="full_name" required placeholder="Ahmet Yılmaz" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="phone">Telefon *</Label>
                    <Input id="phone" name="phone" required placeholder="05XX XXX XX XX" type="tel" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="address">Adres *</Label>
                    <Textarea id="address" name="address" required placeholder="Mahalle, cadde, kapı no..." rows={2} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="customer_notes">Notlar</Label>
                    <Input id="customer_notes" name="customer_notes" placeholder="İsteğe bağlı" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tamir bilgileri */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Tamir Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="machine_info">Makine Bilgisi *</Label>
                <Input
                  id="machine_info"
                  name="machine_info"
                  required
                  placeholder="Marka, model, seri no..."
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="problem_desc">Arıza / Şikayet *</Label>
                <Textarea
                  id="problem_desc"
                  name="problem_desc"
                  required
                  placeholder="Müşterinin bildirdiği arıza..."
                  rows={3}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="repair_notes">Notlar</Label>
                <Textarea
                  id="repair_notes"
                  name="repair_notes"
                  placeholder="Ek notlar..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 h-12 text-base font-semibold"
            disabled={loading}
          >
            {loading ? 'Kaydediliyor...' : 'Tamir Kaydı Oluştur'}
          </Button>
        </form>
      </main>
    </div>
  )
}
