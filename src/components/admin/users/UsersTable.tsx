import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MoreHorizontal, Pencil, Trash2, Shield, ShieldAlert, User as UserIcon, Eye } from 'lucide-react';
import React from 'react';
import { type User } from '@/lib/queries/users';

interface UsersTableProps {
  rows: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  currentUserRole: string;
  currentUserId: string;
}

const getRoleBadge = (role: string) => {
  switch (role) {
    case 'super_admin':
      return <Badge className="bg-red-500 hover:bg-red-600"><ShieldAlert className="w-3 h-3 mr-1" /> Super Admin</Badge>;
    case 'admin':
      return <Badge className="bg-blue-500 hover:bg-blue-600"><Shield className="w-3 h-3 mr-1" /> Admin</Badge>;
    case 'editor':
      return <Badge variant="secondary" className="bg-orange-500 text-white hover:bg-orange-600"><Pencil className="w-3 h-3 mr-1" /> Editor</Badge>;
    case 'sales_rep':
      return <Badge variant="secondary" className="bg-green-500 text-white hover:bg-green-600"><UserIcon className="w-3 h-3 mr-1" /> Sales Rep</Badge>;
    case 'read_only':
      return <Badge variant="outline"><Eye className="w-3 h-3 mr-1" /> Read Only</Badge>;
    default:
      return <Badge variant="secondary"><UserIcon className="w-3 h-3 mr-1" /> {role}</Badge>;
  }
};

const getInitials = (firstName: string, lastName: string) => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

const formatDate = (dateString?: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const UsersTable: React.FC<UsersTableProps> = ({
  rows,
  onEdit,
  onDelete,
  currentUserRole,
  currentUserId
}) => {
  const canEdit = (user: User) => {
    // Super admin can edit anyone except other super admins
    if (currentUserRole === 'super_admin') return user.role !== 'super_admin';
    
    // No one else can edit super admin
    if (user.role === 'super_admin') return false;

    if (currentUserRole === 'admin') {
      // Admin can edit themselves
      if (user.id === currentUserId) return true;
      // Admin cannot edit other admins or super admins
      return user.role !== 'admin';
    }
    return false;
  };

  const canDelete = (user: User) => {
    if (currentUserRole === 'super_admin') return user.role !== 'super_admin';
    if (currentUserRole === 'admin') {
        // Admin cannot delete themselves or other admins
        if (user.role === 'admin') return false;
        if (user.role === 'super_admin') return false;
        return true;
    }
    return false;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Last Sign In</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback className="text-xs">
                      {getInitials(user.firstName || '', user.lastName || '')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {user.email}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {getRoleBadge(user.role)}
              </TableCell>
              <TableCell>
                <div className="text-sm">
                   {user.phone || '-'}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm text-muted-foreground">
                  {formatDate(user.createdAt)}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm text-muted-foreground">
                  {formatDate(user.lastSignIn)}
                </div>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                        onClick={() => onEdit(user)}
                        disabled={!canEdit(user)}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => onDelete(user)}
                        disabled={!canDelete(user)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
