import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Plus } from 'lucide-react';
import { useUpdateSuite } from '@/lib/queries/suites';
import { FileUpload } from '@/components/FileUpload';

interface Props {
  suiteId: string;
  galleryUrls: string[];
}

export const SuiteImagesManager: React.FC<Props> = ({
  suiteId,
  galleryUrls,
}) => {
  const [newUrl, setNewUrl] = useState('');
  const updateSuite = useUpdateSuite();

  const handleAddUrl = async () => {
    if (!newUrl.trim()) return;
    const next = [...galleryUrls, newUrl.trim()];
    await updateSuite.mutateAsync({
      id: suiteId,
      suite: { gallery_urls: next },
    });
    setNewUrl('');
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Add image by URL</Label>
          <div className="flex gap-2">
            <Input
              type="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
            <Button type="button" variant="outline" onClick={handleAddUrl}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Upload image</Label>
          <FileUpload
            multiple={true}
            maxFiles={6}
            folder={`suites/${suiteId}`}
            onUploaded={async (urls) => {
              const next = [...galleryUrls, ...urls];
              await updateSuite.mutateAsync({
                id: suiteId,
                suite: { gallery_urls: next },
              });
            }}
            currentCount={galleryUrls.length}
          />
        </div>
      </div>
      {galleryUrls.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {galleryUrls.map((url, idx) => (
            <div key={idx} className="relative group">
              <img
                src={url}
                alt="Suite"
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
                onClick={async () => {
                  const next = galleryUrls.filter((_, i) => i !== idx);
                  await updateSuite.mutateAsync({
                    id: suiteId,
                    suite: { gallery_urls: next },
                  });
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
