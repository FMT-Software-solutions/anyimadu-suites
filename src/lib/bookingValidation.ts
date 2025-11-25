export const toISODate = (d: Date) => d.toISOString().slice(0, 10)

export const isValidDate = (d: Date | null | undefined) => !!d && !Number.isNaN(d.getTime())

export const validateSearch = (
  checkIn: Date | null,
  checkOut: Date | null,
  guests: number
): string | null => {
  if (!isValidDate(checkIn) || !isValidDate(checkOut)) return 'Please select both check-in and check-out dates.'
  const ci = checkIn as Date
  const co = checkOut as Date
  const today = new Date()
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  if (ci < startOfToday) return 'Check-in date cannot be in the past.'
  if (co <= ci) return 'Check-out must be after check-in.'
  if (!guests || guests < 1) return 'Please select at least 1 guest.'
  return null
}

export const rangesOverlap = (aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) => {
  return !(aEnd <= bStart || aStart >= bEnd)
}

export const validateGuestInfo = (fullName: string, email: string, phone: string): string | null => {
  if (!fullName || fullName.trim().length < 2) return 'Enter a valid full name.'
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) return 'Enter a valid email address.'
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 7) return 'Enter a valid phone number.'
  return null
}

export const validateBillingAddress = (
  address: string,
  city: string,
  state: string,
  country: string
): string | null => {
  if (!address || address.trim().length < 3) return 'Enter a valid street address.'
  if (!city || city.trim().length < 2) return 'Enter a valid city.'
  if (!state || state.trim().length < 2) return 'Enter a valid state/region.'
  if (!country || country.trim().length < 2) return 'Select a country.'
  return null
}

export const guestInfoErrors = (values: { fullName: string; email: string; phone: string }) => {
  const errors: { fullName?: string; email?: string; phone?: string } = {}
  if (!values.fullName || values.fullName.trim().length < 2) errors.fullName = 'Enter a valid full name.'
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(values.email)) errors.email = 'Enter a valid email address.'
  const digits = values.phone.replace(/\D/g, '')
  if (digits.length < 7) errors.phone = 'Enter a valid phone number.'
  return errors
}

export const billingAddressErrors = (values: {
  billingAddress: string
  billingCity: string
  billingState: string
  billingCountry: string
}) => {
  const errors: {
    billingAddress?: string
    billingCity?: string
    billingState?: string
    billingCountry?: string
  } = {}
  if (!values.billingAddress || values.billingAddress.trim().length < 3) errors.billingAddress = 'Enter a valid street address.'
  if (!values.billingCity || values.billingCity.trim().length < 2) errors.billingCity = 'Enter a valid city.'
  if (!values.billingState || values.billingState.trim().length < 2) errors.billingState = 'Enter a valid state/region.'
  if (!values.billingCountry || values.billingCountry.trim().length < 2) errors.billingCountry = 'Select a country.'
  return errors
}
