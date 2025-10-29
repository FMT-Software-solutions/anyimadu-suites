import { SearchSuitesForm } from '@/components/SearchSuitesForm';
import { useState, useEffect } from 'react';
import SuiteCard from '../components/SuiteCard';
import { Button } from '../components/ui/button';
import { useSearchParams } from 'react-router-dom';
import { allSuites } from '../lib/constants';

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
                suite={suite}
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
