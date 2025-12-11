import { useState, useEffect, useMemo } from 'react';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser, type User } from '@/lib/queries/users';
import { UsersStats } from './users/UsersStats';
import { UsersFilters } from './users/UsersFilters';
import { UsersTable } from './users/UsersTable';
import { UserDialog } from './users/UserDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { DeleteConfirmDialog } from './suites/DeleteConfirmDialog';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDebounce } from '@/lib/hooks';

export const Users = () => {
  const { data: usersData, isLoading, error } = useUsers();
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const perPage = 10;
  
  const debouncedSearch = useDebounce(search, 500);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  
  const [currentUserRole, setCurrentUserRole] = useState<string>('');
  const [currentUserId, setCurrentUserId] = useState<string>('');

  useEffect(() => {
    const getRole = async () => {
       const { data: { user } } = await supabase.auth.getUser();
       if (user) {
           setCurrentUserId(user.id);
           const am: any = user.app_metadata;
           const um: any = user.user_metadata;
           const role = am?.role ?? am?.roles?.[0] ?? um?.role ?? 'user';
           setCurrentUserRole(role);
       }
    };
    getRole();
  }, []);

  const users: User[] = useMemo(() => usersData || [], [usersData]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        (user.firstName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
         user.lastName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
         user.email.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
         (user.phone || '').includes(debouncedSearch));
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      return matchesSearch && matchesRole;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Default sort by newest
  }, [users, debouncedSearch, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * perPage;
  const pageRows = filteredUsers.slice(start, start + perPage);

  const handleCreateUser = () => {
    setSelectedUser(undefined);
    setIsDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const handleUserSubmit = async (data: any) => {
    try {
      if (selectedUser) {
        await updateUserMutation.mutateAsync({ id: selectedUser.id, ...data });
        toast.success('User updated successfully');
      } else {
        await createUserMutation.mutateAsync(data);
        toast.success('User created successfully');
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast.error((error as Error).message);
      // Do not re-throw if we want to keep dialog open on error? 
      // Usually better to catch and show error, but here we might want to keep dialog open if it failed.
      // But for now, just logging error via toast.
    }
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await deleteUserMutation.mutateAsync(userToDelete.id);
      toast.success('User deleted successfully');
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  if (isLoading) return <div>Loading users...</div>;
  if (error) return <div>Error loading users: {(error as Error).message}</div>;

  if (currentUserRole && currentUserRole !== 'admin' && currentUserRole !== 'super_admin') {
      return (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center">
            <h2 className="text-2xl font-bold tracking-tight">Access Denied</h2>
            <p className="text-muted-foreground mt-2">You do not have permission to view this page.</p>
        </div>
      )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage system users and their roles.
          </p>
        </div>
        <Button onClick={handleCreateUser}>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <UsersStats users={users} />

      <Card>
        <CardHeader>
          <CardTitle>User List</CardTitle>
          <CardDescription>
            Manage and view all users in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <UsersFilters
                search={search}
                onSearchChange={setSearch}
                roleFilter={roleFilter}
                onRoleFilterChange={setRoleFilter}
            />
            
            <div className="mt-4">
                <UsersTable 
                    rows={pageRows} 
                    onEdit={handleEditUser} 
                    onDelete={handleDeleteClick}
                    currentUserRole={currentUserRole}
                    currentUserId={currentUserId}
                />
            </div>

            <div className="flex items-center justify-between pt-4">
               <div className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</div>
               <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
               </div>
            </div>
        </CardContent>
      </Card>

      <UserDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        user={selectedUser}
        onSubmit={handleUserSubmit}
        currentUserRole={currentUserRole}
        currentUserId={currentUserId}
      />

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete User"
        description={`Are you sure you want to delete ${userToDelete?.firstName} ${userToDelete?.lastName}? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};
