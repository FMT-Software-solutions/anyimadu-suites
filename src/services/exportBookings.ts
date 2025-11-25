import { supabase } from '@/lib/supabase'
import type { BookingRecord } from '@/lib/types'
import type { BookingsFilters } from '@/lib/queries/bookings'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'

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

export const fetchAllBookingsForExport = async (filters: BookingsFilters): Promise<BookingRecord[]> => {
  let q = supabase.from('bookings').select('*').order('created_at', { ascending: false })
  if (filters.status && filters.status !== 'all') q = q.eq('status', filters.status)
  if (filters.suiteId) q = q.eq('suite_id', filters.suiteId)
  if (filters.search && filters.search.trim().length > 0) {
    const term = `%${filters.search.trim()}%`
    q = q.or(`customer_name.ilike.${term},customer_email.ilike.${term},customer_phone.ilike.${term}`)
  }
  const rng = getDateRange(filters.dateRange)
  if (rng) {
    const startIso = new Date(rng.start).toISOString()
    const endIso = new Date(rng.end).toISOString()
    q = q.gte('created_at', startIso).lte('created_at', endIso)
  }
  q = q.limit(10000)
  const { data, error } = await q
  if (error) throw error
  return (data || []) as BookingRecord[]
}

const fetchSuitesMap = async (): Promise<Map<string, string>> => {
  const { data, error } = await supabase.from('suites').select('id,name')
  if (error) throw error
  const map = new Map<string, string>()
  ;(data || []).forEach((s: any) => { if (s?.id) map.set(String(s.id), String(s.name)) })
  return map
}

const shapeRows = (rows: BookingRecord[], suitesMap: Map<string, string>) => {
  return rows.map((b) => ({
    Suite: suitesMap.get(b.suite_id) || b.suite_id,
    'Customer Name': b.customer_name,
    'Customer Email': b.customer_email,
    'Customer Phone': b.customer_phone,
    'Check-in': b.check_in,
    'Check-out': b.check_out,
    Guests: b.guest_count,
    'Total Amount': b.total_amount,
    Status: b.status,
    'Created At': b.created_at,
    'Billing Address': b.billing_address || '',
    'Billing City': b.billing_city || '',
    'Billing State': b.billing_state || '',
    'Postal Code': b.billing_zip || '',
    Country: b.billing_country || '',
  }))
}

export const exportBookingsToXLSX = async (filters: BookingsFilters) => {
  const [rows, suitesMap] = await Promise.all([
    fetchAllBookingsForExport(filters),
    fetchSuitesMap(),
  ])
  const shaped = shapeRows(rows, suitesMap)
  const ws = XLSX.utils.json_to_sheet(shaped)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Bookings')
  const name = `bookings_${new Date().toISOString().slice(0,10)}.xlsx`
  XLSX.writeFile(wb, name)
}

export const exportBookingsToPDF = async (filters: BookingsFilters) => {
  const [rows, suitesMap] = await Promise.all([
    fetchAllBookingsForExport(filters),
    fetchSuitesMap(),
  ])
  const shaped = shapeRows(rows, suitesMap)
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 40
  let y = margin
  doc.setFontSize(16)
  doc.text('Bookings Export', margin, y)
  y += 20
  doc.setFontSize(11)
  const cardPadding = 12
  const lineHeight = 14
  const contentWidth = pageWidth - margin * 2
  const drawCard = (rec: any) => {
    const linesAddress = doc.splitTextToSize(String(rec['Billing Address'] || ''), contentWidth - cardPadding * 2)
    const linesCity = doc.splitTextToSize(String(rec['Billing City'] || ''), contentWidth - cardPadding * 2)
    const linesState = doc.splitTextToSize(String(rec['Billing State'] || ''), contentWidth - cardPadding * 2)
    const linesPostal = doc.splitTextToSize(String(rec['Postal Code'] || ''), contentWidth - cardPadding * 2)
    const linesCountry = doc.splitTextToSize(String(rec['Country'] || ''), contentWidth - cardPadding * 2)
    const headerHeight = lineHeight * 2
    const bodyStaticLines = 7
    const bodyHeight = (bodyStaticLines * lineHeight) + (linesAddress.length + linesCity.length + linesState.length + linesPostal.length + linesCountry.length) * lineHeight
    const cardHeight = headerHeight + bodyHeight + cardPadding * 2
    if (y + cardHeight > pageHeight - margin) {
      doc.addPage()
      y = margin
    }
    doc.setDrawColor(230)
    doc.setFillColor(248, 250, 252)
    doc.roundedRect(margin, y, contentWidth, cardHeight, 6, 6, 'F')
    let cy = y + cardPadding
    doc.setFontSize(12)
    doc.setTextColor(0)
    doc.text(String(rec['Suite']), margin + cardPadding, cy)
    const statusText = String(rec['Status'])
    const createdText = `Created: ${String(rec['Created At'])}`
    const statusX = margin + contentWidth - cardPadding - doc.getTextWidth(statusText)
    doc.text(statusText, statusX, cy)
    cy += lineHeight
    doc.setTextColor(100)
    doc.text(createdText, margin + cardPadding, cy)
    cy += lineHeight
    doc.setTextColor(0)
    const left = margin + cardPadding
    doc.text(`Customer: ${String(rec['Customer Name'])}`, left, cy); cy += lineHeight
    doc.text(`Email: ${String(rec['Customer Email'])}`, left, cy); cy += lineHeight
    doc.text(`Phone: ${String(rec['Customer Phone'])}`, left, cy); cy += lineHeight
    doc.text(`Stay: ${String(rec['Check-in'])} - ${String(rec['Check-out'])}`, left, cy); cy += lineHeight
    doc.text(`Guests: ${String(rec['Guests'])}    Total: ${String(rec['Total Amount'])}`, left, cy); cy += lineHeight
    doc.text('Billing:', left, cy); cy += lineHeight
    linesAddress.forEach((t: string) => { doc.text(t, left, cy); cy += lineHeight })
    linesCity.forEach((t: string) => { doc.text(t, left, cy); cy += lineHeight })
    linesState.forEach((t: string) => { doc.text(t, left, cy); cy += lineHeight })
    linesPostal.forEach((t: string) => { doc.text(t, left, cy); cy += lineHeight })
    linesCountry.forEach((t: string) => { doc.text(t, left, cy); cy += lineHeight })
    y += cardHeight + 10
  }
  if (shaped.length === 0) {
    doc.text('No bookings match the selected filters.', margin, y)
  } else {
    shaped.forEach(drawCard)
  }
  const name = `bookings_${new Date().toISOString().slice(0,10)}.pdf`
  doc.save(name)
}
