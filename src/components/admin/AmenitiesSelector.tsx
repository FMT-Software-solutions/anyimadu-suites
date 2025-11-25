import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAmenities } from '@/lib/queries/suites';
import { AmenityIcon } from '@/components/AmenityIcon';

interface AmenitiesSelectorProps {
  selectedAmenityIds: number[];
  onChange: (ids: number[]) => void;
}

export const AmenitiesSelector: React.FC<AmenitiesSelectorProps> = ({
  selectedAmenityIds,
  onChange,
}) => {
  const { data: amenities } = useAmenities();

  const toggleId = (id: number, checked: boolean) => {
    if (checked) {
      if (!selectedAmenityIds.includes(id))
        onChange([...selectedAmenityIds, id]);
    } else {
      onChange(selectedAmenityIds.filter((x) => x !== id));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Suite Amenities</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Select amenities for this suite:
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            {(amenities || []).map((amenity) => {
              const isSelected = selectedAmenityIds.includes(amenity.id);
              return (
                <div key={amenity.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={`amenity-${amenity.id}`}
                    checked={isSelected}
                    onCheckedChange={(checked) =>
                      toggleId(amenity.id, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`amenity-${amenity.id}`}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <AmenityIcon
                      iconKey={amenity.icon_key}
                      className="w-4 h-4 text-primary"
                    />
                    <span>{amenity.name}</span>
                  </Label>
                </div>
              );
            })}
          </div>
          {selectedAmenityIds.length > 0 && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">
                Selected amenities ({selectedAmenityIds.length}):
              </p>
              <div className="flex flex-wrap gap-2">
                {(amenities || [])
                  .filter((a) => selectedAmenityIds.includes(a.id))
                  .map((amenity) => {
                    return (
                      <div
                        key={amenity.id}
                        className="flex items-center space-x-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm"
                      >
                        <AmenityIcon
                          iconKey={amenity.icon_key}
                          className="w-3 h-3"
                        />
                        <span>{amenity.name}</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
