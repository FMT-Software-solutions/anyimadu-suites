import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useSuiteBookings } from '@/lib/queries/bookings';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';

interface Props {
  suiteId: string;
}

export const BookedDatesList: React.FC<Props> = ({ suiteId }) => {
  const [open, setOpen] = useState(false);
  const { data: bookings, isLoading } = useSuiteBookings(suiteId);

  const dates = useMemo(() => {
    const all: Date[] = [];
    (bookings || []).forEach((b) => {
      const start = new Date(`${b.check_in}T00:00:00`);
      const end = new Date(`${b.check_out}T00:00:00`);
      const cur = new Date(start);
      while (cur < end) {
        all.push(new Date(cur));
        cur.setDate(cur.getDate() + 1);
      }
    });
    all.sort((a, b) => a.getTime() - b.getTime());
    const unique: Date[] = [];
    for (let i = 0; i < all.length; i++) {
      const prev = unique[unique.length - 1];
      if (!prev || prev.getTime() !== all[i].getTime()) unique.push(all[i]);
    }
    return unique;
  }, [bookings]);

  const items = useMemo(() => {
    const out: (string | '...')[] = [];
    for (let i = 0; i < dates.length; i++) {
      const d = dates[i];
      const prev = dates[i - 1];
      if (prev) {
        const diff = Math.round(
          (d.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (diff > 1) out.push('...');
      }
      out.push(format(d, 'do MMM, yyyy'));
    }
    return out;
  }, [dates]);

  return (
    <Card className="border p-2">
      <div className="flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span className="font-medium">Booked Dates</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? 'Hide' : 'Show'}
        </Button>
      </div>
      {open && (
        <CardContent>
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : dates.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No bookings yet.
            </div>
          ) : (
            <div className="flex gap-6 flex-wrap max-h-52 overflow-auto">
              {items.map((it, idx) => (
                <span key={idx} className="inline-block text-sm">
                  {it}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};
