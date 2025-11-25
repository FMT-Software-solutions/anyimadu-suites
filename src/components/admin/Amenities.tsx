import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { amenityIconKeys } from '@/lib/amenityIcons';
import { AmenityIcon } from '@/components/AmenityIcon';
import {
  useAmenities,
  useCreateAmenity,
  useUpdateAmenity,
  useDeleteAmenity,
  useSeedAmenities,
} from '@/lib/queries/suites';
import { MoreHorizontal, Edit, Trash2, Plus, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DeleteConfirmDialog } from '@/components/admin/suites/DeleteConfirmDialog';

interface AmenityFormValues {
  name: string;
  icon_key: string | null;
}

export const Amenities = () => {
  const { data: amenities } = useAmenities();
  const createAmenity = useCreateAmenity();
  const updateAmenity = useUpdateAmenity();
  const deleteAmenity = useDeleteAmenity();
  const seedAmenities = useSeedAmenities();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingAmenityId, setEditingAmenityId] = useState<number | null>(null);
  const [deleteAmenityId, setDeleteAmenityId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [form, setForm] = useState<AmenityFormValues>({
    name: '',
    icon_key: null,
  });

  const stats = useMemo(() => {
    const list = amenities || [];
    return { totalAmenities: list.length };
  }, [amenities]);

  const startCreate = () => {
    setForm({ name: '', icon_key: null });
    setShowCreateDialog(true);
  };

  const startEdit = (id: number) => {
    const a = (amenities || []).find((x) => x.id === id);
    if (!a) return;
    setEditingAmenityId(id);
    setForm({ name: a.name, icon_key: a.icon_key });
    setShowEditDialog(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createAmenity.mutateAsync({
      name: form.name.trim(),
      icon_key: form.icon_key,
    });
    setShowCreateDialog(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAmenityId) return;
    await updateAmenity.mutateAsync({
      id: editingAmenityId,
      amenity: { name: form.name.trim(), icon_key: form.icon_key },
    });
    setShowEditDialog(false);
    setEditingAmenityId(null);
  };

  const handleDelete = async (id: number) => {
    setDeleteAmenityId(id);
    setShowDeleteDialog(true);
  };

  const defaultSeedRows = [
    { name: 'Wi‑Fi', icon_key: 'wifi' },
    { name: 'Complimentary Coffee', icon_key: 'coffee' },
    { name: 'King Bed', icon_key: 'bed' },
    { name: 'Free Parking', icon_key: 'car' },
    { name: 'Smart TV', icon_key: 'tv' },
    { name: 'Private Bath', icon_key: 'bath' },
    { name: 'Air Conditioning', icon_key: 'air_vent' },
    { name: 'Restaurant', icon_key: 'utensils' },
    { name: '24/7 Security', icon_key: 'shield' },
    { name: 'Pool', icon_key: 'waves' },
    { name: 'Gym', icon_key: 'dumbbell' },
    { name: 'Family Friendly', icon_key: 'users' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Amenities</h1>
          <p className="text-muted-foreground">
            Manage amenity options for suites.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => seedAmenities.mutate(defaultSeedRows)}
            className="hidden"
          >
            <Settings2 className="h-4 w-4 mr-2" /> Seed Defaults
          </Button>
          <Button onClick={startCreate}>
            <Plus className="h-4 w-4 mr-2" /> Add Amenity
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Total Amenities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAmenities}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Amenity List</CardTitle>
          <CardDescription>Create, edit, and remove amenities.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {(amenities || []).map((a) => {
              return (
                <div
                  key={a.id}
                  className="flex items-center justify-between border rounded-md p-3"
                >
                  <div className="flex items-center gap-2">
                    <AmenityIcon
                      iconKey={a.icon_key}
                      className="h-4 w-4 text-primary"
                    />
                    <div>
                      <div className="font-medium">{a.name}</div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => startEdit(a.id)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDelete(a.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}
            {(amenities || []).length === 0 && (
              <div className="text-sm text-muted-foreground">
                No amenities yet.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Amenity</DialogTitle>
            <DialogDescription>Create a new amenity.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="icon">Icon</Label>
              <div className="grid grid-cols-6 gap-2">
                <Button
                  type="button"
                  variant={form.icon_key === null ? 'default' : 'outline'}
                  className={cn('h-10')}
                  onClick={() => setForm({ ...form, icon_key: null })}
                >
                  None
                </Button>
                {amenityIconKeys.map((k) => (
                  <Button
                    key={k}
                    type="button"
                    variant={form.icon_key === k ? 'default' : 'outline'}
                    className={cn('h-10 flex items-center justify-center')}
                    onClick={() => setForm({ ...form, icon_key: k })}
                    title={k}
                  >
                    <AmenityIcon iconKey={k} className="h-5 w-5" />
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Amenity</DialogTitle>
            <DialogDescription>Update amenity details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name-edit">Name</Label>
              <Input
                id="name-edit"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="icon-edit">Icon</Label>
              <div className="grid grid-cols-6 gap-2">
                <Button
                  type="button"
                  variant={form.icon_key === null ? 'default' : 'outline'}
                  className={cn('h-10')}
                  onClick={() => setForm({ ...form, icon_key: null })}
                >
                  None
                </Button>
                {amenityIconKeys.map((k) => (
                  <Button
                    key={k}
                    type="button"
                    variant={form.icon_key === k ? 'default' : 'outline'}
                    className={cn('h-10 flex items-center justify-center')}
                    onClick={() => setForm({ ...form, icon_key: k })}
                    title={k}
                  >
                    <AmenityIcon iconKey={k} className="h-5 w-5" />
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Amenity"
        description="This will remove the amenity and detach it from all suites."
        onConfirm={async () => {
          if (deleteAmenityId) {
            await deleteAmenity.mutateAsync(deleteAmenityId);
            setShowDeleteDialog(false);
            setDeleteAmenityId(null);
          }
        }}
      />
    </div>
  );
};
