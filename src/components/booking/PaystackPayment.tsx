import React from 'react';
import { usePaystackPayment } from 'react-paystack';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

interface PaystackPaymentProps {
  email: string;
  amount: number; // in GHS
  metadata?: {
    firstName: string;
    lastName: string;
    phone: string;
  };
  onSuccess: (reference: any) => void;
  onClose: () => void;
  validate: () => boolean;
  disabled?: boolean;
  usdRate?: number;
}

export const PaystackPayment = ({
  email,
  metadata,
  amount,
  onSuccess,
  onClose,
  validate,
  disabled,
  usdRate,
}: PaystackPaymentProps) => {
  const config = {
    reference: new Date().getTime().toString(),
    email,
    amount: amount * 100, // Convert to GHS to pesewas
    currency: 'GHS',
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '',
    label: `${metadata?.firstName} ${metadata?.lastName}`,
    phone: metadata?.phone || '',
    firstname: metadata?.firstName || '',
    lastname: metadata?.lastName || '',
  };

  const initializePayment = usePaystackPayment(config);

  const handlePay = (e: React.MouseEvent) => {
    e.preventDefault();
    if (validate()) {
      initializePayment({ onSuccess, onClose });
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center mb-4">
        <Lock className="w-5 h-5 text-green-600 mr-2" />
        <h2 className="text-xl font-semibold">Secure Payment</h2>
      </div>
      <p className="text-sm text-gray-600 mb-6">
        Payment is processed securely by Paystack. Click the button below to
        complete your reservation.
      </p>

      <Button
        onClick={handlePay}
        disabled={disabled}
        className="w-full bg-primary hover:bg-primary/90 text-white py-6 text-lg"
      >
        Pay GHS{' '}
        {amount.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </Button>
      {typeof usdRate === 'number' ? (
        <div className="mt-2 text-center text-xs text-gray-600">
          ≈ ${Number((amount * usdRate).toFixed(2)).toLocaleString()}
        </div>
      ) : null}
    </div>
  );
};
