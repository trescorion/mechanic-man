'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Repair } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { ArrowLeft, Phone, MapPin, Wrench, Calendar, CheckCircle, RotateCcw } from 'lucide-react'
import Link from 'next/link'

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

export function RepairDetailClient({ repair: initial }: { repair: Repair }) {
  const [repair, setRepair] = useState(initial)
  const [machineInfo, setMachineInfo] = useState(initial.machine_info)
  const [problemDesc, setProblemDesc] = useState(initial.problem_desc)
  const [repairNotes, setRepairNotes] = useState(initial.repair_notes ?? '')
  const [saving, setSaving] = useState(false)
  const [closing, setClosing] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const isOpen = repair.status === 'open'

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
      .select('*, customers(*)')
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
      .select('*, customers(*)')
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
