import { SearchSuitesForm } from '@/components/SearchSuitesForm';
import { getAmenityIcon } from '@/lib/amenityIcons';
import { toISODate, validateSearch } from '@/lib/bookingValidation';
import { useSuites, type SuiteWithRelations } from '@/lib/queries/suites';
import { useSEO } from '@/lib/seo';
import { supabase } from '@/lib/supabase';
import { type Suite } from '@/lib/types';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SuiteCard from '../components/SuiteCard';
import { Button } from '../components/ui/button';

export default function Suites() {
  useSEO({
    title: 'Browse Suites — Real-time availability | Anyimadu Suites',
    description: 'Explore spacious suites and check real-time availability. Book your stay at Anyimadu Suites and enjoy organic comfort in nature.',
    keywords: ['suite availability', 'book suites', 'Anyimadu Suites', 'Ghana hotel'],
    image: 'https://res.cloudinary.com/dkolqpqf2/image/upload/v1764083597/Screenshot_2025-11-25_151158_mrhzxy.png',
    type: 'website',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'OfferCatalog',
      name: 'Anyimadu Suites — Availability',
      url: typeof window !== 'undefined' ? window.location.href : 'https://anyimadu-suites.example/suites',
      itemListElement: [],
    },
  });
  const { data: suites, isLoading, isError } = useSuites();
  const [filteredSuites, setFilteredSuites] = useState<Suite[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [initialCheckIn, setInitialCheckIn] = useState<Date | null>(null);
  const [initialCheckOut, setInitialCheckOut] = useState<Date | null>(null);
  const [initialGuests, setInitialGuests] = useState<number>(2);
  const [lastCheckIn, setLastCheckIn] = useState<Date | null>(null);
  const [lastCheckOut, setLastCheckOut] = useState<Date | null>(null);
  const [lastGuests, setLastGuests] = useState<number>(2);

  const mapSuite = (row: SuiteWithRelations): Suite => ({
    id: row.id,
    name: row.name,
    description: row.description,
    image: row.main_image_url ?? '',
    price: row.price,
    capacity: row.capacity,
    gallery: row.gallery_urls ?? [],
    amenities: row.amenities.map((a) => ({
      icon: getAmenityIcon(a.icon_key ?? null),
      label: a.name,
    })),
  });

  const clientSuites = useMemo(() => (suites ?? []).map(mapSuite), [suites]);

  useEffect(() => {
    const checkInParam = searchParams.get('checkIn');
    const checkOutParam = searchParams.get('checkOut');
    const guestsParam = searchParams.get('guests');

    if (checkInParam) {
      const checkInDate = new Date(checkInParam);
      setInitialCheckIn(checkInDate);
    }

    if (checkOutParam) {
      const checkOutDate = new Date(checkOutParam);
      setInitialCheckOut(checkOutDate);
    }

    if (guestsParam) {
      const g = parseInt(guestsParam, 10);
      if (!Number.isNaN(g) && g > 0) setInitialGuests(g);
    }

    if (checkInParam && checkOutParam) {
      const g = guestsParam ? parseInt(guestsParam, 10) : 2;
      const ci = new Date(checkInParam);
      const co = new Date(checkOutParam);
      const gg = Number.isNaN(g) ? 2 : g;
      setLastCheckIn(ci);
      setLastCheckOut(co);
      setLastGuests(gg);
      handleSearch(ci, co, gg);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!hasSearched) {
      setFilteredSuites(clientSuites);
    }
  }, [clientSuites, hasSearched]);

  const handleSearch = async (checkIn: Date | null, checkOut: Date | null, guests: number) => {
    setHasSearched(true);
    setLastCheckIn(checkIn);
    setLastCheckOut(checkOut);
    setLastGuests(guests);
    const err = validateSearch(checkIn, checkOut, guests);
    if (err) {
      setFilteredSuites([]);
      return;
    }
    if (checkIn && checkOut) {
      const ci = toISODate(checkIn);
      const co = toISODate(checkOut);
      const { data: ids, error: rpcErr } = await supabase.rpc('available_suites', {
        p_check_in: ci,
        p_check_out: co,
        p_guest_count: guests,
      });
      if (rpcErr) {
        setFilteredSuites([]);
        return;
      }
      const suiteIds = Array.isArray(ids) ? ids.map((r: any) => r.id ?? r) : [];
      if (suiteIds.length === 0) {
        setFilteredSuites([]);
        return;
      }
      const { data, error } = await supabase
        .from('suites')
        .select('*, suite_amenities(*, amenities(*))')
        .in('id', suiteIds);
      if (error) {
        setFilteredSuites([]);
        return;
      }
      const rows = (data || []) as any[];
      const mapped: Suite[] = rows.map((row) => mapSuite({
        id: row.id,
        name: row.name,
        description: row.description,
        price: row.price,
        capacity: row.capacity,
        main_image_url: row.main_image_url,
        gallery_urls: row.gallery_urls || [],
        created_at: row.created_at,
        updated_at: row.updated_at,
        amenities: (row.suite_amenities || []).map((sa: any) => ({
          id: sa.amenities.id,
          name: sa.amenities.name,
          icon_key: sa.amenities.icon_key,
          created_at: sa.amenities.created_at,
          pivot_id: sa.id,
        })),
      } as SuiteWithRelations));
      setFilteredSuites(mapped);
    } else {
      setFilteredSuites(clientSuites);
    }
  };

  return (
    <div className="min-h-screen">
      <section className="relative py-20 bg-linear-to-br from-primary/10 to-stone-50">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
          style={{
            backgroundImage: `url('https://res.cloudinary.com/dkolqpqf2/image/upload/v1763996980/IMG-as_ew7hwe.png')`,
          }}
        />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Our Exclusive Suites
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover the perfect accommodation for your stay
            </p>
          </div>

          <SearchSuitesForm
            initialCheckIn={initialCheckIn}
            initialCheckOut={initialCheckOut}
            initialGuests={initialGuests}
            navigateOnSearch
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
          {isLoading && (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading suites...</p>
            </div>
          )}
          {isError && (
            <div className="text-center py-12 border border-red-200 bg-red-50/70 rounded-lg">
              <p className="text-red-600">Failed to load suites.</p>
            </div>
          )}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredSuites.map((suite) => (
              <SuiteCard
                key={suite.id}
                suite={suite}
                checkIn={hasSearched ? lastCheckIn : initialCheckIn}
                checkOut={hasSearched ? lastCheckOut : initialCheckOut}
                guests={hasSearched ? lastGuests : initialGuests}
              />
            ))}
          </div>

          {filteredSuites.length === 0 && hasSearched && !isLoading && (
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
                  setFilteredSuites(clientSuites);
                  setHasSearched(false);
                  navigate('/suites');
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
