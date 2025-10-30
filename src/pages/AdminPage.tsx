import { useState } from 'react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { Dashboard } from '@/components/admin/Dashboard';
import { Bookings } from '@/components/admin/Bookings';
import { Suites } from '@/components/admin/Suites';
import { Customers } from '@/components/admin/Customers';
import { Users } from '@/components/admin/Users';
import { Profile } from '@/components/admin/Profile';

export const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'bookings':
        return <Bookings />;
      case 'suites':
        return <Suites />;
      case 'customers':
        return <Customers />;
      case 'users':
        return <Users />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </AdminLayout>
  );
};
