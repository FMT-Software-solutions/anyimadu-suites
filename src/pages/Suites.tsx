import { useState } from 'react';
import SuiteCard from '../components/SuiteCard';
import { Button } from '../components/ui/button';
import { Calendar } from '../components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../components/ui/popover';
import { CalendarIcon, Search } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

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
  },
];

export default function Suites() {
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [filteredSuites, setFilteredSuites] = useState(allSuites);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = () => {
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
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Our Exclusive Suites
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover the perfect accommodation for your stay
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-semibold mb-6 text-center">
              Find Available Suites
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Check-in Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal h-12',
                        !checkIn && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {checkIn ? (
                        format(checkIn, 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={checkIn}
                      onSelect={setCheckIn}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Check-out Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal h-12',
                        !checkOut && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {checkOut ? (
                        format(checkOut, 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={checkOut}
                      onSelect={setCheckOut}
                      disabled={(date) => date < (checkIn || new Date())}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block">
                  &nbsp;
                </label>
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12"
                  onClick={handleSearch}
                >
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>
              </div>
            </div>

            {hasSearched && checkIn && checkOut && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-center">
                  Showing {filteredSuites.length} available suite
                  {filteredSuites.length !== 1 ? 's' : ''} for your selected
                  dates
                </p>
              </div>
            )}
          </div>
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
                  setCheckIn(undefined);
                  setCheckOut(undefined);
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
