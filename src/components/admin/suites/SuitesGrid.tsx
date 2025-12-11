import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Image as ImageIcon,
  Users as UsersIcon,
} from 'lucide-react';
import type { SuiteWithRelations } from '@/lib/queries/suites';
import { canAccess } from '@/lib/permissions';
import { supabase } from '@/lib/supabase';

interface Props {
  suites: SuiteWithRelations[];
  onView: (suite: SuiteWithRelations) => void;
  onEdit: (suite: SuiteWithRelations) => void;
  onDelete: (id: string) => void;
}

export const SuitesGrid: React.FC<Props> = ({
  suites,
  onView,
  onEdit,
  onDelete,
}) => {
  const [currentUserRole, setCurrentUserRole] = useState<string>('');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
            setCurrentUserId(user.id);
            const am: any = user.app_metadata;
            const um: any = user.user_metadata;
            const role = am?.role ?? am?.roles?.[0] ?? um?.role ?? 'user';
            setCurrentUserRole(role);
        }
    });
  }, []);

  const canEdit = (suite: SuiteWithRelations) => {
    if (canAccess(currentUserRole, 'edit_suite')) {
        // Editors can only edit their own data
        if (currentUserRole === 'editor' || currentUserRole === 'sales_rep') {
            return suite.created_by === currentUserId;
        }
        return true; // Admin/Super Admin
    }
    return false;
  };

  const canDelete = (_suite: SuiteWithRelations) => {
    // "Editors and roles below cannot delete suites. Only admins can delete suites."
    // So only admin/super_admin can delete suites.
    if (currentUserRole === 'admin' || currentUserRole === 'super_admin') return true;
    return false;
  };

  return (
    <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
      {suites.map((suite) => (
        <Card key={suite.id} className="overflow-hidden pt-0">
          <div className="relative">
            <img
              src={suite.main_image_url ?? ''}
              alt={suite.name}
              className="w-full h-[200px] object-cover"
            />
            <div className="absolute top-2 right-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onView(suite)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                  {canEdit(suite) && (
                  <DropdownMenuItem onClick={() => onEdit(suite)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Suite
                  </DropdownMenuItem>
                  )}
                  {canDelete(suite) && (
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => onDelete(suite.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Suite
                  </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Badge className="absolute bottom-2 left-2">
              GHS {Number(suite.price)}/night
            </Badge>
          </div>
          <CardHeader>
            <CardTitle className="text-lg">{suite.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center">
                <UsersIcon className="mr-1 h-4 w-4" />
                Up to {suite.capacity} guests
              </div>
              <div className="flex items-center">
                <ImageIcon className="mr-1 h-4 w-4" />
                {suite.gallery_urls.length} photos
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
