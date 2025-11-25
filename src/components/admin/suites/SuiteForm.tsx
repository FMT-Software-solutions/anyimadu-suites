import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AmenitiesSelector } from '@/components/admin/AmenitiesSelector';
import { Plus, X } from 'lucide-react';
import { FileUpload } from '@/components/FileUpload';

export interface SuiteFormValues {
  name: string;
  description: string;
  price: string;
  capacity: string;
  mainImageUrl: string;
  galleryUrls: string[];
  amenityIds: number[];
}

interface Props {
  initialValues?: Partial<SuiteFormValues>;
  isEdit?: boolean;
  onSubmit: (values: SuiteFormValues) => void;
  onCancel: () => void;
}

export const SuiteForm: React.FC<Props> = ({
  initialValues,
  isEdit = false,
  onSubmit,
  onCancel,
}) => {
  const [values, setValues] = useState<SuiteFormValues>({
    name: initialValues?.name ?? '',
    description: initialValues?.description ?? '',
    price: initialValues?.price ?? '',
    capacity: initialValues?.capacity ?? '2',
    mainImageUrl: initialValues?.mainImageUrl ?? '',
    galleryUrls: initialValues?.galleryUrls ?? [],
    amenityIds: initialValues?.amenityIds ?? [],
  });
  const [newGalleryUrl, setNewGalleryUrl] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  const addGallery = () => {
    if (newGalleryUrl.trim()) {
      setValues({
        ...values,
        galleryUrls: [...values.galleryUrls, newGalleryUrl.trim()],
      });
      setNewGalleryUrl('');
    }
  };

  const removeGallery = (index: number) => {
    setValues({
      ...values,
      galleryUrls: values.galleryUrls.filter((_, i) => i !== index),
    });
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Suite Name *</Label>
          <Input
            id="name"
            required
            value={values.name}
            onChange={(e) => setValues({ ...values, name: e.target.value })}
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
            value={values.price}
            onChange={(e) => setValues({ ...values, price: e.target.value })}
            placeholder="450"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          required
          value={values.description}
          onChange={(e) =>
            setValues({ ...values, description: e.target.value })
          }
          placeholder="Describe the suite features and amenities..."
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="capacity">Capacity (Number of Guests) *</Label>
        <Select
          value={values.capacity}
          onValueChange={(value) => setValues({ ...values, capacity: value })}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="mainImageUrl">Main Image URL *</Label>
          <Input
            id="mainImageUrl"
            type="url"
            required
            value={values.mainImageUrl}
            onChange={(e) =>
              setValues({ ...values, mainImageUrl: e.target.value })
            }
            placeholder="https://example.com/image.jpg"
          />
          <FileUpload
            multiple={false}
            maxFiles={1}
            folder={'suites/form/main'}
            onUploaded={(urls) => {
              if (urls[0]) setValues({ ...values, mainImageUrl: urls[0] });
            }}
            buttonLabel={'Add file'}
            text={'Drop file here or click to browse'}
            currentCount={values.mainImageUrl ? 1 : 0}
          />
          {values.mainImageUrl && (
            <div className="mt-2">
              <img
                src={values.mainImageUrl}
                alt="Preview"
                className="w-full h-32 object-cover rounded border"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Gallery Images</Label>
          <div className="flex gap-2">
            <Input
              type="url"
              value={newGalleryUrl}
              onChange={(e) => setNewGalleryUrl(e.target.value)}
              placeholder="https://example.com/gallery-image.jpg"
              className="flex-1"
            />
            <Button type="button" onClick={addGallery} variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <FileUpload
            multiple={true}
            maxFiles={10}
            folder={'suites/form/gallery'}
            onUploaded={(urls) => {
              if (urls.length)
                setValues({
                  ...values,
                  galleryUrls: [...values.galleryUrls, ...urls],
                });
            }}
            currentCount={values.galleryUrls.length}
          />
          {values.galleryUrls.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {values.galleryUrls.map((url, index) => (
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
                    onClick={() => removeGallery(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AmenitiesSelector
        selectedAmenityIds={values.amenityIds}
        onChange={(ids) => setValues({ ...values, amenityIds: ids })}
      />

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {isEdit ? 'Save Changes' : 'Create Suite'}
        </Button>
      </div>
    </form>
  );
};
