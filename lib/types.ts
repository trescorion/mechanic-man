export type Customer = {
  id: string
  full_name: string
  phone: string
  address: string
  notes: string | null
  created_at: string
}

export type RepairStatus = 'open' | 'closed'

export type Repair = {
  id: string
  customer_id: string
  machine_info: string
  problem_desc: string
  status: RepairStatus
  repair_notes: string | null
  opened_at: string
  closed_at: string | null
  customers?: Customer
  repair_services?: RepairService[]
}

export type RepairService = {
  id: string
  repair_id: string
  service_name: string
  price: number
  created_at: string
}
