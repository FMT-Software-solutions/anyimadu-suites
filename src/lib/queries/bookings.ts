import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { toISODate, validateSearch } from '@/lib/bookingValidation'
import type { BookingRecord } from '@/lib/types'

export type CreateBookingPayload = {
  suite_id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  check_in: Date
  check_out: Date
  guest_count: number
  total_amount: number
  billing_address?: string | null
  billing_city?: string | null
  billing_state?: string | null
  billing_zip?: string | null
  billing_country?: string | null
}

export const useCreateBooking = () => {
  return useMutation({
    mutationFn: async (payload: CreateBookingPayload) => {
      const err = validateSearch(payload.check_in, payload.check_out, payload.guest_count)
      if (err) throw new Error(err)
      const { error } = await supabase.from('bookings').insert({
        suite_id: payload.suite_id,
        customer_name: payload.customer_name,
        customer_email: payload.customer_email,
        customer_phone: payload.customer_phone,
        check_in: toISODate(payload.check_in),
        check_out: toISODate(payload.check_out),
        guest_count: payload.guest_count,
        total_amount: payload.total_amount,
        status: 'pending',
        billing_address: payload.billing_address ?? null,
        billing_city: payload.billing_city ?? null,
        billing_state: payload.billing_state ?? null,
        billing_zip: payload.billing_zip ?? null,
        billing_country: payload.billing_country ?? null,
      })
      if (error) throw error
    },
  })
}

const fromBookings = () => supabase.from('bookings')

export type BookingsFilters = {
  search?: string
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'all'
  dateRange?: 'all' | 'today' | 'this-week' | 'this-month' | 'last-month'
  suiteId?: string
}

const getDateRange = (key: BookingsFilters['dateRange']) => {
  const now = new Date()
  if (!key || key === 'all') return null
  const start = new Date(now)
  const end = new Date(now)
  switch (key) {
    case 'today':
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      return { start, end }
    case 'this-week': {
      const day = now.getDay()
      const diffToMonday = (day + 6) % 7
      start.setDate(now.getDate() - diffToMonday)
      start.setHours(0, 0, 0, 0)
      end.setDate(start.getDate() + 6)
      end.setHours(23, 59, 59, 999)
      return { start, end }
    }
    case 'this-month':
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
      end.setMonth(start.getMonth() + 1, 0)
      end.setHours(23, 59, 59, 999)
      return { start, end }
    case 'last-month':
      start.setMonth(start.getMonth() - 1, 1)
      start.setHours(0, 0, 0, 0)
      end.setMonth(start.getMonth() + 1, 0)
      end.setHours(23, 59, 59, 999)
      return { start, end }
    default:
      return null
  }
}

export const useBookings = (page: number, perPage: number, filters: BookingsFilters = {}) => {
  return useQuery({
    queryKey: ['bookings', { page, perPage, filters }],
    queryFn: async () => {
      let q = fromBookings()
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
      if (filters.status && filters.status !== 'all') {
        q = q.eq('status', filters.status)
      }
      if (filters.suiteId) {
        q = q.eq('suite_id', filters.suiteId)
      }
      const rng = getDateRange(filters.dateRange)
      if (rng) {
        const startIso = new Date(rng.start).toISOString()
        const endIso = new Date(rng.end).toISOString()
        q = q.gte('created_at', startIso).lte('created_at', endIso)
      }
      if (filters.search && filters.search.trim().length > 0) {
        const term = `%${filters.search.trim()}%`
        q = q.or(
          `customer_name.ilike.${term},customer_email.ilike.${term},customer_phone.ilike.${term}`
        )
      }
      const from = (page - 1) * perPage
      const to = from + perPage - 1
      const { data, count, error } = await q.range(from, to)
      if (error) throw error
      return { rows: (data || []) as BookingRecord[], count: count || 0 }
    },
    staleTime: 60 * 1000,
  })
}

export const checkSuiteAvailability = async (
  suiteId: string,
  checkIn: Date,
  checkOut: Date,
  guests: number
) => {
  const ci = toISODate(checkIn)
  const co = toISODate(checkOut)
  const { data, error } = await supabase.rpc('available_suites', {
    p_check_in: ci,
    p_check_out: co,
    p_guest_count: guests,
  })
  if (error) throw error
  const ids = Array.isArray(data) ? data.map((r: any) => r.id ?? r) : []
  return ids.includes(suiteId)
}

export const useUpdateBookingStatus = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { id: string; status: 'pending' | 'confirmed' | 'cancelled' | 'completed' }) => {
      const { error } = await supabase.from('bookings').update({ status: payload.status }).eq('id', payload.id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] })
    },
  })
}

export const useSuiteBookings = (suiteId: string | null | undefined) => {
  return useQuery({
    queryKey: ['suite-bookings', suiteId],
    queryFn: async () => {
      if (!suiteId) return [] as BookingRecord[]
      const { data, error } = await fromBookings()
        .select('*')
        .eq('suite_id', suiteId)
        .neq('status', 'cancelled')
        .order('check_in', { ascending: true })
      if (error) throw error
      return (data || []) as BookingRecord[]
    },
    enabled: !!suiteId,
    staleTime: 5 * 60 * 1000,
  })
}
