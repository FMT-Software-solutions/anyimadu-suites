import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { format } from 'date-fns';
import { CalendarIcon, Check } from 'lucide-react';
import { cn } from '../lib/utils';

interface BookingModalProps {
  preselectedSuite?: string;
  preselectedCheckIn?: Date;
  preselectedCheckOut?: Date;
}

const suites = [
  'Royal Paradise Suite',
  'Garden View Suite',
  'Executive Suite',
  'Presidential Suite',
  'Deluxe Suite',
];

export default function BookingModal({
  preselectedSuite,
  preselectedCheckIn,
  preselectedCheckOut,
}: BookingModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    checkIn: preselectedCheckIn || undefined,
    checkOut: preselectedCheckOut || undefined,
    guests: '2',
    suite: preselectedSuite || '',
  });

  useEffect(() => {
    const handleOpenModal = () => setIsOpen(true);
    window.addEventListener('openBookingModal', handleOpenModal);
    return () =>
      window.removeEventListener('openBookingModal', handleOpenModal);
  }, []);

  useEffect(() => {
    if (preselectedSuite) {
      setFormData((prev) => ({ ...prev, suite: preselectedSuite }));
    }
    if (preselectedCheckIn) {
      setFormData((prev) => ({ ...prev, checkIn: preselectedCheckIn }));
    }
    if (preselectedCheckOut) {
      setFormData((prev) => ({ ...prev, checkOut: preselectedCheckOut }));
    }
  }, [preselectedSuite, preselectedCheckIn, preselectedCheckOut]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOpen(false);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        checkIn: undefined,
        checkOut: undefined,
        guests: '2',
        suite: '',
      });
    }, 3000);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-primary">
              Book Your Stay
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  required
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="+233 XX XXX XXXX"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Check-in Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !formData.checkIn && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.checkIn ? (
                        format(formData.checkIn, 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.checkIn}
                      onSelect={(date) =>
                        setFormData({ ...formData, checkIn: date })
                      }
                      disabled={(date) => date < new Date()}
                      autoFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Check-out Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !formData.checkOut && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.checkOut ? (
                        format(formData.checkOut, 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.checkOut}
                      onSelect={(date) =>
                        setFormData({ ...formData, checkOut: date })
                      }
                      disabled={(date) =>
                        date < (formData.checkIn || new Date())
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="guests">Number of Guests *</Label>
                <Select
                  value={formData.guests}
                  onValueChange={(value) =>
                    setFormData({ ...formData, guests: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Guest</SelectItem>
                    <SelectItem value="2">2 Guests</SelectItem>
                    <SelectItem value="3">3 Guests</SelectItem>
                    <SelectItem value="4">4 Guests</SelectItem>
                    <SelectItem value="5">5+ Guests</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="suite">Select Suite *</Label>
                <Select
                  value={formData.suite}
                  onValueChange={(value) =>
                    setFormData({ ...formData, suite: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a suite" />
                  </SelectTrigger>
                  <SelectContent>
                    {suites.map((suite) => (
                      <SelectItem key={suite} value={suite}>
                        {suite}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg"
            >
              Proceed to Payment
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="max-w-md">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
              Booking Confirmed!
            </DialogTitle>
            <p className="text-gray-600">
              Thank you for your reservation. We've sent a confirmation email to{' '}
              {formData.email}.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
