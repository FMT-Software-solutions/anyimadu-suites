import { CountrySelector } from '@/components/CountrySelector';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSuites, type SuiteWithRelations } from '@/lib/queries/suites';
import { type BookingRecord } from '@/lib/types';
import { useBookings, useCreateBooking, useUpdateBooking, checkSuiteAvailability, checkBookingOverlap, useUpdateBookingStatus } from '@/lib/queries/bookings';
import { useMemo, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CopyButton } from '@/components/CopyButton';
import { toast } from 'sonner';
import { BookedDatesList } from '@/components/admin/suites/BookedDatesList';
import { useDebounce } from '@/lib/hooks';
import { ExportBookings } from '@/components/admin/ExportBookings';
import {
  CalendarIcon,
  Calendar as CalendarIconLucide,
  DollarSign,
  Edit,
  Eye,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  TrendingUp,
  Users as UsersIcon,
  User,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
} from 'lucide-react';
type UIBooking = {
  id: string
  suiteName: string
  customerName: string
  customerEmail: string
  checkIn: string
  checkOut: string
  guests: number
  totalAmount: number
  status: BookingRecord['status']
  billingState?: string | null
  billingCountry?: string | null
  nights: number
  createdBy: string | null
  canApprove: boolean
  isOwner: boolean
}

interface BookingFormData {
  suiteId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  checkIn?: Date;
  checkOut?: Date;
  guests: string;
  billingAddress: string;
  billingCity: string;
  billingState: string;
  billingZip: string;
  billingCountry: string;
}

import { supabase } from '@/lib/supabase';
import { canAccess } from '@/lib/permissions';

export const Bookings = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'pending' | 'confirmed' | 'cancelled' | 'completed' | 'all'>('all')
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'this-week' | 'this-month' | 'last-month'>('this-month')
  const [suiteFilter, setSuiteFilter] = useState<string>('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [page, setPage] = useState(1)
  const perPage = 10
  const debouncedSearch = useDebounce(searchTerm, 1000)
  const bookingsQuery = useBookings(page, perPage, { search: debouncedSearch, status: statusFilter, dateRange: dateFilter, suiteId: suiteFilter !== 'all' ? suiteFilter : undefined })
  const { data: suites } = useSuites()
  
  const [currentUserRole, setCurrentUserRole] = useState<string>('');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
            const am: any = user.app_metadata;
            const um: any = user.user_metadata;
            const role = (am?.role ?? am?.roles?.[0] ?? um?.role ?? 'user').trim();
            setCurrentUserRole(role);
            setCurrentUserId(user.id);
        }
    });
  }, []);

  const suitesMap = useMemo(() => {
    const map = new Map<string, SuiteWithRelations>()
    ;(suites || []).forEach((s) => map.set(s.id, s))
    return map
  }, [suites])
  
  const [formData, setFormData] = useState<BookingFormData>({
    suiteId: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    guests: '2',
    billingAddress: '',
    billingCity: '',
    billingState: '',
    billingZip: '',
    billingCountry: '',
  });
  const [createError, setCreateError] = useState<string | null>(null)
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null)
  const createBooking = useCreateBooking()
  const updateBooking = useUpdateBooking()
  const updateStatus = useUpdateBookingStatus()
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)

  const uiRows: UIBooking[] = useMemo(() => {
    const rows: BookingRecord[] = (bookingsQuery.data?.rows ?? []) as BookingRecord[]

    return rows.map((b: BookingRecord) => {
      const suite = suitesMap.get(b.suite_id)
      const ci = new Date(b.check_in)
      const co = new Date(b.check_out)
      const nights = Math.max(1, Math.ceil(Math.abs(co.getTime() - ci.getTime()) / (1000 * 60 * 60 * 24)))
      
      const isOwner = b.created_by === currentUserId;
      const canEdit = canAccess(currentUserRole, 'edit_booking');
      const canApprove = canEdit && b.status === 'pending' && (currentUserRole !== 'sales_rep' || isOwner);

      return {
        id: b.id,
        suiteName: suite?.name || 'Unknown Suite',
        customerName: b.customer_name,
        customerEmail: b.customer_email,
        checkIn: b.check_in,
        checkOut: b.check_out,
        guests: b.guest_count,
        totalAmount: b.total_amount,
        status: b.status,
        billingState: b.billing_state ?? null,
        billingCountry: b.billing_country ?? null,
        nights,
        createdBy: b.created_by ?? null,
        canApprove,
        isOwner // Expose isOwner to UI for edit button logic
      }
    })
  }, [bookingsQuery.data, suitesMap, currentUserRole, currentUserId])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateNights = () => {
    if (formData.checkIn && formData.checkOut) {
      const diffTime = Math.abs(formData.checkOut.getTime() - formData.checkIn.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    return 1;
  };

  const calculateTotal = () => {
    if (!formData.suiteId) return 0
    const suite = suitesMap.get(formData.suiteId)
    if (!suite) return 0
    const nights = calculateNights()
    const subtotal = Number(suite.price) * nights
    return subtotal
  }

  const handleEditClick = (booking: UIBooking) => {
    setEditingBookingId(booking.id)
    setFormData({
      suiteId: suitesMap.get(booking.suiteName) ? booking.suiteName : (Array.from(suitesMap.values()).find(s => s.name === booking.suiteName)?.id || ''),
      // Note: booking.suiteName is actually the name, but formData.suiteId needs ID.
      // Wait, uiRows maps suiteName. I should look up ID from suiteName or better, include suiteId in uiRows.
      // Let's fix uiRows first to include suiteId.
      // Actually uiRows has suiteName. I can find ID by name.
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      customerPhone: '', // Not in UIBooking, we might need to fetch or include it in uiRows
      guests: booking.guests.toString(),
      billingAddress: '', // Not in UIBooking
      billingCity: '', // Not in UIBooking
      billingState: booking.billingState || '',
      billingZip: '', // Not in UIBooking
      billingCountry: booking.billingCountry || '',
      checkIn: new Date(booking.checkIn),
      checkOut: new Date(booking.checkOut),
    })
    
    // We need full booking details (phone, address, etc).
    // UIBooking is a subset.
    // We should get the full record from bookingsQuery.data.rows
    const fullRecord = (bookingsQuery.data?.rows ?? []).find((r: any) => r.id === booking.id) as BookingRecord | undefined
    if (fullRecord) {
        setFormData({
            suiteId: fullRecord.suite_id,
            customerName: fullRecord.customer_name,
            customerEmail: fullRecord.customer_email,
            customerPhone: fullRecord.customer_phone,
            guests: fullRecord.guest_count.toString(),
            billingAddress: fullRecord.billing_address || '',
            billingCity: fullRecord.billing_city || '',
            billingState: fullRecord.billing_state || '',
            billingZip: fullRecord.billing_zip || '',
            billingCountry: fullRecord.billing_country || '',
            checkIn: new Date(fullRecord.check_in),
            checkOut: new Date(fullRecord.check_out),
        })
    }
    
    setShowCreateDialog(true)
  }

  const handleSaveBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateError(null)
    if (!formData.suiteId || !formData.checkIn || !formData.checkOut) {
      setCreateError('Please select suite and dates.')
      return
    }
    const suite = suitesMap.get(formData.suiteId)
    const guests = parseInt(formData.guests, 10) || 1
    if (suite && guests > Number(suite.capacity)) {
      setCreateError(`Guest count exceeds suite capacity of ${suite.capacity}.`)
      return
    }

    // Availability check
    let available = false
    if (editingBookingId) {
        // Check overlap excluding current booking
        const overlap = await checkBookingOverlap(formData.suiteId, formData.checkIn, formData.checkOut, editingBookingId)
        available = !overlap
    } else {
        // Create mode
        available = await checkSuiteAvailability(formData.suiteId, formData.checkIn, formData.checkOut, guests)
    }

    if (!available) {
      setCreateError('Selected suite is not available for selected dates.')
      return
    }
    
    const total = calculateTotal()
    
    try {
        if (editingBookingId) {
            await updateBooking.mutateAsync({
                id: editingBookingId,
                suite_id: formData.suiteId,
                customer_name: formData.customerName,
                customer_email: formData.customerEmail,
                customer_phone: formData.customerPhone,
                check_in: formData.checkIn,
                check_out: formData.checkOut,
                guest_count: guests,
                total_amount: Number(total.toFixed(2)),
                billing_address: formData.billingAddress,
                billing_city: formData.billingCity,
                billing_state: formData.billingState,
                billing_zip: formData.billingZip,
                billing_country: formData.billingCountry,
            })
            toast.success('Booking updated successfully')
        } else {
            await createBooking.mutateAsync({
                suite_id: formData.suiteId,
                customer_name: formData.customerName,
                customer_email: formData.customerEmail,
                customer_phone: formData.customerPhone,
                check_in: formData.checkIn,
                check_out: formData.checkOut,
                guest_count: guests,
                total_amount: Number(total.toFixed(2)),
                billing_address: formData.billingAddress,
                billing_city: formData.billingCity,
                billing_state: formData.billingState,
                billing_zip: formData.billingZip,
                billing_country: formData.billingCountry,
            })
            toast.success('Booking created successfully')
        }
        setShowCreateDialog(false)
        setEditingBookingId(null)
        setFormData({
            suiteId: '',
            customerName: '',
            customerEmail: '',
            customerPhone: '',
            guests: '2',
            billingAddress: '',
            billingCity: '',
            billingState: '',
            billingZip: '',
            billingCountry: '',
        })
        bookingsQuery.refetch()
    } catch (err: any) {
        setCreateError(err.message || 'An error occurred')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
          <p className="text-muted-foreground">
            Manage all your suite bookings and reservations.
          </p>
        </div>
        <div className="flex space-x-2">
          {canAccess(currentUserRole, 'create_booking') && (
          <Dialog open={showCreateDialog} onOpenChange={(open) => {
            setShowCreateDialog(open)
            if (!open) {
                setEditingBookingId(null)
                setFormData({
                    suiteId: '',
                    customerName: '',
                    customerEmail: '',
                    customerPhone: '',
                    guests: '2',
                    billingAddress: '',
                    billingCity: '',
                    billingState: '',
                    billingZip: '',
                    billingCountry: '',
                })
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Booking
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl max-h-[95vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingBookingId ? 'Edit Booking' : 'Create New Booking'}</DialogTitle>
                <DialogDescription>
                  {editingBookingId ? 'Update booking details.' : 'Add a new booking for a customer.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSaveBooking} className="space-y-6">
                {/* Suite Selection */}
                <div className="space-y-2">
                  <Label htmlFor="suite">Suite *</Label>
                  <Select
                    value={formData.suiteId}
                    onValueChange={(value) => setFormData({ ...formData, suiteId: value })}
                  >
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder="Select a suite" />
                    </SelectTrigger>
                    <SelectContent>
                      {(suites || []).map((suite) => (
                        <SelectItem key={suite.id} value={suite.id}>
                          {suite.name} - GHS {Number(suite.price)}/night
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.suiteId ? (
                    <div className="mt-3">
                      <BookedDatesList suiteId={formData.suiteId} />
                    </div>
                  ) : null}
                </div>

                {/* Customer Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Customer Name *</Label>
                    <Input
                      id="customerName"
                      required
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerEmail">Email *</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      required
                      value={formData.customerEmail}
                      onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Phone Number *</Label>
                  <Input
                    id="customerPhone"
                    type="tel"
                    required
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    placeholder="+233 XX XXX XXXX"
                  />
                </div>

                {/* Stay Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Check-in Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !formData.checkIn && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.checkIn ? format(formData.checkIn, 'PPP') : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.checkIn}
                          onSelect={(date) => setFormData({ ...formData, checkIn: date })}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Check-out Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !formData.checkOut && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.checkOut ? format(formData.checkOut, 'PPP') : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.checkOut}
                          onSelect={(date) => setFormData({ ...formData, checkOut: date })}
                          disabled={(date) => date < (formData.checkIn || new Date())}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="guests">Number of Guests *</Label>
                    <Select
                      value={formData.guests}
                      onValueChange={(value) => setFormData({ ...formData, guests: value })}
                      disabled={!formData.suiteId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={!formData.suiteId ? "Select a suite first" : "Select guests"} />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.suiteId && suitesMap.get(formData.suiteId) ? (
                            Array.from({ length: Number(suitesMap.get(formData.suiteId)?.capacity || 0) }, (_, i) => i + 1).map((num) => (
                                <SelectItem key={num} value={num.toString()}>
                                    {num} {num === 1 ? 'Guest' : 'Guests'}
                                </SelectItem>
                            ))
                        ) : (
                            <SelectItem value="1">1 Guest</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Billing Address */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Billing Address</h3>
                  <div className="space-y-2">
                    <Label htmlFor="billingAddress">Street Address *</Label>
                    <Input
                      id="billingAddress"
                      required
                      value={formData.billingAddress}
                      onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
                      placeholder="123 Main Street"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="billingCity">City *</Label>
                      <Input
                        id="billingCity"
                        required
                        value={formData.billingCity}
                        onChange={(e) => setFormData({ ...formData, billingCity: e.target.value })}
                        placeholder="Accra"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="billingState">State/Region *</Label>
                      <Input
                        id="billingState"
                        required
                        value={formData.billingState}
                        onChange={(e) => setFormData({ ...formData, billingState: e.target.value })}
                        placeholder="Greater Accra"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="billingZip">Postal Code</Label>
                      <Input
                        id="billingZip"
                        value={formData.billingZip}
                        onChange={(e) => setFormData({ ...formData, billingZip: e.target.value })}
                        placeholder="00233"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="billingCountry">Country *</Label>
                      <CountrySelector
                        value={formData.billingCountry}
                        onValueChange={(value) => setFormData({ ...formData, billingCountry: value })}
                      />
                    </div>
                  </div>
                </div>

                {createError ? (
                  <div className="text-red-600 text-sm">{createError}</div>
                ) : null}
                {/* Booking Summary */}
                {formData.suiteId && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Booking Summary</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Nights:</span>
                        <span>{calculateNights()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rate per night:</span>
                        <span>GHS {suitesMap.get(formData.suiteId)?.price}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>GHS {calculateTotal().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-semibold border-t pt-1">
                        <span>Total:</span>
                        <span>GHS {calculateTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">{editingBookingId ? 'Update Booking' : 'Create Booking'}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <CalendarIconLucide className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{((bookingsQuery.data as { rows: BookingRecord[]; count: number } | undefined)?.count ?? 0)}</div>
            <p className="text-xs text-muted-foreground">All time bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uiRows.filter((b) => b.status === 'confirmed').length}</div>
            <p className="text-xs text-muted-foreground">Confirmed bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uiRows.filter((b) => b.status === 'pending').length}</div>
            <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
          </CardContent>
        </Card>

        {canAccess(currentUserRole, 'view_revenue') && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GHS {uiRows.reduce((sum, b) => sum + b.totalAmount, 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total revenue</p>
          </CardContent>
        </Card>
        )}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Bookings</CardTitle>
          <CardDescription>
            Manage and view all bookings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as any)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="this-week">This Week</SelectItem>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
              </SelectContent>
            </Select>
            <Select value={suiteFilter} onValueChange={(v) => setSuiteFilter(v)}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by suite" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Suites</SelectItem>
                {(suites || []).map((suite) => (
                  <SelectItem key={suite.id} value={suite.id}>
                    {suite.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ExportBookings filters={{ search: debouncedSearch, status: statusFilter, dateRange: dateFilter, suiteId: suiteFilter !== 'all' ? suiteFilter : undefined }} />
            {canAccess(currentUserRole, 'create_booking') && (
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Booking
            </Button>
            )}
          </div>

          {/* Bookings Table */}
          <div className="space-y-4">
            {uiRows.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="font-medium">{booking.customerName}</p>
                      <p className="text-sm text-muted-foreground">{booking.customerEmail}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{booking.suiteName}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(booking.checkIn), 'MMM dd, yyyy')} - {format(new Date(booking.checkOut), 'MMM dd, yyyy')} · {booking.nights} {booking.nights === 1 ? 'night' : 'nights'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {booking.billingState || '-'}, {booking.billingCountry || '-'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">GHS {booking.totalAmount.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">{booking.guests} guests</p>
                  </div>
                  <Badge className={getStatusColor(booking.status)}>
                    {booking.status}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setSelectedBookingId(booking.id); setShowDetailsDialog(true) }}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      {/* Edit Booking Details */}
                      {(currentUserRole === 'admin' || currentUserRole === 'super_admin' || (canAccess(currentUserRole, 'edit_booking') && booking.isOwner)) && (
                        <DropdownMenuItem onClick={() => handleEditClick(booking)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Details
                        </DropdownMenuItem>
                      )}

                      {/* Approve Booking (Status) */}
                      {booking.canApprove && (
                      <DropdownMenuItem onClick={() => updateStatus.mutate({ id: booking.id, status: 'confirmed' }, { onSuccess: () => { toast.success('Booking approved'); bookingsQuery.refetch() } })}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve Booking
                      </DropdownMenuItem>
                      )}
                      
                      {canAccess(currentUserRole, 'cancel_booking') && (
                      <DropdownMenuItem className="text-red-600" onClick={() => updateStatus.mutate({ id: booking.id, status: 'cancelled' }, { onSuccess: () => { toast.success('Booking cancelled'); bookingsQuery.refetch() } })}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Cancel Booking
                      </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-muted-foreground">
                Page {page} of {Math.max(1, Math.ceil((((bookingsQuery.data as { rows: BookingRecord[]; count: number } | undefined)?.count || 0) / perPage)))}
              </div>
              <div className="space-x-2">
                <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
                <Button variant="outline" disabled={page >= Math.max(1, Math.ceil((((bookingsQuery.data as { rows: BookingRecord[]; count: number } | undefined)?.count || 0) / perPage)))} onClick={() => setPage((p) => p + 1)}>Next</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              Full booking information
            </DialogDescription>
          </DialogHeader>
          {(() => {
            const rec = (bookingsQuery.data?.rows || []).find((b: any) => b.id === selectedBookingId) as BookingRecord | undefined
            if (!rec) return null
            const suite = suitesMap.get(rec.suite_id)
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between"><span>Status</span><span>{rec.status}</span></div>
                    <div className="flex justify-between"><span>Suite</span><span>{suite?.name || rec.suite_id}</span></div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><User className="h-4 w-4" /> Guest</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between"><span>Name</span><span className="flex items-center gap-2">{rec.customer_name}</span></div>
                    <div className="flex justify-between"><span className="flex items-center gap-2"><Mail className="h-4 w-4" /> Email</span><span className="flex items-center gap-2">{rec.customer_email}<CopyButton text={rec.customer_email} /></span></div>
                    <div className="flex justify-between"><span className="flex items-center gap-2"><Phone className="h-4 w-4" /> Phone</span><span className="flex items-center gap-2">{rec.customer_phone}<CopyButton text={rec.customer_phone} /></span></div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><CalendarIconLucide className="h-4 w-4" /> Stay</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between"><span>Check-in</span><span>{format(new Date(rec.check_in), 'MMM dd, yyyy')}</span></div>
                    <div className="flex justify-between"><span>Check-out</span><span>{format(new Date(rec.check_out), 'MMM dd, yyyy')}</span></div>
                    <div className="flex justify-between"><span>Guests</span><span>{rec.guest_count}</span></div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Billing</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between"><span>Address</span><span>{rec.billing_address || '-'}</span></div>
                    <div className="flex justify-between"><span>City</span><span>{rec.billing_city || '-'}</span></div>
                    <div className="flex justify-between"><span>Region</span><span>{rec.billing_state || '-'}</span></div>
                    <div className="flex justify-between"><span>Postal Code</span><span>{rec.billing_zip || '-'}</span></div>
                    <div className="flex justify-between"><span>Country</span><span>{rec.billing_country || '-'}</span></div>
                  </CardContent>
                </Card>
                <Card className="md:col-span-2">
                  
                  <CardContent className="flex items-center justify-between text-lg font-bold">
                    <span className=''>Total Amount</span>
                    <span>GHS {rec.total_amount.toFixed(2)}</span>
                  </CardContent>
                </Card>
                {rec.status === 'pending' && canAccess(currentUserRole, 'edit_booking') && (currentUserRole !== 'sales_rep' || rec.created_by === currentUserId) ? (
                  <div className="md:col-span-2 flex justify-end">
                    <Button onClick={() => updateStatus.mutate({ id: rec.id, status: 'confirmed' }, { onSuccess: () => { toast.success('Booking approved'); setShowDetailsDialog(false); bookingsQuery.refetch() } })}>
                      Approve Booking
                    </Button>
                  </div>
                ) : null}
              </div>
            )
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};
