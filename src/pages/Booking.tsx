import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Lock, CreditCard } from 'lucide-react';
import { type Suite } from '@/lib/types';
import { useCreateBooking } from '@/lib/queries/bookings';
import { validateSearch, guestInfoErrors, billingAddressErrors } from '@/lib/bookingValidation';
import { useSuites, type SuiteWithRelations } from '@/lib/queries/suites';
import { useMemo } from 'react';
import { getAmenityIcon } from '@/lib/amenityIcons';
import { GuestInfoSection } from '@/components/booking/GuestInfoSection';
import { StayDetailsSection } from '@/components/booking/StayDetailsSection';
import { BillingAddressSection } from '@/components/booking/BillingAddressSection';
import { BookingSummary } from '@/components/booking/BookingSummary';

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
  // Payment
  cardName: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
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
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const createBooking = useCreateBooking();
  const [guestErrors, setGuestErrors] = useState<{ fullName?: string; email?: string; phone?: string }>({});
  const [billingErrors, setBillingErrors] = useState<{ billingAddress?: string; billingCity?: string; billingState?: string; billingCountry?: string }>({});

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


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suite) return;
    const guests = parseInt(formData.guests, 10) || 1;
    const err = validateSearch(formData.checkIn || null, formData.checkOut || null, guests);
    if (err) {
      setError(err);
      return;
    }
    const gErrs = guestInfoErrors({ fullName: formData.fullName, email: formData.email, phone: formData.phone });
    if (gErrs.fullName || gErrs.email || gErrs.phone) {
      setGuestErrors(gErrs);
      setError(gErrs.fullName || gErrs.email || gErrs.phone || 'Please correct guest information.');
      return;
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
      return;
    }
    setGuestErrors({});
    setBillingErrors({});
    setError(null);
    const nights = calculateNights();
    const subtotal = suite.price * nights;
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
    });
    setShowSuccess(true);
    setTimeout(() => {
      navigate('/');
    }, 3000);
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
            <form onSubmit={handleSubmit} className="space-y-8">
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

              {/* Payment Details */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center mb-4">
                  <Lock className="w-5 h-5 text-green-600 mr-2" />
                  <h2 className="text-xl font-semibold">Secure Payment Details</h2>
                </div>
                <p className="text-sm text-gray-600 mb-4">This is a secure 256-bit SSL encrypted payment.</p>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardName">Name on Card *</Label>
                    <Input
                      id="cardName"
                      required
                      value={formData.cardName}
                      onChange={(e) => setFormData({ ...formData, cardName: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number *</Label>
                    <div className="relative">
                      <Input
                        id="cardNumber"
                        required
                        value={formData.cardNumber}
                        onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                      />
                      <CreditCard className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiryDate">Expiry Date *</Label>
                      <Input
                        id="expiryDate"
                        required
                        value={formData.expiryDate}
                        onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                        placeholder="MM/YY"
                        maxLength={5}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV *</Label>
                      <Input
                        id="cvv"
                        required
                        value={formData.cvv}
                        onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                        placeholder="123"
                        maxLength={4}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white py-6 text-lg"
              >
                Complete Reservation
              </Button>
              {error ? (
                <div className="text-red-600 text-sm mt-2">{error}</div>
              ) : null}
            </form>
          </div>

          <div className="lg:col-span-1">
            <BookingSummary
              suite={suite}
              checkIn={formData.checkIn}
              checkOut={formData.checkOut}
              guests={formData.guests}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
