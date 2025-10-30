import React, { useState } from 'react';
import { Check, Users } from 'lucide-react';
import { Button } from './ui/button';
import { type Amenity } from '../lib/types';

interface SuiteDetailsProps {
  description: string;
  capacity: number;
  amenities: Amenity[];
}

export const SuiteDetails: React.FC<SuiteDetailsProps> = ({ description, capacity, amenities }) => {
  const [activeTab, setActiveTab] = useState<'description' | 'amenities'>('description');

  // Add capacity as an amenity if not already included
  const allAmenities = [
    ...amenities,
    { icon: Users, label: `Up to ${capacity} Guests` }
  ];

  return (
    <>
      {/* Desktop Layout - Side by side */}
      <div className="hidden md:block space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Description</h3>
          <p className="text-gray-600">{description}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Amenities</h3>
          <div className="grid grid-cols-2 gap-4">
            {allAmenities.map((amenity, index) => {
              const IconComponent = amenity.icon;
              return (
                <div key={index} className="flex items-center space-x-2">
                  {IconComponent ? <IconComponent className="w-5 h-5 text-primary" /> : <Check className="w-5 h-5 text-primary" />}
                  <span>{amenity.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Layout - Tabs */}
      <div className="md:hidden">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-4">
          <Button
            variant="ghost"
            className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'description'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('description')}
          >
            Description
          </Button>
          <Button
            variant="ghost"
            className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'amenities'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('amenities')}
          >
            Amenities
          </Button>
        </div>

        {/* Tab Content */}
        <div className="min-h-[120px]">
          {activeTab === 'description' && (
            <div className="animate-in fade-in-50 duration-200">
              <p className="text-gray-600">{description}</p>
            </div>
          )}

          {activeTab === 'amenities' && (
            <div className="animate-in fade-in-50 duration-200">
              <div className="grid grid-cols-1 gap-3">
                {allAmenities.map((amenity, index) => {
                  const IconComponent = amenity.icon;
                  return (
                    <div key={index} className="flex items-center space-x-3">
                      {IconComponent ? <IconComponent className="w-5 h-5 text-primary" /> : <Check className="w-5 h-5 text-primary" />}
                      <span>{amenity.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};