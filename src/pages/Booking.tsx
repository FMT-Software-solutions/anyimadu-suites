import { useState, useEffect, useMemo } from 'react';
import { useParams, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { type Suite } from '@/lib/types';
import { useCreateBooking } from '@/lib/queries/bookings';
import { validateSearch, guestInfoErrors, billingAddressErrors } from '@/lib/bookingValidation';
import { useSuites, type SuiteWithRelations } from '@/lib/queries/suites';
import { getAmenityIcon } from '@/lib/amenityIcons';
import { GuestInfoSection } from '@/components/booking/GuestInfoSection';
import { StayDetailsSection } from '@/components/booking/StayDetailsSection';
import { BillingAddressSection } from '@/components/booking/BillingAddressSection';
import { BookingSummary } from '@/components/booking/BookingSummary';
import { useSEO } from '@/lib/seo';
import { PaystackPayment } from '@/components/booking/PaystackPayment';
import { supabase } from '@/lib/supabase';
import { useUsdRate } from '@/lib/hooks';

interface BookingFormData {
  fullName: string;
  email: string;
  phone: string;
  checkIn?: Date;
  checkOut?: Date;
  guests: string;
  // Billing Address
  billingAddress: string;
  billingCity: string;
  billingState: string;
  billingZip: string;
  billingCountry: string;
}

export default function Booking() {
  const { suiteId } = useParams<{ suiteId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: suites } = useSuites();
  
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
  const suiteFromState = location.state?.suite as Suite | undefined;
  const suiteFromId = useMemo(() => {
    if (!suiteId) return null;
    return clientSuites.find((s) => String(s.id) === suiteId) || null;
  }, [suiteId, clientSuites]);
  const suite: Suite | null = suiteFromState || suiteFromId || null;
  
  useSEO({
    title: suite ? `Book ${suite.name} | Anyimadu Suites` : 'Complete your booking | Anyimadu Suites',
    description: 'Secure your reservation at Anyimadu Suites. Enter guest details and confirm your stay.',
    image: 'https://res.cloudinary.com/dkolqpqf2/image/upload/v1764083597/Screenshot_2025-11-25_151158_mrhzxy.png',
    type: 'website',
    robots: 'noindex, nofollow',
  });
  
  const [formData, setFormData] = useState<BookingFormData>({
    fullName: '',
    email: '',
    phone: '',
    checkIn: searchParams.get('checkIn') ? new Date(searchParams.get('checkIn')!) : undefined,
    checkOut: searchParams.get('checkOut') ? new Date(searchParams.get('checkOut')!) : undefined,
    guests: searchParams.get('guests') || '2',
    billingAddress: '',
    billingCity: '',
    billingState: '',
    billingZip: '',
    billingCountry: '',
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const createBooking = useCreateBooking();
  const [guestErrors, setGuestErrors] = useState<{ fullName?: string; email?: string; phone?: string }>({});
  const [billingErrors, setBillingErrors] = useState<{ billingAddress?: string; billingCity?: string; billingState?: string; billingCountry?: string }>({});
  const { data: usdRate } = useUsdRate();

  useEffect(() => {
    const ciParam = searchParams.get('checkIn');
    const coParam = searchParams.get('checkOut');
    const guestsParam = searchParams.get('guests');
    const ci = ciParam ? new Date(ciParam) : null;
    const co = coParam ? new Date(coParam) : null;
    const guestsNum = guestsParam ? parseInt(guestsParam, 10) : 0;
    const err = validateSearch(ci, co, guestsNum);
    if (err) {
      navigate('/suites');
    }
  }, [searchParams, navigate]);

  useEffect(() => {
    if (suites && !suite) {
      navigate('/suites');
    }
  }, [suites, suite, navigate]);

  const calculateNights = () => {
    if (formData.checkIn && formData.checkOut) {
      const diffTime = Math.abs(formData.checkOut.getTime() - formData.checkIn.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    return 1;
  };

  const validateForm = () => {
    if (!suite) return false;
    const guests = parseInt(formData.guests, 10) || 1;
    const err = validateSearch(formData.checkIn || null, formData.checkOut || null, guests);
    if (err) {
      setError(err);
      return false;
    }
    const gErrs = guestInfoErrors({ fullName: formData.fullName, email: formData.email, phone: formData.phone });
    if (gErrs.fullName || gErrs.email || gErrs.phone) {
      setGuestErrors(gErrs);
      setError(gErrs.fullName || gErrs.email || gErrs.phone || 'Please correct guest information.');
      return false;
    }
    const bErrs = billingAddressErrors({
      billingAddress: formData.billingAddress,
      billingCity: formData.billingCity,
      billingState: formData.billingState,
      billingCountry: formData.billingCountry,
    });
    if (bErrs.billingAddress || bErrs.billingCity || bErrs.billingState || bErrs.billingCountry) {
      setBillingErrors(bErrs);
      setError(bErrs.billingAddress || bErrs.billingCity || bErrs.billingState || bErrs.billingCountry || 'Please correct billing address.');
      return false;
    }
    setGuestErrors({});
    setBillingErrors({});
    setError(null);
    return true;
  };

  const handlePaymentSuccess = async (reference: any) => {
    if (!suite) return;
    const nights = calculateNights();
    const subtotal = suite.price * nights;
    const guests = parseInt(formData.guests, 10) || 1;

    try {
      await createBooking.mutateAsync({
        suite_id: suite.id,
        customer_name: formData.fullName,
        customer_email: formData.email,
        customer_phone: formData.phone,
        check_in: formData.checkIn!,
        check_out: formData.checkOut!,
        guest_count: guests,
        total_amount: Number(subtotal.toFixed(2)),
        billing_address: formData.billingAddress,
        billing_city: formData.billingCity,
        billing_state: formData.billingState,
        billing_zip: formData.billingZip,
        billing_country: formData.billingCountry,
        payment_reference: reference,
      });
      try {
        await supabase.functions.invoke('send-booking-confirmation', {
          body: {
            customer_name: formData.fullName,
            customer_email: formData.email,
            suite_name: suite.name,
            check_in: (formData.checkIn ?? new Date()).toISOString(),
            check_out: (formData.checkOut ?? new Date()).toISOString(),
            total_amount: Number(subtotal.toFixed(2)),
            payment_reference: reference?.reference ?? String(reference),
          },
        });
      } catch (emailErr) {
        console.error(emailErr);
      }
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err) {
      console.error(err);
      setError('Payment successful but booking creation failed. Please contact support.');
    }
  };

  if (!suite) {
    return null;
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
          <p className="text-gray-600 mb-4">
            Thank you for your reservation at {suite.name}. We've sent a confirmation email to {formData.email}.
          </p>
          <p className="text-sm text-gray-500">Redirecting to homepage...</p>
        </div>
      </div>
    );
  }

  const nights = calculateNights();
  const subtotal = suite.price * nights;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-64 bg-gray-900">
        <img
          src={suite.image}
          alt={suite.name}
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-black/90" />
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
            <Button
              variant="ghost"
              className="text-white hover:bg-white/20 mb-4"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className='flex gap-4'>
              <img
                src={suite.image}
                alt={suite.name}
                className="w-36 h-36 object-cover opacity-70 rounded-lg"
              />
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">{suite.name}</h1>
                <p className="text-xl text-gray-200">Complete your booking</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <div className="space-y-8">
              <GuestInfoSection
                values={{ fullName: formData.fullName, email: formData.email, phone: formData.phone }}
                onChange={(next) => setFormData((prev) => ({ ...prev, ...next }))}
                errors={guestErrors}
              />

              <StayDetailsSection
                checkIn={formData.checkIn}
                checkOut={formData.checkOut}
                guests={formData.guests}
                onCheckIn={() => {}}
                onCheckOut={() => {}}
                onGuests={() => {}}
                readOnly
              />

              <BillingAddressSection
                values={{
                  billingAddress: formData.billingAddress,
                  billingCity: formData.billingCity,
                  billingState: formData.billingState,
                  billingZip: formData.billingZip,
                  billingCountry: formData.billingCountry,
                }}
                onChange={(next) => setFormData((prev) => ({ ...prev, ...next }))}
                errors={billingErrors}
              />

              <PaystackPayment 
                amount={subtotal}
                email={formData.email}
                onSuccess={handlePaymentSuccess}
                onClose={() => console.log('Payment closed')}
                validate={validateForm}
                usdRate={usdRate}
                metadata={{
                  firstName: formData.fullName.split(' ')[0] || '',
                  lastName: formData.fullName.split(' ')[1] || '',
                  phone: formData.phone || '',
                }}
              />

              {error ? (
                <div className="text-red-600 text-sm mt-2">{error}</div>
              ) : null}
            </div>
          </div>

          <div className="lg:col-span-1">
            <BookingSummary
              suite={suite}
              checkIn={formData.checkIn}
              checkOut={formData.checkOut}
              guests={formData.guests}
              usdRate={usdRate}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
