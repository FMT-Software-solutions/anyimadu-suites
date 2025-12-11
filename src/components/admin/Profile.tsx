import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Camera,
  Crown,
  Shield,
  ShieldCheck,
  Loader2,
  Save,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { type User } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  about: string;
}

export const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [profileData, setProfileData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    about: '',
  });

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const meta = user.user_metadata || {};
        setProfileData({
          firstName: meta.firstName || '',
          lastName: meta.lastName || '',
          email: user.email || '',
          phone: meta.phone || '',
          about: meta.about || meta.bio || '',
        });
      }
      setLoading(false);
    };
    init();
  }, []);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          phone: profileData.phone,
          about: profileData.about,
          // We don't update email here as it requires confirmation usually
        },
      });

      if (error) throw error;
      toast.success('Profile updated successfully');
      
      // Update local user state to reflect changes
      const { data: { user: updatedUser } } = await supabase.auth.getUser();
      setUser(updatedUser);
    } catch (error) {
      toast.error('Failed to update profile');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) throw new Error('No session');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'user-avatars');

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      
      const res = await fetch(`${supabaseUrl}/functions/v1/cloudinary-upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      const avatarUrl = data.secure_url;

      // Update user metadata with new avatar URL
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar: avatarUrl },
      });

      if (updateError) throw updateError;

      toast.success('Avatar updated successfully');
      
      // Refresh user
      const { data: { user: updatedUser } } = await supabase.auth.getUser();
      setUser(updatedUser);
    } catch (error) {
      toast.error('Failed to upload avatar');
      console.error(error);
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  const getRoleBadge = (role?: string) => {
    // Check app_metadata first as that's where roles usually live in Supabase
    const userRole = role || user?.app_metadata?.role || user?.user_metadata?.role || 'user';
    
    switch (userRole) {
      case 'super_admin':
      case 'admin':
        return (
          <Badge className="bg-red-500 hover:bg-red-600">
            <Crown className="mr-1 h-3 w-3" />
            Super Admin
          </Badge>
        );
      case 'manager':
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600">
            <ShieldCheck className="mr-1 h-3 w-3" />
            Manager
          </Badge>
        );
      case 'staff':
        return (
          <Badge variant="secondary">
            <Shield className="mr-1 h-3 w-3" />
            Staff
          </Badge>
        );
      default:
        return <Badge variant="outline">{userRole}</Badge>;
    }
  };

  const getInitials = () => {
    if (profileData.firstName && profileData.lastName) {
      return `${profileData.firstName.charAt(0)}${profileData.lastName.charAt(0)}`.toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">
            Manage your personal details and account settings.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your photo and personal details here.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative group">
              <Avatar className="h-24 w-24 border-2 border-muted">
                <AvatarImage src={user?.user_metadata?.avatar} className="object-cover" />
                <AvatarFallback className="text-xl">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => document.getElementById('avatar-upload')?.click()}>
                <Camera className="h-8 w-8 text-white" />
              </div>
            </div>
            
            <div className="space-y-2 text-center sm:text-left flex-1">
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <h3 className="text-xl font-medium">
                  {profileData.firstName} {profileData.lastName}
                </h3>
                {getRoleBadge()}
              </div>
              <p className="text-sm text-muted-foreground">
                {user?.email}
              </p>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <Button variant="outline" size="sm" onClick={() => document.getElementById('avatar-upload')?.click()} disabled={uploading}>
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Camera className="mr-2 h-4 w-4" />
                      Change Photo
                    </>
                  )}
                </Button>
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={uploading}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Profile Form */}
          <form onSubmit={handleProfileSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={profileData.firstName}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      firstName: e.target.value,
                    })
                  }
                  placeholder="Enter your first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={profileData.lastName}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      lastName: e.target.value,
                    })
                  }
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed directly.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) =>
                    setProfileData({ ...profileData, phone: e.target.value })
                  }
                  placeholder="e.g. +233 24 000 0000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="about">About</Label>
              <Textarea
                id="about"
                value={profileData.about}
                onChange={(e) =>
                  setProfileData({ ...profileData, about: e.target.value })
                }
                placeholder="Write a short bio about yourself..."
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
