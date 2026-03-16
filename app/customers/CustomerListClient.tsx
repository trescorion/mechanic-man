'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Customer, Repair } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Phone, MapPin, Search, ChevronRight } from 'lucide-react'

type CustomerWithRepairs = Customer & { repairs: Pick<Repair, 'id' | 'status' | 'machine_info' | 'opened_at'>[] }

export function CustomerListClient({ customers }: { customers: CustomerWithRepairs[] }) {
  const [search, setSearch] = useState('')

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase()
    return !q || c.full_name.toLowerCase().includes(q) || c.phone.includes(q)
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-bold">Müşteriler</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Ad veya telefon ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <p className="text-sm text-muted-foreground">{filtered.length} müşteri</p>

        {filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">Müşteri bulunamadı.</p>
        ) : (
          <div className="space-y-3">
            {filtered.map((customer) => {
              const openCount = customer.repairs.filter(r => r.status === 'open').length
              const totalCount = customer.repairs.length

              return (
                <Card key={customer.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{customer.full_name}</h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                          <Phone className="w-3 h-3" />
                          <a href={`tel:${customer.phone}`} className="text-blue-600">
                            {customer.phone}
                          </a>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{customer.address}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {openCount > 0 && (
                          <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
                            {openCount} açık
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">{totalCount} tamir</span>
                      </div>
                    </div>

                    {customer.repairs.length > 0 && (
                      <div className="mt-3 space-y-1 border-t pt-3">
                        {customer.repairs.slice(0, 3).map((r) => (
                          <Link key={r.id} href={`/repairs/${r.id}`}>
                            <div className="flex items-center justify-between text-sm py-1 hover:text-orange-600 transition-colors">
                              <span className="truncate flex-1">{r.machine_info}</span>
                              <div className="flex items-center gap-1 shrink-0 ml-2">
                                <Badge
                                  variant="secondary"
                                  className={r.status === 'open'
                                    ? 'text-xs bg-orange-50 text-orange-600'
                                    : 'text-xs bg-green-50 text-green-600'
                                  }
                                >
                                  {r.status === 'open' ? 'Açık' : 'Kapalı'}
                                </Badge>
                                <ChevronRight className="w-3 h-3" />
                              </div>
                            </div>
                          </Link>
                        ))}
                        {customer.repairs.length > 3 && (
                          <p className="text-xs text-muted-foreground">+{customer.repairs.length - 3} daha</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
