'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Customer } from '@/lib/types'
import { Search, CheckCircle } from 'lucide-react'

export function CustomerSearch({
  onSelect,
  selected,
}: {
  onSelect: (customer: Customer | null) => void
  selected: Customer | null
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function search() {
    if (!query.trim()) return
    setLoading(true)
    const { data } = await supabase
      .from('customers')
      .select('*')
      .or(`phone.ilike.%${query}%,full_name.ilike.%${query}%`)
      .limit(5)
    setResults(data ?? [])
    setLoading(false)
  }

  if (selected) {
    return (
      <div className="border rounded-lg p-3 bg-green-50 border-green-200">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1 text-green-700 font-medium">
              <CheckCircle className="w-4 h-4" />
              <span>{selected.full_name}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{selected.phone}</p>
            <p className="text-sm text-muted-foreground">{selected.address}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { onSelect(null); setResults([]); setQuery('') }}
          >
            Değiştir
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          placeholder="Ad veya telefon ile ara..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && search()}
        />
        <Button type="button" onClick={search} disabled={loading} size="icon">
          <Search className="w-4 h-4" />
        </Button>
      </div>

      {results.length > 0 && (
        <div className="space-y-1">
          {results.map((c) => (
            <Card
              key={c.id}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => { onSelect(c); setResults([]) }}
            >
              <CardContent className="p-3">
                <p className="font-medium text-sm">{c.full_name}</p>
                <p className="text-xs text-muted-foreground">{c.phone} — {c.address}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {results.length === 0 && query && !loading && (
        <p className="text-sm text-muted-foreground">Sonuç bulunamadı. Yeni müşteri formu doldurun.</p>
      )}
    </div>
  )
}
