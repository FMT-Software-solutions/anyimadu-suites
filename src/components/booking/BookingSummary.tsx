import { format } from 'date-fns'
import { type Suite } from '@/lib/types'

export const BookingSummary: React.FC<{
  suite: Suite
  checkIn?: Date
  checkOut?: Date
  guests: string
  usdRate?: number
}> = ({ suite, checkIn, checkOut, guests, usdRate }) => {
  const nights = (() => {
    if (checkIn && checkOut) {
      const diff = Math.abs(checkOut.getTime() - checkIn.getTime())
      return Math.ceil(diff / (1000 * 60 * 60 * 24))
    }
    return 1
  })()
  const subtotal = suite.price * nights
  const usdSubtotal = typeof usdRate === 'number' ? subtotal * usdRate : null
  const usdPerNight = typeof usdRate === 'number' ? suite.price * usdRate : null
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm sticky top-4">
      <h2 className="text-xl font-semibold mb-4">Booking Summary</h2>
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <img src={suite.image} alt={suite.name} className="w-16 h-16 object-cover rounded" />
          <div>
            <h3 className="font-semibold">{suite.name}</h3>
            <p className="text-sm text-gray-600">Up to {suite.capacity} guests</p>
          </div>
        </div>
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Check-in:</span>
            <span>{checkIn ? format(checkIn, 'MMM dd, yyyy') : 'Not selected'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Check-out:</span>
            <span>{checkOut ? format(checkOut, 'MMM dd, yyyy') : 'Not selected'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Guests:</span>
            <span>{guests}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Nights:</span>
            <span>{nights}</span>
          </div>
        </div>
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between">
            <span>GHS {suite.price} × {nights} nights</span>
            <div className="text-right">
              <div>GHS {(suite.price * nights).toFixed(2)}</div>
              {usdPerNight !== null ? (
                <div className="text-xs text-gray-600">≈ ${usdPerNight.toFixed(2)} × {nights}</div>
              ) : null}
            </div>
          </div>
        </div>
        <div className="border-t pt-4">
          <div className="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <div className="text-right">
              <div>GHS {subtotal.toFixed(2)}</div>
              {usdSubtotal !== null ? (
                <div className="text-sm font-normal text-gray-600">≈ ${usdSubtotal.toFixed(2)}</div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
