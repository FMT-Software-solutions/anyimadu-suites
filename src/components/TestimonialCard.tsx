import { Card, CardContent } from './ui/card';
import { Star } from 'lucide-react';

interface TestimonialCardProps {
  name: string;
  location: string;
  rating: number;
  comment: string;
  image: string;
}

export default function TestimonialCard({
  name,
  location,
  rating,
  comment,
  image,
}: TestimonialCardProps) {
  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4 mb-4">
          <img
            src={image}
            alt={name}
            className="w-16 h-16 rounded-full object-cover"
          />
          <div className="flex-1">
            <h4 className="font-semibold text-lg">{name}</h4>
            <p className="text-sm text-gray-600">{location}</p>
            <div className="flex items-center mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < rating
                      ? 'fill-[#996633] text-[#996633]'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
        <p className="text-gray-700 leading-relaxed">{comment}</p>
      </CardContent>
    </Card>
  );
}
