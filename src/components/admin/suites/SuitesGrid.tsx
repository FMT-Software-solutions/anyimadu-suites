import React from 'react';
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
                  <DropdownMenuItem onClick={() => onEdit(suite)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Suite
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => onDelete(suite.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Suite
                  </DropdownMenuItem>
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
