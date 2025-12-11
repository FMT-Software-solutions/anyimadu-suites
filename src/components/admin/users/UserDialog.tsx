import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { type User } from '@/lib/queries/users';

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User;
  onSubmit: (data: any) => Promise<void>;
  currentUserRole: string;
  currentUserId: string;
}

export const UserDialog = ({
  open,
  onOpenChange,
  user,
  onSubmit,
  currentUserRole,
  currentUserId
}: UserDialogProps) => {
  const isEditing = !!user;
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'sales_rep',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        role: user.role,
      });
    } else {
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        role: 'sales_rep',
      });
    }
    setError(null);
  }, [user, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSubmit(formData);
      onOpenChange(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const canAssignRole = (role: string) => {
    if (role === 'super_admin') return false; // Never selectable in UI
    if (currentUserRole === 'super_admin') return true;
    if (currentUserRole === 'admin') {
      // Allow admin to keep their own role if editing self
      if (user?.id === currentUserId && role === 'admin') return true;
      return role !== 'admin';
    }
    return false;
  };

  const allRoles = [
      { value: 'admin', label: 'Admin', desc: 'Full access' },
      { value: 'editor', label: 'Editor', desc: 'Can manage most content' },
      { value: 'sales_rep', label: 'Sales Rep', desc: 'Bookings & Customers' },
      { value: 'read_only', label: 'Read Only', desc: 'View only' }
  ];
  
  const availableRoles = allRoles.filter(r => canAssignRole(r.value));

  // If editing and current role is not in available (e.g. admin viewing admin), show it but disabled?
  // But admin shouldn't be able to edit admin.
  // The table logic should prevent opening the dialog in that case.

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit User' : 'Create User'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={isEditing} 
              required
              type="email"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => setFormData({ ...formData, role: value })}
              disabled={isEditing && formData.role === 'super_admin'}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    <div className="flex flex-col text-left">
                      <span>{role.label}</span>
                      <span className="text-xs text-muted-foreground">{role.desc}</span>
                    </div>
                  </SelectItem>
                ))}
                {isEditing && !availableRoles.find((r) => r.value === formData.role) && (
                  <SelectItem value={formData.role} disabled>
                    {formData.role}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          {error && <div className="text-sm text-destructive">{error}</div>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
