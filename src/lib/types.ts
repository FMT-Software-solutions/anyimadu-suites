export interface Suite {
  id: number;
  name: string;
  description: string;
  image: string;
  price: number;
  capacity: number;
  gallery: string[];
}

export interface Booking {
  id: number;
  suiteId: number;
  suiteName: string;
  customerId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  createdAt: string;
  billingAddress: {
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}

export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  dateOfBirth: string;
  totalBookings: number;
  totalSpent: number;
  lastBooking?: string;
  status: 'active' | 'inactive' | 'vip';
  joinedDate: string;
}

export interface AdminUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'super_admin' | 'manager' | 'staff';
  status: 'active' | 'inactive';
  lastLogin: string | null;
  createdAt: string;
  permissions: string[];
}