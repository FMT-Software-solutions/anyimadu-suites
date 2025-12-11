import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CustomersStats } from '@/components/admin/customers/CustomersStats';
import { CustomersFilters } from '@/components/admin/customers/CustomersFilters';
import { CustomersTable } from '@/components/admin/customers/CustomersTable';
import { useCustomers, type DerivedCustomer } from '@/lib/queries/customers';
import { useDebounce } from '@/lib/hooks';
import { supabase } from '@/lib/supabase';

export const Customers = () => {
  const { data: customersData } = useCustomers()
  const customers: DerivedCustomer[] = useMemo(() => customersData || [], [customersData])
  
  const [currentUserRole, setCurrentUserRole] = useState<string>('');
  
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
            const am: any = user.app_metadata;
            const um: any = user.user_metadata;
            const role = am?.role ?? am?.roles?.[0] ?? um?.role ?? 'user';
            setCurrentUserRole(role);
        }
    });
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [page, setPage] = useState(1)
  const perPage = 10
  const debouncedSearch = useDebounce(searchTerm, 1000)

  const filteredCustomers = useMemo(() => {
    const base = customers.filter((customer) => {
      const term = debouncedSearch.trim().toLowerCase()
      const matchesSearch =
        customer.firstName.toLowerCase().includes(term) ||
        customer.lastName.toLowerCase().includes(term) ||
        (customer.email || '').toLowerCase().includes(term) ||
        (customer.phone || '').includes(debouncedSearch)
      const matchesStatus = statusFilter === 'all' || customer.status === statusFilter
      return matchesSearch && matchesStatus
    })
    base.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
        case 'bookings':
          return b.totalBookings - a.totalBookings
        case 'spent':
          return b.totalSpent - a.totalSpent
        case 'joined':
          return new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime()
        default:
          return 0
      }
    })
    return base
  }, [customers, debouncedSearch, statusFilter, sortBy])

  const customerStats = useMemo(() => {
    const total = customers.length
    const active = customers.filter((c) => c.status === 'active').length
    const vip = customers.filter((c) => c.status === 'vip').length
    const inactive = customers.filter((c) => c.status === 'inactive').length
    const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0)
    const averageSpent = total === 0 ? 0 : Math.round(totalRevenue / total)
    const totalBookings = customers.reduce((sum, c) => sum + c.totalBookings, 0)
    return { total, active, vip, inactive, totalRevenue, averageSpent, totalBookings }
  }, [customers])

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / perPage))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * perPage
  const pageRows = filteredCustomers.slice(start, start + perPage)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">
            Manage your customer database and relationships.
          </p>
        </div>
      </div>

      <CustomersStats stats={customerStats} role={currentUserRole} />

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Customer List</CardTitle>
          <CardDescription>
            Search and filter your customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CustomersFilters
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            sortBy={sortBy}
            onSearchTermChange={setSearchTerm}
            onStatusFilterChange={setStatusFilter}
            onSortByChange={setSortBy}
          />

          {/* Customer Table */}
          <CustomersTable rows={pageRows} />

          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</div>
            <div className="space-x-2">
              <Button variant="outline" disabled={currentPage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
              <Button variant="outline" disabled={currentPage >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
