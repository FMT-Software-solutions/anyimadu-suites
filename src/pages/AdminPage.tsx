import { useEffect, useState } from 'react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { Dashboard } from '@/components/admin/Dashboard';
import { Bookings } from '@/components/admin/Bookings';
import { Suites } from '@/components/admin/Suites';
import { Customers } from '@/components/admin/Customers';
import { Users } from '@/components/admin/Users';
import { Amenities } from '@/components/admin/Amenities';
import { Profile } from '@/components/admin/Profile';
import { useSearchParams } from 'react-router-dom';

export const AdminPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const tab = searchParams.get('tab') || 'dashboard';
    setActiveTab(tab);
  }, [searchParams]);

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
      case 'amenities':
        return <Amenities />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AdminLayout
      activeTab={activeTab}
      onTabChange={(tab) => setSearchParams({ tab })}
    >
      {renderContent()}
    </AdminLayout>
  );
};
