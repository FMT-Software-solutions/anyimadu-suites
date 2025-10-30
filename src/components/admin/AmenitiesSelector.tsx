import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { availableAmenities } from '@/lib/constants';
import { type Amenity } from '@/lib/types';

interface AmenitiesSelectorProps {
  selectedAmenities: Amenity[];
  onAmenitiesChange: (amenities: Amenity[]) => void;
}

export const AmenitiesSelector: React.FC<AmenitiesSelectorProps> = ({
  selectedAmenities,
  onAmenitiesChange,
}) => {
  const handleAmenityToggle = (amenity: Amenity, checked: boolean) => {
    if (checked) {
      // Add amenity if not already selected
      if (!selectedAmenities.some(a => a.label === amenity.label)) {
        onAmenitiesChange([...selectedAmenities, amenity]);
      }
    } else {
      // Remove amenity
      onAmenitiesChange(selectedAmenities.filter(a => a.label !== amenity.label));
    }
  };

  const isAmenitySelected = (amenity: Amenity) => {
    return selectedAmenities.some(a => a.label === amenity.label);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Suite Amenities</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label className="text-sm font-medium">Select amenities for this suite:</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            {availableAmenities.map((amenity, index) => {
              const IconComponent = amenity.icon;
              const isSelected = isAmenitySelected(amenity);
              
              return (
                <div key={index} className="flex items-center space-x-3">
                  <Checkbox
                    id={`amenity-${index}`}
                    checked={isSelected}
                    onCheckedChange={(checked) => handleAmenityToggle(amenity, checked as boolean)}
                  />
                  <Label
                    htmlFor={`amenity-${index}`}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <IconComponent className="w-4 h-4 text-primary" />
                    <span>{amenity.label}</span>
                  </Label>
                </div>
              );
            })}
          </div>
          {selectedAmenities.length > 0 && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">
                Selected amenities ({selectedAmenities.length}):
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedAmenities.map((amenity, index) => {
                  const IconComponent = amenity.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-center space-x-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm"
                    >
                      <IconComponent className="w-3 h-3" />
                      <span>{amenity.label}</span>
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