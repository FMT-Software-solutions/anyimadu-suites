import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { DerivedCustomer } from '@/lib/queries/customers';
import { Mail, MapPin, Phone } from 'lucide-react';
import React from 'react';

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return <Badge variant="default">Active</Badge>;
    case 'vip':
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">VIP</Badge>;
    case 'inactive':
      return <Badge variant="secondary">Inactive</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getInitials = (firstName: string, lastName: string) => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const CustomersTable: React.FC<{ rows: DerivedCustomer[] }> = ({
  rows,
}) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Bookings</TableHead>
            <TableHead>Total Spent</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Booking</TableHead>
            {/* <TableHead className="w-[50px]"></TableHead> */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell>
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-xs">
                      {getInitials(customer.firstName, customer.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {customer.firstName} {customer.lastName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Joined {formatDate(customer.joinedDate)}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="flex items-center text-sm">
                    <Mail className="mr-1 h-3 w-3" />
                    {customer.email || '-'}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Phone className="mr-1 h-3 w-3" />
                    {customer.phone || '-'}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center text-sm">
                  <MapPin className="mr-1 h-3 w-3" />
                  {customer.city || '-'}, {customer.country || '-'}
                </div>
              </TableCell>
              <TableCell>
                <div className="font-medium">{customer.totalBookings}</div>
              </TableCell>
              <TableCell>
                <div className="font-medium">
                  GHS {customer.totalSpent.toLocaleString()}
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(customer.status)}</TableCell>
              <TableCell>
                <div className="text-sm">
                  {customer.lastBooking
                    ? formatDate(customer.lastBooking)
                    : 'Never'}
                </div>
              </TableCell>
              {/* <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      View Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Customer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell> */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {rows.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No customers found matching your criteria.
        </div>
      )}
    </div>
  );
};
