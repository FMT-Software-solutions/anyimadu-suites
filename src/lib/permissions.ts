
export type Role = 'admin' | 'editor' | 'sales_rep' | 'read_only' | 'super_admin';

export const ROLES: Record<string, { label: string; description: string }> = {
  admin: {
    label: 'Admin',
    description: 'Full access to all resources and settings.',
  },
  editor: {
    label: 'Editor',
    description: 'Can manage most content. Can only edit/delete items they created.',
  },
  sales_rep: {
    label: 'Sales Rep',
    description: 'Access to Dashboard, Bookings, Customers. Can create/edit own items.',
  },
  read_only: {
    label: 'Read Only',
    description: 'View-only access to Dashboard, Bookings, Customers.',
  },
  // Super admin is internal, not usually selectable unless by another super admin (handled specially)
  super_admin: {
    label: 'Super Admin',
    description: 'Full system access.',
  }
};

export const PERMISSIONS = {
  view_users: ['super_admin', 'admin'],
  view_suites: ['super_admin', 'admin', 'editor'], // Sales Rep / Read Only cannot see Suites grid? "Sales Rep can only view Suites section" vs "Sales rep can have access to only dashboard, bookings, customers". User said "Sales rep can have access to only dashboard, bookings, customers and their profile". So no suites.
  view_amenities: ['super_admin', 'admin', 'editor'],
  view_customers: ['super_admin', 'admin', 'editor', 'sales_rep', 'read_only'], // Read only cannot see customers.
  
  create_booking: ['super_admin', 'admin', 'editor', 'sales_rep'],
  edit_booking: ['super_admin', 'admin', 'editor', 'sales_rep'], // Logic for "own" is handled in component
  delete_booking: ['super_admin', 'admin', 'editor', 'sales_rep'], // Logic for "own" is handled in component
  cancel_booking: ['super_admin', 'admin'],

  create_suite: ['super_admin', 'admin', 'editor'],
  edit_suite: ['super_admin', 'admin', 'editor'],
  delete_suite: ['super_admin', 'admin'], // "Editors... cannot delete suites"
  
  create_amenity: ['super_admin', 'admin', 'editor'],
  edit_amenity: ['super_admin', 'admin', 'editor'],
  delete_amenity: ['super_admin', 'admin'],
  
  view_revenue: ['super_admin', 'admin', 'editor', 'sales_rep'],
};

export const canAccess = (role: string, resource: keyof typeof PERMISSIONS) => {
  return PERMISSIONS[resource]?.includes(role);
};
