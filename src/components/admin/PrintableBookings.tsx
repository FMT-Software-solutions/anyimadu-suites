import { forwardRef } from 'react';
import type { BookingRecord } from '@/lib/types';
import { format } from 'date-fns';

interface Props {
  rows: BookingRecord[];
  suitesMap: Map<string, string>;
}

export const PrintableBookings = forwardRef<HTMLDivElement, Props>(
  ({ rows, suitesMap }, ref) => {
    return (
      <div ref={ref} className="p-8 text-black">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Bookings Export</h1>
          <p className="text-sm text-gray-600">
            Generated on {format(new Date(), 'yyyy-MM-dd HH:mm')}
          </p>
        </div>
        <div className="space-y-6">
          {rows.length === 0 ? (
            <div className="text-sm text-gray-600">
              No bookings match the selected filters.
            </div>
          ) : (
            rows.map((b) => (
              <div
                key={b.id}
                className="rounded-xl border p-6"
                style={{ breakInside: 'avoid' }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-lg font-semibold">
                      {suitesMap.get(b.suite_id) || b.suite_id}
                    </div>
                    <div className="text-xs text-gray-500">
                      Created: {b.created_at}
                    </div>
                  </div>
                  <div className="text-sm text-gray-700">{b.status}</div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div className="space-y-1">
                    <div>
                      <span className="font-medium">Customer:</span>{' '}
                      {b.customer_name}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span>{' '}
                      {b.customer_email}
                    </div>
                    <div>
                      <span className="font-medium">Phone:</span>{' '}
                      {b.customer_phone}
                    </div>
                    <div>
                      <span className="font-medium">Stay:</span> {b.check_in} -{' '}
                      {b.check_out}
                    </div>
                    <div>
                      <span className="font-medium">Guests:</span>{' '}
                      {b.guest_count}{' '}
                      <span className="font-medium ml-4">Total:</span>{' '}
                      {b.total_amount}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="font-bold mt-2">Billing:</div>
                    {b.billing_address ? <div>{b.billing_address}</div> : null}
                    {b.billing_city ? <div>{b.billing_city}</div> : null}
                    {b.billing_state ? <div>{b.billing_state}</div> : null}
                    {b.billing_zip ? <div>{b.billing_zip}</div> : null}
                    {b.billing_country ? <div>{b.billing_country}</div> : null}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }
);
