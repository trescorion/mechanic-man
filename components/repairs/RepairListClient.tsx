'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { RepairCard } from './RepairCard'
import { Repair } from '@/lib/types'
import { Search } from 'lucide-react'

type FilterStatus = 'all' | 'open' | 'closed'

export function RepairListClient({ repairs }: { repairs: Repair[] }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterStatus>('all')

  const filtered = repairs.filter((r) => {
    const matchesStatus =
      filter === 'all' ||
      (filter === 'open' && r.status === 'open') ||
      (filter === 'closed' && r.status === 'closed')

    const q = search.toLowerCase()
    const matchesSearch =
      !q ||
      r.customers?.full_name?.toLowerCase().includes(q) ||
      r.customers?.phone?.includes(q) ||
      r.machine_info.toLowerCase().includes(q)

    return matchesStatus && matchesSearch
  })

  return (
    <div className="space-y-4">
      {/* Arama */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Ad, telefon veya makine ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Filtre */}
      <div className="flex gap-2">
        {(['all', 'open', 'closed'] as FilterStatus[]).map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? 'default' : 'outline'}
            onClick={() => setFilter(f)}
            className={
              filter === f && f === 'open'
                ? 'bg-orange-500 hover:bg-orange-600'
                : filter === f && f === 'closed'
                ? 'bg-green-600 hover:bg-green-700'
                : ''
            }
          >
            {f === 'all' ? 'Tümü' : f === 'open' ? 'Açık' : 'Kapalı'}
          </Button>
        ))}
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">Kayıt bulunamadı.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((repair) => (
            <RepairCard key={repair.id} repair={repair} />
          ))}
        </div>
      )}
    </div>
  )
}
