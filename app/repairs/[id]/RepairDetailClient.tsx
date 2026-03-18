'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Repair, RepairService } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  ArrowLeft, Phone, MapPin, Wrench, Calendar, CheckCircle,
  RotateCcw, Plus, Trash2, MessageCircle,
} from 'lucide-react'
import Link from 'next/link'

const PRESET_SERVICES = [
  'Servis Ücreti',
  'İşçilik',
  'Yedek Parça',
  'Temizlik',
  'Yazılım Güncelleme',
]

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatPrice(price: number) {
  return price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function RepairDetailClient({ repair: initial }: { repair: Repair }) {
  const [repair, setRepair] = useState(initial)
  const [machineInfo, setMachineInfo] = useState(initial.machine_info)
  const [problemDesc, setProblemDesc] = useState(initial.problem_desc)
  const [repairNotes, setRepairNotes] = useState(initial.repair_notes ?? '')
  const [saving, setSaving] = useState(false)
  const [closing, setClosing] = useState(false)

  const [services, setServices] = useState<RepairService[]>(initial.repair_services ?? [])
  const [newServiceName, setNewServiceName] = useState('')
  const [newServicePrice, setNewServicePrice] = useState('')
  const [addingService, setAddingService] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  const isOpen = repair.status === 'open'
  const total = services.reduce((sum, s) => sum + Number(s.price), 0)

  async function handleUpdate() {
    setSaving(true)
    const { data, error } = await supabase
      .from('repairs')
      .update({
        machine_info: machineInfo,
        problem_desc: problemDesc,
        repair_notes: repairNotes || null,
      })
      .eq('id', repair.id)
      .select('*, customers(*), repair_services(*)')
      .single()

    if (error) {
      toast.error('Güncelleme başarısız: ' + error.message)
    } else {
      setRepair(data)
      toast.success('Kayıt güncellendi.')
    }
    setSaving(false)
  }

  async function handleClose() {
    setClosing(true)
    const newStatus = isOpen ? 'closed' : 'open'
    const { data, error } = await supabase
      .from('repairs')
      .update({
        status: newStatus,
        closed_at: isOpen ? new Date().toISOString() : null,
      })
      .eq('id', repair.id)
      .select('*, customers(*), repair_services(*)')
      .single()

    if (error) {
      toast.error('İşlem başarısız: ' + error.message)
    } else {
      setRepair(data)
      toast.success(isOpen ? 'Tamir kaydı kapatıldı.' : 'Tamir kaydı yeniden açıldı.')
      router.refresh()
    }
    setClosing(false)
  }

  async function handleAddService() {
    const name = newServiceName.trim()
    const price = parseFloat(newServicePrice.replace(',', '.'))

    if (!name) { toast.error('Hizmet adı boş olamaz.'); return }
    if (isNaN(price) || price < 0) { toast.error('Geçerli bir fiyat gir.'); return }

    setAddingService(true)
    const { data, error } = await supabase
      .from('repair_services')
      .insert({ repair_id: repair.id, service_name: name, price })
      .select()
      .single()

    if (error) {
      toast.error('Hizmet eklenemedi: ' + error.message)
    } else {
      setServices((prev) => [...prev, data])
      setNewServiceName('')
      setNewServicePrice('')
    }
    setAddingService(false)
  }

  async function handleRemoveService(serviceId: string) {
    const { error } = await supabase
      .from('repair_services')
      .delete()
      .eq('id', serviceId)

    if (error) {
      toast.error('Silinemedi: ' + error.message)
    } else {
      setServices((prev) => prev.filter((s) => s.id !== serviceId))
    }
  }

  function handleWhatsApp() {
    const phone = repair.customers?.phone?.replace(/\D/g, '')
    if (!phone) { toast.error('Müşteri telefon numarası bulunamadı.'); return }

    const serviceLines = services.length > 0
      ? services.map((s) => `  • ${s.service_name}: ${formatPrice(s.price)} ₺`).join('\n')
      : '  (henüz hizmet eklenmedi)'

    const message = [
      `Sayın ${repair.customers?.full_name},`,
      ``,
      `Tamir işleminizle ilgili bilgilendirme:`,
      ``,
      `📱 Cihaz: ${machineInfo}`,
      `🔧 Arıza: ${problemDesc}`,
      ``,
      `💰 Hizmetler & Ücretler:`,
      serviceLines,
      ``,
      `Toplam: ${formatPrice(total)} ₺`,
      ``,
      `İyi günler dileriz.`,
    ].join('\n')

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
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
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold truncate">{repair.customers?.full_name}</h1>
          </div>
          <Badge
            className={isOpen
              ? 'bg-orange-100 text-orange-700'
              : 'bg-green-100 text-green-700'
            }
          >
            {isOpen ? 'Açık' : 'Kapalı'}
          </Badge>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Müşteri bilgileri */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Müşteri Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="font-medium">{repair.customers?.full_name}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="w-4 h-4" />
              <a href={`tel:${repair.customers?.phone}`} className="text-blue-600">
                {repair.customers?.phone}
              </a>
            </div>
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{repair.customers?.address}</span>
            </div>
            {repair.customers?.notes && (
              <p className="text-sm text-muted-foreground italic">{repair.customers.notes}</p>
            )}
          </CardContent>
        </Card>

        {/* Tarihler */}
        <Card>
          <CardContent className="pt-4 space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Açılış:</span>
              <span>{formatDate(repair.opened_at)}</span>
            </div>
            {repair.closed_at && (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-muted-foreground">Kapanış:</span>
                <span>{formatDate(repair.closed_at)}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tamir bilgileri (düzenlenebilir) */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              Tamir Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label>Makine Bilgisi</Label>
              <Input
                value={machineInfo}
                onChange={(e) => setMachineInfo(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Arıza / Şikayet</Label>
              <Textarea
                value={problemDesc}
                onChange={(e) => setProblemDesc(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-1">
              <Label>Yapılan İşlemler</Label>
              <Textarea
                value={repairNotes}
                onChange={(e) => setRepairNotes(e.target.value)}
                placeholder="Yapılan işlemleri buraya yaz..."
                rows={4}
              />
            </div>
            <Button
              className="w-full"
              onClick={handleUpdate}
              disabled={saving}
            >
              {saving ? 'Kaydediliyor...' : 'Kaydı Güncelle'}
            </Button>
          </CardContent>
        </Card>

        {/* Hizmetler & Ücretler */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Hizmetler & Ücretler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Mevcut hizmetler */}
            {services.length > 0 ? (
              <div className="space-y-2">
                {services.map((service) => (
                  <div key={service.id} className="flex items-center justify-between gap-2">
                    <span className="text-sm flex-1">{service.service_name}</span>
                    <span className="text-sm font-medium tabular-nums">
                      {formatPrice(service.price)} ₺
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveService(service.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <div className="border-t pt-2 flex justify-between items-center font-semibold">
                  <span>Toplam</span>
                  <span className="tabular-nums">{formatPrice(total)} ₺</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Henüz hizmet eklenmedi.</p>
            )}

            {/* Yeni hizmet ekleme */}
            <div className="space-y-2 pt-1">
              <div className="space-y-1">
                <Label>Hizmet Adı</Label>
                <Input
                  list="preset-services"
                  placeholder="Seç veya yaz..."
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                />
                <datalist id="preset-services">
                  {PRESET_SERVICES.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>
              <div className="space-y-1">
                <Label>Fiyat (₺)</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={newServicePrice}
                  onChange={(e) => setNewServicePrice(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleAddService}
                disabled={addingService}
              >
                <Plus className="w-4 h-4 mr-2" />
                {addingService ? 'Ekleniyor...' : 'Hizmet Ekle'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* WhatsApp Gönder */}
        <Button
          className="w-full h-12 text-base font-semibold bg-[#25D366] hover:bg-[#1ebe5d] text-white"
          onClick={handleWhatsApp}
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          WhatsApp ile Gönder
        </Button>

        {/* Aç / Kapat */}
        <Button
          className={`w-full h-12 text-base font-semibold ${
            isOpen
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-orange-500 hover:bg-orange-600'
          }`}
          onClick={handleClose}
          disabled={closing}
        >
          {closing ? 'İşleniyor...' : isOpen ? (
            <><CheckCircle className="w-5 h-5 mr-2" /> Tamiri Kapat</>
          ) : (
            <><RotateCcw className="w-5 h-5 mr-2" /> Yeniden Aç</>
          )}
        </Button>
      </main>
    </div>
  )
}
