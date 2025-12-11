import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { supabase } from '@/lib/supabase';
import { type User as SupabaseUser } from '@supabase/supabase-js';
import {
  Building2,
  Calendar,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  User,
  UserCog,
  Users
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { canAccess } from '@/lib/permissions';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navigation = [
  { name: 'Dashboard', key: 'dashboard', icon: LayoutDashboard },
  { name: 'Bookings', key: 'bookings', icon: Calendar },
  { name: 'Suites', key: 'suites', icon: Building2 },
  { name: 'Customers', key: 'customers', icon: Users },
  { name: 'Amenities', key: 'amenities', icon: ListChecks },
  { name: 'Users', key: 'users', icon: UserCog },
  { name: 'Profile', key: 'profile', icon: User },
];

export const AdminLayout = ({
  children,
  activeTab,
  onTabChange,
}: AdminLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const isActive = (key: string) => {
    return activeTab === key;
  };

  const getRole = () => {
    if (!user) return 'user';
    const am: any = user.app_metadata;
    const um: any = user.user_metadata;
    return am?.role ?? am?.roles?.[0] ?? um?.role ?? 'user';
  };

  const role = getRole();

  const filteredNavigation = navigation.filter(item => {
    if (item.key === 'users') {
      return role === 'admin' || role === 'super_admin';
    }
    if (item.key === 'suites') {
      return canAccess(role, 'view_suites');
    }
    if (item.key === 'amenities') {
      return canAccess(role, 'view_amenities');
    }
    if (item.key === 'customers') {
      return canAccess(role, 'view_customers');
    }
    return true;
  });

  const getInitials = () => {
    if (!user) return 'AD';
    const meta = user.user_metadata;
    if (meta?.firstName && meta?.lastName) {
      return `${meta.firstName.charAt(0)}${meta.lastName.charAt(
        0
      )}`.toUpperCase();
    }
    if (meta?.name) {
      return meta.name.charAt(0).toUpperCase();
    }
    return user.email?.charAt(0).toUpperCase() || 'AD';
  };

  const getDisplayName = () => {
    if (!user) return 'Admin User';
    const meta = user.user_metadata;
    if (meta?.firstName && meta?.lastName) {
      return `${meta.firstName} ${meta.lastName}`;
    }
    return meta?.name || user.email?.split('@')[0] || 'Admin User';
  };

  const getAvatarUrl = () => {
    return (
      user?.user_metadata?.avatar ||
      user?.user_metadata?.avatar_url ||
      '/placeholder-avatar.jpg'
    );
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <div className="flex items-center space-x-2">
          <Building2 className="h-8 w-8 text-primary" />
          <div className="-space-y-1 items-center gap-2">
            <p className="text-base font-bold">Admin</p>
            <span className="text-sm">Anyimadu Suites</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-4">
        {filteredNavigation.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.name}
              onClick={() => {
                onTabChange(item.key);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive(item.key)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </button>
          );
        })}
      </nav>

      {/* User info at bottom */}
      <div className="border-t p-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={getAvatarUrl()} className="object-cover" />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{getDisplayName()}</p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email || 'admin@anyimadusuites.com'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:border-r lg:bg-card">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex flex-1 flex-col lg:pl-64">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b bg-card px-4 lg:px-6">
          <div className="flex items-center space-x-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
            </Sheet>

            <div>
              <h1 className="text-lg font-semibold">
                {navigation.find((nav) => isActive(nav.key))?.name ||
                  'Admin Panel'}
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notifications */}
            {/* <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                3
              </Badge>
            </Button> */}

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={getAvatarUrl()}
                      className="object-cover"
                    />
                    <AvatarFallback>{getInitials()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {getDisplayName()}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onTabChange('profile')}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => {
                    await supabase.auth.signOut();
                    navigate('/admin/login', { replace: true });
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
};
