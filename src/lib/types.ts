import type { LucideIcon } from 'lucide-react';

export interface Amenity {
  icon: LucideIcon;
  label: string;
}

export interface Suite {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  capacity: number;
  gallery: string[];
  amenities: Amenity[];
}

export interface Booking {
  id: string;
  suiteId: string;
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

export interface SuiteRecord {
  id: string;
  name: string;
  description: string;
  price: number;
  capacity: number;
  main_image_url: string | null;
  gallery_urls: string[];
  created_at: string;
  updated_at: string | null;
}

export interface AmenityRecord {
  id: number;
  name: string;
  icon_key: string | null;
  created_at: string;
  created_by?: string | null;
}

export interface SuiteAmenityRecord {
  id: number;
  suite_id: string;
  amenity_id: number;
}

// SuiteImageRecord removed in favor of array of URLs on suites

export interface BookingRecord {
  id: string;
  suite_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  check_in: string; // YYYY-MM-DD
  check_out: string; // YYYY-MM-DD
  guest_count: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
  updated_at: string | null;
  billing_address?: string | null;
  billing_city?: string | null;
  billing_state?: string | null;
  billing_zip?: string | null;
  billing_country?: string | null;
  created_by?: string | null;
}
