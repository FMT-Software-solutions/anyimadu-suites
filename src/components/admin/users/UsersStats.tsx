import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type User } from '@/lib/queries/users';
import { Users, UserCheck, ShieldAlert, UserCog } from 'lucide-react';

interface UsersStatsProps {
  users: User[];
}

export const UsersStats = ({ users }: UsersStatsProps) => {
  const total = users.length;
  // Naive active check: not banned. Could also check lastSignIn within 30 days.
  const active = users.filter(u => !u.bannedUntil).length;
  const admins = users.filter(u => u.role === 'admin' || u.role === 'super_admin').length;
  const staff = users.filter(u => u.role !== 'admin' && u.role !== 'super_admin').length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{total}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{active}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Admins</CardTitle>
          <ShieldAlert className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{admins}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Staff</CardTitle>
          <UserCog className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{staff}</div>
        </CardContent>
      </Card>
    </div>
  );
};
