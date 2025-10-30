import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Building2,
  Users as UsersIcon,
  DollarSign,
  Image as ImageIcon,
  X,
  Users,
} from 'lucide-react';
import { allSuites } from '@/lib/constants';
import { type Suite, type Amenity } from '@/lib/types';
import { AmenitiesSelector } from './AmenitiesSelector';

interface SuiteFormData {
  name: string;
  description: string;
  image: string;
  price: string;
  capacity: string;
  gallery: string[];
  amenities: Amenity[];
}

export const Suites = () => {
  const [suites, setSuites] = useState<Suite[]>(allSuites);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingSuite, setEditingSuite] = useState<Suite | null>(null);
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  
  const [formData, setFormData] = useState<SuiteFormData>({
    name: '',
    description: '',
    image: '',
    price: '',
    capacity: '2',
    gallery: [],
    amenities: [],
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      image: '',
      price: '',
      capacity: '2',
      gallery: [],
      amenities: [],
    });
    setNewGalleryUrl('');
  };

  const handleCreateSuite = (e: React.FormEvent) => {
    e.preventDefault();
    const newSuite: Suite = {
      id: Math.max(...suites.map(s => s.id)) + 1,
      name: formData.name,
      description: formData.description,
      image: formData.image,
      price: parseFloat(formData.price),
      capacity: parseInt(formData.capacity),
      gallery: formData.gallery,
      amenities: formData.amenities,
    };
    setSuites([...suites, newSuite]);
    setShowCreateDialog(false);
    resetForm();
  };

  const handleEditSuite = (suite: Suite) => {
    setEditingSuite(suite);
    setFormData({
      name: suite.name,
      description: suite.description,
      image: suite.image,
      price: suite.price.toString(),
      capacity: suite.capacity.toString(),
      gallery: [...suite.gallery],
      amenities: [...suite.amenities],
    });
    setShowEditDialog(true);
  };

  const handleUpdateSuite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSuite) return;
    
    const updatedSuite: Suite = {
      ...editingSuite,
      name: formData.name,
      description: formData.description,
      image: formData.image,
      price: parseFloat(formData.price),
      capacity: parseInt(formData.capacity),
      gallery: formData.gallery,
      amenities: formData.amenities,
    };
    
    setSuites(suites.map(s => s.id === editingSuite.id ? updatedSuite : s));
    setShowEditDialog(false);
    setEditingSuite(null);
    resetForm();
  };

  const handleDeleteSuite = (suiteId: number) => {
    if (confirm('Are you sure you want to delete this suite?')) {
      setSuites(suites.filter(s => s.id !== suiteId));
    }
  };

  const addGalleryImage = () => {
    if (newGalleryUrl.trim()) {
      setFormData({
        ...formData,
        gallery: [...formData.gallery, newGalleryUrl.trim()]
      });
      setNewGalleryUrl('');
    }
  };

  const removeGalleryImage = (index: number) => {
    setFormData({
      ...formData,
      gallery: formData.gallery.filter((_, i) => i !== index)
    });
  };

  const SuiteForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <form onSubmit={isEdit ? handleUpdateSuite : handleCreateSuite} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Suite Name *</Label>
          <Input
            id="name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Royal Paradise Suite"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Price per Night (GHS) *</Label>
          <Input
            id="price"
            type="number"
            required
            min="0"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="450"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          required
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe the suite features and amenities..."
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="capacity">Capacity (Number of Guests) *</Label>
        <Select
          value={formData.capacity}
          onValueChange={(value) => setFormData({ ...formData, capacity: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
              <SelectItem key={num} value={num.toString()}>
                {num} {num === 1 ? 'Guest' : 'Guests'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Main Image URL *</Label>
        <Input
          id="image"
          type="url"
          required
          value={formData.image}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          placeholder="https://example.com/image.jpg"
        />
        {formData.image && (
          <div className="mt-2">
            <img
              src={formData.image}
              alt="Preview"
              className="w-32 h-24 object-cover rounded border"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>

      <div className="space-y-4">
        <Label>Gallery Images</Label>
        <div className="flex gap-2">
          <Input
            type="url"
            value={newGalleryUrl}
            onChange={(e) => setNewGalleryUrl(e.target.value)}
            placeholder="https://example.com/gallery-image.jpg"
            className="flex-1"
          />
          <Button type="button" onClick={addGalleryImage} variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        {formData.gallery.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {formData.gallery.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-24 object-cover rounded border"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeGalleryImage(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <AmenitiesSelector
        selectedAmenities={formData.amenities}
        onAmenitiesChange={(amenities) => setFormData({ ...formData, amenities })}
      />

      <div className="flex justify-end space-x-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => {
            if (isEdit) {
              setShowEditDialog(false);
              setEditingSuite(null);
            } else {
              setShowCreateDialog(false);
            }
            resetForm();
          }}
        >
          Cancel
        </Button>
        <Button type="submit">
          {isEdit ? 'Update Suite' : 'Create Suite'}
        </Button>
      </div>
    </form>
  );

  const suiteStats = {
    totalSuites: suites.length,
    averagePrice: Math.round(suites.reduce((sum, s) => sum + s.price, 0) / suites.length),
    totalCapacity: suites.reduce((sum, s) => sum + s.capacity, 0),
    highestPrice: Math.max(...suites.map(s => s.price)),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Suites</h1>
          <p className="text-muted-foreground">
            Manage your suite inventory and details.
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Suite
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Suite</DialogTitle>
              <DialogDescription>
                Create a new suite with details and images.
              </DialogDescription>
            </DialogHeader>
            <SuiteForm />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Suites</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suiteStats.totalSuites}</div>
            <p className="text-xs text-muted-foreground">Available suites</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Price</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GHS {suiteStats.averagePrice}</div>
            <p className="text-xs text-muted-foreground">Per night</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suiteStats.totalCapacity}</div>
            <p className="text-xs text-muted-foreground">Total guests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Highest Price</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GHS {suiteStats.highestPrice}</div>
            <p className="text-xs text-muted-foreground">Premium suite</p>
          </CardContent>
        </Card>
      </div>

      {/* Suites Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {suites.map((suite) => (
          <Card key={suite.id} className="overflow-hidden pt-0">
            <div className="relative">
              <img
                src={suite.image}
                alt={suite.name}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-2 right-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEditSuite(suite)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Suite
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={() => handleDeleteSuite(suite.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Suite
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Badge className="absolute bottom-2 left-2">
                GHS {suite.price}/night
              </Badge>
            </div>
            <CardHeader>
              <CardTitle className="text-lg">{suite.name}</CardTitle>
              <CardDescription className="line-clamp-2">
                {suite.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Users className="mr-1 h-4 w-4" />
                  Up to {suite.capacity} guests
                </div>
                <div className="flex items-center">
                  <ImageIcon className="mr-1 h-4 w-4" />
                  {suite.gallery.length} photos
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Suite</DialogTitle>
            <DialogDescription>
              Update suite details and images.
            </DialogDescription>
          </DialogHeader>
          <SuiteForm isEdit />
        </DialogContent>
      </Dialog>
    </div>
  );
};