import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export const StayDetailsSection: React.FC<{
  checkIn?: Date;
  checkOut?: Date;
  guests: string;
  onCheckIn: (d: Date | undefined) => void;
  onCheckOut: (d: Date | undefined) => void;
  onGuests: (v: string) => void;
  readOnly?: boolean;
}> = ({
  checkIn,
  checkOut,
  guests,
  onCheckIn,
  onCheckOut,
  onGuests,
  readOnly = false,
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Stay Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Check-in Date *</Label>
          {readOnly ? (
            <div className="border rounded-md h-10 px-3 flex items-center text-sm">
              {checkIn ? format(checkIn, 'PPP') : '-'}
            </div>
          ) : (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !checkIn && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {checkIn ? format(checkIn, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={checkIn}
                  onSelect={(date) => onCheckIn(date || undefined)}
                  disabled={(date) => date < new Date()}
                  autoFocus
                />
              </PopoverContent>
            </Popover>
          )}
        </div>
        <div className="space-y-2">
          <Label>Check-out Date *</Label>
          {readOnly ? (
            <div className="border rounded-md h-10 px-3 flex items-center text-sm">
              {checkOut ? format(checkOut, 'PPP') : '-'}
            </div>
          ) : (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
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
                  onSelect={(date) => onCheckOut(date || undefined)}
                  disabled={(date) => date < (checkIn || new Date())}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="guests">Number of Guests *</Label>
          {readOnly ? (
            <div className="border rounded-md h-10 px-3 flex items-center text-sm">
              {guests} {guests === '1' ? 'Guest' : 'Guests'}
            </div>
          ) : (
            <Select value={guests} onValueChange={onGuests}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Guest</SelectItem>
                <SelectItem value="2">2 Guests</SelectItem>
                <SelectItem value="3">3 Guests</SelectItem>
                <SelectItem value="4">4 Guests</SelectItem>
                <SelectItem value="5">5 Guests</SelectItem>
                <SelectItem value="6">6 Guests</SelectItem>
                <SelectItem value="7">7 Guests</SelectItem>
                <SelectItem value="8">8 Guests</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
    </div>
  );
};
