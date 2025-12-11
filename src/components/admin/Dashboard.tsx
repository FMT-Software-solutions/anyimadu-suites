import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Building2,
  Calendar,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import React, { useMemo, useState, useEffect } from 'react';
import { canAccess } from '@/lib/permissions';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import { useSuites } from '@/lib/queries/suites';
import { useCustomers } from '@/lib/queries/customers';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { BookingRecord } from '@/lib/types';
import { useNavigate } from 'react-router-dom';

const StatCard = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendValue,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
  trend?: 'up' | 'down';
  trendValue?: string;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
        <span>{description}</span>
        {trend && trendValue && (
          <div
            className={`flex items-center ${
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {trend === 'up' ? (
              <TrendingUp className="h-3 w-3 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1" />
            )}
            <span>{trendValue}</span>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

export const Dashboard = () => {
  const navigate = useNavigate();
  const { data: suites } = useSuites();

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

  const suitesList = suites || [];
  const suitesMap = useMemo(() => {
    const m = new Map<string, string>();
    suitesList.forEach((s) => m.set(s.id, s.name));
    return m;
  }, [suitesList]);
  const { data: customers } = useCustomers();
  const { data: bookingsData } = useQuery({
    queryKey: ['dashboard-bookings'],
    queryFn: async () => {
      const { data, count, error } = await supabase
        .from('bookings')
        .select(
          'id,suite_id,customer_name,customer_email,check_in,check_out,guest_count,total_amount,status,created_at,billing_state,billing_country',
          { count: 'exact' }
        )
        .order('created_at', { ascending: false })
        .limit(10000);
      if (error) throw error;
      return {
        rows: (data || []) as BookingRecord[],
        count: count || (data || []).length,
      };
    },
    staleTime: 60 * 1000,
  });

  const stats = useMemo(() => {
    const rows = bookingsData?.rows || [];
    const totalBookings = bookingsData?.count || rows.length;
    const totalRevenue = rows
      .filter((b) => b.status !== 'cancelled')
      .reduce((sum, b) => sum + Number(b.total_amount || 0), 0);
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const inMonth = rows.filter((b) => {
      const created = new Date(b.created_at);
      return created >= start && created < end;
    });
    const monthlyBookings = inMonth.length;
    const monthlyRevenue = inMonth
      .filter((b) => b.status !== 'cancelled')
      .reduce((sum, b) => sum + Number(b.total_amount || 0), 0);
    const daysInMonth = Math.round(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    const bookedNights = rows.reduce((acc, b) => {
      const ci = new Date(`${b.check_in}T00:00:00`);
      const co = new Date(`${b.check_out}T00:00:00`);
      const s = ci > start ? ci : start;
      const e = co < end ? co : end;
      const d = Math.max(
        0,
        Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24))
      );
      return acc + d;
    }, 0);
    const capacityDays = (suitesList.length || 1) * daysInMonth;
    const occupancyRate = capacityDays
      ? Math.min(100, Math.round((bookedNights / capacityDays) * 100))
      : 0;
    const averageBookingValue = monthlyBookings
      ? Math.round(monthlyRevenue / monthlyBookings)
      : 0;
    const popularCount = new Map<string, number>();
    inMonth.forEach((b) => {
      const c = popularCount.get(b.suite_id) || 0;
      popularCount.set(b.suite_id, c + 1);
    });
    let popularSuiteName = '—';
    let max = 0;
    popularCount.forEach((v, k) => {
      if (v > max) {
        max = v;
        popularSuiteName = suitesMap.get(k) || 'Unknown Suite';
      }
    });
    return {
      totalSuites: suitesList.length,
      totalBookings,
      totalCustomers: (customers || []).length,
      totalRevenue,
      monthlyBookings,
      monthlyRevenue,
      occupancyRate,
      averageBookingValue,
      popularSuiteName,
    };
  }, [bookingsData, suitesList, suitesMap, customers]);

  const recent = useMemo(() => {
    const rows = bookingsData?.rows || [];
    const items = rows.slice(0, 5).map((b) => ({
      id: b.id,
      customerName: b.customer_name,
      suiteName: suitesMap.get(b.suite_id) || 'Unknown Suite',
      checkIn: b.check_in,
      checkOut: b.check_out,
      amount: Number(b.total_amount || 0),
      status: b.status,
    }));
    return items;
  }, [bookingsData, suitesMap]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your suites.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Suites"
          value={stats.totalSuites}
          description="Available suites"
          icon={Building2}
        />
        <StatCard
          title="Total Bookings"
          value={stats.totalBookings}
          description={`This month: +${stats.monthlyBookings}`}
          icon={Calendar}
          trend="up"
          trendValue={`+${stats.monthlyBookings}`}
        />
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers}
          description="Active customers"
          icon={Users}
        />
        {canAccess(currentUserRole, 'view_revenue') && (
          <StatCard
            title="Total Revenue"
            value={`GHS ${stats.totalRevenue.toLocaleString()}`}
            description={`This month: GHS ${stats.monthlyRevenue.toLocaleString()}`}
            icon={DollarSign}
          />
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Occupancy Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.occupancyRate}%</div>
            <div className="w-full bg-secondary rounded-full h-2 mt-2">
              <div
                className="bg-primary h-2 rounded-full"
                style={{ width: `${stats.occupancyRate}%` }}
              ></div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Above average for this time of year
            </p>
          </CardContent>
        </Card>

        {canAccess(currentUserRole, 'view_revenue') && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Average Booking Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                GHS {stats.averageBookingValue}
              </div>
              <p className="text-xs text-muted-foreground">
                Per booking this month
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Popular Suite</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">
              {stats.popularSuiteName}
            </div>
            <p className="text-xs text-muted-foreground">
              Most booked this month
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
          <CardDescription>Latest bookings from your customers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 w-full overflow-x-auto">
            <ScrollArea>
              {recent.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 border rounded-lg min-w-[500px]"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-medium">{booking.customerName}</p>
                        <p className="text-sm text-muted-foreground">
                          {booking.suiteName}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {booking.checkIn} - {booking.checkOut}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        GHS {booking.amount.toLocaleString()}
                      </p>
                    </div>
                    <Badge
                      variant={
                        booking.status === 'confirmed' ? 'default' : 'secondary'
                      }
                    >
                      {booking.status}
                    </Badge>
                  </div>
                </div>
              ))}
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              onClick={() => navigate('/admin?tab=bookings')}
            >
              View All Bookings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
