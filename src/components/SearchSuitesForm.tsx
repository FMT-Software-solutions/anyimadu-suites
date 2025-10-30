import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { CalendarIcon, Search, Users } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface SearchSuitesFormProps {
  onSearch?: (
    checkIn: Date | null,
    checkOut: Date | null,
    guests: number
  ) => void;
  initialCheckIn?: Date | null;
  initialCheckOut?: Date | null;
  initialGuests?: number;
  navigateOnSearch?: boolean;
  className?: string;
  variant?: 'default' | 'overlay';
}

export function SearchSuitesForm({
  onSearch,
  initialCheckIn = null,
  initialCheckOut = null,
  initialGuests = 2,
  navigateOnSearch = false,
  className = '',
  variant = 'default',
}: SearchSuitesFormProps) {
  const [checkIn, setCheckIn] = useState<Date | null>(initialCheckIn);
  const [checkOut, setCheckOut] = useState<Date | null>(initialCheckOut);
  const [guests, setGuests] = useState<number>(initialGuests);
  const navigate = useNavigate();

  // Update state when initial values change (for URL params)
  useEffect(() => {
    setCheckIn(initialCheckIn);
    setCheckOut(initialCheckOut);
    setGuests(initialGuests);
  }, [initialCheckIn, initialCheckOut, initialGuests]);

  const handleSearch = () => {
    if (navigateOnSearch) {
      // Navigate to Suites page with dates and guests as URL params
      const params = new URLSearchParams();
      if (checkIn) params.set('checkIn', checkIn.toISOString());
      if (checkOut) params.set('checkOut', checkOut.toISOString());
      params.set('guests', guests.toString());
      navigate(`/suites?${params.toString()}`);
    } else if (onSearch) {
      // Call the provided onSearch function
      onSearch(checkIn, checkOut, guests);
    }
  };

  const isOverlay = variant === 'overlay';
  const containerClasses = cn(
    'w-full mx-auto rounded-xl bg-white p-4 md:p-8',
    isOverlay ? 'backdrop-blur-md shadow-2xl' : 'shadow-lg',
    className
  );

  return (
    <div className={containerClasses}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Check-in Date */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 block">
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
                {checkIn ? format(checkIn, 'PPP') : 'Select date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={checkIn || undefined}
                onSelect={(date) => setCheckIn(date || null)}
                disabled={(date) => date < new Date()}
                autoFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Check-out Date */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 block">
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
                {checkOut ? format(checkOut, 'PPP') : 'Select date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={checkOut || undefined}
                onSelect={(date) => setCheckOut(date || null)}
                disabled={(date) => {
                  if (date < new Date()) return true;
                  if (checkIn && date <= checkIn) return true;
                  return false;
                }}
                autoFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Number of Guests */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 hidden md:block">
            Guests
          </label>
          <Select
            value={guests.toString()}
            onValueChange={(value) => setGuests(parseInt(value))}
          >
            <SelectTrigger className="w-full min-h-12">
              <SelectValue>
                <div className="flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  {guests} {guests === 1 ? 'Guest' : 'Guests'}
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} {num === 1 ? 'Guest' : 'Guests'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Search Button */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 hidden md:block ">
            &nbsp;
          </label>
          <Button
            className={cn(
              'w-full h-12',
              isOverlay
                ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg'
                : 'bg-primary hover:bg-primary/90 text-primary-foreground'
            )}
            onClick={handleSearch}
          >
            <Search className="mr-2 h-4 w-4" />
            {navigateOnSearch ? 'Find Suites' : 'Search'}
          </Button>
        </div>
      </div>
    </div>
  );
}
