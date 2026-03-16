import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Repair } from '@/lib/types'
import { Wrench, Phone, MapPin, Calendar } from 'lucide-react'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function RepairCard({ repair }: { repair: Repair }) {
  const isOpen = repair.status === 'open'

  return (
    <Link href={`/repairs/${repair.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base truncate">
                {repair.customers?.full_name ?? '—'}
              </h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                <Phone className="w-3 h-3" />
                <span>{repair.customers?.phone ?? '—'}</span>
              </div>
            </div>
            <Badge
              variant={isOpen ? 'default' : 'secondary'}
              className={isOpen
                ? 'bg-orange-100 text-orange-700 hover:bg-orange-100 shrink-0'
                : 'bg-green-100 text-green-700 hover:bg-green-100 shrink-0'
              }
            >
              {isOpen ? 'Açık' : 'Kapalı'}
            </Badge>
          </div>

          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
            <Wrench className="w-3 h-3 shrink-0" />
            <span className="truncate">{repair.machine_info}</span>
          </div>

          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {repair.problem_desc}
          </p>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>Açılış: {formatDate(repair.opened_at)}</span>
          </div>

          {repair.customers?.address && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{repair.customers.address}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
