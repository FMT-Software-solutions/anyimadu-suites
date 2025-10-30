import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Building2,
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  Plus,
} from 'lucide-react';
import { allSuites } from '@/lib/constants';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';

// Mock data for dashboard stats
const dashboardStats = {
  totalSuites: allSuites.length,
  totalBookings: 156,
  totalCustomers: 89,
  totalRevenue: 45600,
  monthlyBookings: 23,
  monthlyRevenue: 8900,
  occupancyRate: 78,
  averageBookingValue: 292,
};

const recentBookings = [
  {
    id: 1,
    customerName: 'John Doe',
    suiteName: 'Royal Paradise Suite',
    checkIn: '2024-01-15',
    checkOut: '2024-01-18',
    amount: 1350,
    status: 'confirmed' as const,
  },
  {
    id: 2,
    customerName: 'Jane Smith',
    suiteName: 'Garden View Suite',
    checkIn: '2024-01-16',
    checkOut: '2024-01-19',
    amount: 960,
    status: 'pending' as const,
  },
  {
    id: 3,
    customerName: 'Mike Johnson',
    suiteName: 'Executive Suite',
    checkIn: '2024-01-17',
    checkOut: '2024-01-20',
    amount: 1140,
    status: 'confirmed' as const,
  },
];

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
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your suites.
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Eye className="mr-2 h-4 w-4" />
            View Reports
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Booking
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Suites"
          value={dashboardStats.totalSuites}
          description="Available suites"
          icon={Building2}
        />
        <StatCard
          title="Total Bookings"
          value={dashboardStats.totalBookings}
          description="This month: +23"
          icon={Calendar}
          trend="up"
          trendValue="+12%"
        />
        <StatCard
          title="Total Customers"
          value={dashboardStats.totalCustomers}
          description="Active customers"
          icon={Users}
          trend="up"
          trendValue="+8%"
        />
        <StatCard
          title="Total Revenue"
          value={`GHS ${dashboardStats.totalRevenue.toLocaleString()}`}
          description="This month: GHS 8,900"
          icon={DollarSign}
          trend="up"
          trendValue="+15%"
        />
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Occupancy Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardStats.occupancyRate}%
            </div>
            <div className="w-full bg-secondary rounded-full h-2 mt-2">
              <div
                className="bg-primary h-2 rounded-full"
                style={{ width: `${dashboardStats.occupancyRate}%` }}
              ></div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Above average for this time of year
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Average Booking Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              GHS {dashboardStats.averageBookingValue}
            </div>
            <p className="text-xs text-muted-foreground">
              Per booking this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Popular Suite</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">Royal Paradise Suite</div>
            <p className="text-xs text-muted-foreground">
              Most booked this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
          <CardDescription>Latest bookings from your customers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 w-full overflow-x-auto">
            <ScrollArea>
              {recentBookings.map((booking) => (
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
            <Button variant="outline">View All Bookings</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
