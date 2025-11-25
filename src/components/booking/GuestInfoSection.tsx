import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export interface GuestInfoValues {
  fullName: string
  email: string
  phone: string
}

export const GuestInfoSection: React.FC<{
  values: GuestInfoValues
  onChange: (next: Partial<GuestInfoValues>) => void
  errors?: { fullName?: string; email?: string; phone?: string }
}> = ({ values, onChange, errors }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Guest Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name *</Label>
          <Input
            id="fullName"
            required
            value={values.fullName}
            onChange={(e) => onChange({ fullName: e.target.value })}
            placeholder="John Doe"
          />
          {errors?.fullName ? (
            <div className="text-red-600 text-sm">{errors.fullName}</div>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            required
            value={values.email}
            onChange={(e) => onChange({ email: e.target.value })}
            placeholder="john@example.com"
          />
          {errors?.email ? (
            <div className="text-red-600 text-sm">{errors.email}</div>
          ) : null}
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <Label htmlFor="phone">Phone Number *</Label>
        <Input
          id="phone"
          type="tel"
          required
          value={values.phone}
          onChange={(e) => onChange({ phone: e.target.value })}
          placeholder="+233 XX XXX XXXX"
        />
        {errors?.phone ? (
          <div className="text-red-600 text-sm">{errors.phone}</div>
        ) : null}
      </div>
    </div>
  )
}

