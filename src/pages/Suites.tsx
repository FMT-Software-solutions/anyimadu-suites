import { SearchSuitesForm } from '@/components/SearchSuitesForm';
import { useState, useEffect } from 'react';
import SuiteCard from '../components/SuiteCard';
import { Button } from '../components/ui/button';
import { useSearchParams } from 'react-router-dom';

const allSuites = [
  {
    id: 1,
    name: 'Royal Paradise Suite',
    description:
      'Our flagship suite featuring panoramic views, a private balcony, and opulent furnishings. Perfect for those seeking the ultimate luxury experience.',
    image:
      'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 450,
    capacity: 4,
    gallery: [
      'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/262048/pexels-photo-262048.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1743231/pexels-photo-1743231.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1743229/pexels-photo-1743229.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
  },
  {
    id: 2,
    name: 'Garden View Suite',
    description:
      'Wake up to stunning garden views and enjoy the serenity of nature from your private terrace. Ideal for nature lovers and peaceful retreats.',
    image:
      'https://images.pexels.com/photos/262048/pexels-photo-262048.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 320,
    capacity: 3,
    gallery: [
      'https://images.pexels.com/photos/262048/pexels-photo-262048.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1743231/pexels-photo-1743231.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
  },
  {
    id: 3,
    name: 'Executive Suite',
    description:
      'Sophisticated and spacious, perfect for business travelers or extended stays. Features a dedicated workspace and modern amenities.',
    image:
      'https://images.pexels.com/photos/1743231/pexels-photo-1743231.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 380,
    capacity: 2,
    gallery: [
      'https://images.pexels.com/photos/1743231/pexels-photo-1743231.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/262048/pexels-photo-262048.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
  },
  {
    id: 4,
    name: 'Presidential Suite',
    description:
      'The epitome of luxury with separate living and dining areas, a premium entertainment system, and exclusive concierge service.',
    image:
      'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 550,
    capacity: 4,
    gallery: [
      'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/262048/pexels-photo-262048.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1743231/pexels-photo-1743231.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1743229/pexels-photo-1743229.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
  },
  {
    id: 5,
    name: 'Deluxe Suite',
    description:
      'Elegantly designed with contemporary décor and thoughtful amenities. An excellent choice for couples and small families.',
    image:
      'https://images.pexels.com/photos/1743229/pexels-photo-1743229.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 290,
    capacity: 2,
    gallery: [
      'https://images.pexels.com/photos/1743229/pexels-photo-1743229.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/262048/pexels-photo-262048.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1743231/pexels-photo-1743231.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
  },
];

export default function Suites() {
  const [filteredSuites, setFilteredSuites] = useState(allSuites);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchParams] = useSearchParams();
  const [initialCheckIn, setInitialCheckIn] = useState<Date | null>(null);
  const [initialCheckOut, setInitialCheckOut] = useState<Date | null>(null);

  // Handle URL parameters from navigation
  useEffect(() => {
    const checkInParam = searchParams.get('checkIn');
    const checkOutParam = searchParams.get('checkOut');

    if (checkInParam) {
      const checkInDate = new Date(checkInParam);
      setInitialCheckIn(checkInDate);
    }

    if (checkOutParam) {
      const checkOutDate = new Date(checkOutParam);
      setInitialCheckOut(checkOutDate);
    }

    // If we have dates from URL, perform initial search
    if (checkInParam && checkOutParam) {
      handleSearch(new Date(checkInParam), new Date(checkOutParam));
    }
  }, [searchParams]);

  const handleSearch = (checkIn: Date | null, checkOut: Date | null) => {
    setHasSearched(true);
    if (checkIn && checkOut) {
      const available = allSuites.filter(() => Math.random() > 0.2);
      setFilteredSuites(available.length > 0 ? available : allSuites);
    } else {
      setFilteredSuites(allSuites);
    }
  };

  const handleBookNow = () => {
    const event = new CustomEvent('openBookingModal');
    window.dispatchEvent(event);
  };

  return (
    <div className="min-h-screen pt-20">
      <section className="relative py-20 bg-linear-to-br from-primary/10 to-stone-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Our Exclusive Suites
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover the perfect accommodation for your stay
            </p>
          </div>

          <SearchSuitesForm
            onSearch={handleSearch}
            initialCheckIn={initialCheckIn}
            initialCheckOut={initialCheckOut}
          />

          {hasSearched && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-center">
                Showing {filteredSuites.length} available suite
                {filteredSuites.length !== 1 ? 's' : ''} for your selected dates
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredSuites.map((suite) => (
              <SuiteCard
                key={suite.id}
                name={suite.name}
                description={suite.description}
                image={suite.image}
                price={suite.price}
                capacity={suite.capacity}
                gallery={suite.gallery}
                onBookNow={handleBookNow}
              />
            ))}
          </div>

          {filteredSuites.length === 0 && hasSearched && (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600 mb-4">
                No suites available for the selected dates.
              </p>
              <Button
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                onClick={() => {
                  setInitialCheckIn(null);
                  setInitialCheckOut(null);
                  setFilteredSuites(allSuites);
                  setHasSearched(false);
                }}
              >
                Clear Search
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
