import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Bed, Users, Wifi, Coffee } from 'lucide-react';

interface SuiteCardProps {
  name: string;
  description: string;
  image: string;
  price: number;
  capacity: number;
  onBookNow: (suiteName: string) => void;
}

export default function SuiteCard({
  name,
  description,
  image,
  price,
  capacity,
  onBookNow,
}: SuiteCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
        <div className="relative h-64 overflow-hidden">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute top-4 right-4 bg-[#996633] text-white px-4 py-2 rounded-full font-semibold">
            ${price}/night
          </div>
        </div>
        <CardHeader>
          <CardTitle className="text-xl">{name}</CardTitle>
          <CardDescription className="line-clamp-2">{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{capacity} guests</span>
            </div>
            <div className="flex items-center space-x-1">
              <Bed className="w-4 h-4" />
              <span>King bed</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 border-[#996633] text-[#996633] hover:bg-[#996633] hover:text-white"
            onClick={() => setShowDetails(true)}
          >
            View Details
          </Button>
          <Button
            className="flex-1 bg-[#996633] hover:bg-[#805528] text-white"
            onClick={() => onBookNow(name)}
          >
            Book Now
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#996633]">
              {name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            <div className="relative h-80 rounded-2xl overflow-hidden">
              <img
                src={image}
                alt={name}
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-600">{description}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Amenities</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Wifi className="w-5 h-5 text-[#996633]" />
                  <span>Free Wi-Fi</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Coffee className="w-5 h-5 text-[#996633]" />
                  <span>Complimentary Breakfast</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Bed className="w-5 h-5 text-[#996633]" />
                  <span>King Size Bed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-[#996633]" />
                  <span>Up to {capacity} Guests</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <p className="text-sm text-gray-600">Price per night</p>
                <p className="text-3xl font-bold text-[#996633]">${price}</p>
              </div>
              <Button
                className="bg-[#996633] hover:bg-[#805528] text-white px-8"
                onClick={() => {
                  setShowDetails(false);
                  onBookNow(name);
                }}
              >
                Book Now
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
