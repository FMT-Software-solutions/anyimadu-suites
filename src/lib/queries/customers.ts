import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { BookingRecord } from '@/lib/types'

export type DerivedCustomer = {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  country: string
  city: string
  address: string
  dateOfBirth: string
  totalBookings: number
  totalSpent: number
  lastBooking?: string
  status: 'active' | 'inactive' | 'vip'
  joinedDate: string
}

const normalizeEmail = (email?: string | null) => (email || '').trim().toLowerCase()
const normalizePhone = (phone?: string | null) => (phone || '').replace(/\D/g, '')
const normalizeName = (name?: string | null) => (name || '').trim().toLowerCase().replace(/\s+/g, ' ')

const groupKey = (rec: BookingRecord) => {
  const e = normalizeEmail(rec.customer_email)
  if (e) return `email:${e}`
  const p = normalizePhone(rec.customer_phone)
  if (p) return `phone:${p}`
  return `name:${normalizeName(rec.customer_name)}`
}

const splitName = (full: string) => {
  const trimmed = (full || '').trim()
  if (!trimmed) return { firstName: '', lastName: '' }
  const parts = trimmed.split(/\s+/)
  if (parts.length === 1) return { firstName: parts[0], lastName: '' }
  const firstName = parts[0]
  const lastName = parts.slice(1).join(' ')
  return { firstName, lastName }
}

export const useCustomers = () => {
  return useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10000)
      if (error) throw error
      const rows = (data || []) as BookingRecord[]

      const map = new Map<
        string,
        {
          customer: DerivedCustomer
          joinedAt: number
          lastAt: number
        }
      >()

      rows.forEach((b) => {
        const key = groupKey(b)
        const { firstName, lastName } = splitName(b.customer_name || '')
        const createdAt = new Date(b.created_at).getTime()
        const stayEnd = new Date(`${b.check_out}T00:00:00`).getTime()
        const lastAt = Number.isFinite(stayEnd) ? stayEnd : createdAt
        const city = b.billing_city || ''
        const country = b.billing_country || ''
        const address = b.billing_address || ''
        const phone = b.customer_phone || ''
        const email = b.customer_email || ''
        const amount = Number(b.total_amount) || 0
        const isCancelled = b.status === 'cancelled'

        if (!map.has(key)) {
          map.set(key, {
            customer: {
              id: map.size + 1,
              firstName,
              lastName,
              email,
              phone,
              country,
              city,
              address,
              dateOfBirth: '',
              totalBookings: isCancelled ? 0 : 1,
              totalSpent: isCancelled ? 0 : amount,
              lastBooking: new Date(lastAt).toISOString(),
              status: 'active',
              joinedDate: new Date(createdAt).toISOString(),
            },
            joinedAt: createdAt,
            lastAt,
          })
        } else {
          const cur = map.get(key)!
          const c = cur.customer
          if (!c.firstName && firstName) c.firstName = firstName
          if (!c.lastName && lastName) c.lastName = lastName
          if (!c.email && email) c.email = email
          if (!c.phone && phone) c.phone = phone
          if (!c.city && city) c.city = city
          if (!c.country && country) c.country = country
          if (!c.address && address) c.address = address
          if (!isCancelled) c.totalBookings += 1
          if (!isCancelled) c.totalSpent += amount
          cur.joinedAt = Math.min(cur.joinedAt, createdAt)
          cur.lastAt = Math.max(cur.lastAt, lastAt)
          c.lastBooking = new Date(cur.lastAt).toISOString()
          c.joinedDate = new Date(cur.joinedAt).toISOString()
        }
      })

      const now = Date.now()
      const customers: DerivedCustomer[] = []
      map.forEach((entry) => {
        const c = entry.customer
        const daysSinceLast = Math.round((now - entry.lastAt) / (1000 * 60 * 60 * 24))
        const isVip = c.totalSpent >= 3000 || c.totalBookings >= 5
        const isInactive = daysSinceLast > 180
        c.status = isVip ? 'vip' : isInactive ? 'inactive' : 'active'
        customers.push(c)
      })

      customers.sort((a, b) => {
        const an = `${a.firstName} ${a.lastName}`.trim().toLowerCase()
        const bn = `${b.firstName} ${b.lastName}`.trim().toLowerCase()
        return an.localeCompare(bn)
      })

      return customers
    },
    staleTime: 60 * 1000,
  })
}

