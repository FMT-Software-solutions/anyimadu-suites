import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Bed, Users } from 'lucide-react';
import { SuiteGallery } from './SuiteGallery';
import { SuiteDetails } from './SuiteDetails';

interface SuiteCardProps {
  name: string;
  description: string;
  image: string;
  price: number;
  capacity: number;
  gallery: string[];
  onBookNow: (suiteName: string) => void;
}

export default function SuiteCard({
  name,
  description,
  image,
  price,
  capacity,
  gallery,
  onBookNow,
}: SuiteCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300 group pt-0">
        <div className="relative h-64 overflow-hidden">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute top-4 right-4 bg-primary text-white px-4 py-2 rounded-full font-semibold">
            GHS {price}
          </div>
        </div>
        <CardHeader>
          <CardTitle className="text-xl">{name}</CardTitle>
          <CardDescription className="line-clamp-2">
            {description}
          </CardDescription>
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
            className="flex-1 border-primary text-primary hover:bg-primary hover:text-white"
            onClick={() => setShowDetails(true)}
          >
            View Details
          </Button>
          <Button
            className="flex-1 bg-primary hover:bg-primary/90 text-white"
            onClick={() => onBookNow(name)}
          >
            Book Now
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-4xl h-[90vh] overflow-y-auto pb-0">
          <DialogHeader>
            <DialogTitle className="text-left text-2xl font-bold text-primary">
              {name}
            </DialogTitle>
          </DialogHeader>

          <SuiteGallery images={gallery} suiteName={name} />

          <div className="space-y-6 px-2 pb-6">
            <div className="flex items-center justify-between py-4 border-y">
              <div>
                <p className="text-sm text-gray-600">Price per night</p>
                <p className="text-2xl md:text-3xl font-extrabold text-primary">
                  GHS {price}
                </p>
              </div>
              <Button
                className="bg-primary hover:bg-primary/90 text-white px-8"
                onClick={() => {
                  setShowDetails(false);
                  onBookNow(name);
                }}
              >
                Book Now
              </Button>
            </div>
            <SuiteDetails description={description} capacity={capacity} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
