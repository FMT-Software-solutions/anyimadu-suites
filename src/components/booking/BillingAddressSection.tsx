import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CountrySelector } from '@/components/CountrySelector';

export interface BillingValues {
  billingAddress: string;
  billingCity: string;
  billingState: string;
  billingZip: string;
  billingCountry: string;
}

export const BillingAddressSection: React.FC<{
  values: BillingValues;
  onChange: (next: Partial<BillingValues>) => void;
  errors?: {
    billingAddress?: string;
    billingCity?: string;
    billingState?: string;
    billingCountry?: string;
  };
}> = ({ values, onChange, errors }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Billing Address</h2>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="billingAddress">Street Address *</Label>
          <Input
            id="billingAddress"
            required
            value={values.billingAddress}
            onChange={(e) => onChange({ billingAddress: e.target.value })}
            placeholder="123 Main Street"
          />
          {errors?.billingAddress ? (
            <div className="text-red-600 text-sm">{errors.billingAddress}</div>
          ) : null}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="billingCity">City *</Label>
            <Input
              id="billingCity"
              required
              value={values.billingCity}
              onChange={(e) => onChange({ billingCity: e.target.value })}
              placeholder="Accra"
            />
            {errors?.billingCity ? (
              <div className="text-red-600 text-sm">{errors.billingCity}</div>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="billingState">State/Region *</Label>
            <Input
              id="billingState"
              required
              value={values.billingState}
              onChange={(e) => onChange({ billingState: e.target.value })}
              placeholder="Greater Accra"
            />
            {errors?.billingState ? (
              <div className="text-red-600 text-sm">{errors.billingState}</div>
            ) : null}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="billingZip">Postal Code</Label>
            <Input
              id="billingZip"
              value={values.billingZip}
              onChange={(e) => onChange({ billingZip: e.target.value })}
              placeholder="..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="billingCountry">Country *</Label>
            <CountrySelector
              value={values.billingCountry}
              onValueChange={(value) => onChange({ billingCountry: value })}
            />
            {errors?.billingCountry ? (
              <div className="text-red-600 text-sm">
                {errors.billingCountry}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
