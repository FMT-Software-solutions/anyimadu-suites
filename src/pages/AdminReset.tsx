import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, X, Info } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Step = 'request' | 'verify' | 'update' | 'done';

export const AdminReset = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('request');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

  const criteria = [
    { label: 'At least 8 characters', valid: password.length >= 8 },
    { label: 'Contains uppercase letter', valid: /[A-Z]/.test(password) },
    { label: 'Contains lowercase letter', valid: /[a-z]/.test(password) },
    { label: 'Contains number', valid: /[0-9]/.test(password) },
    {
      label: 'Contains special character',
      valid: /[^a-zA-Z0-9]/.test(password),
    },
  ];

  const allValid = criteria.every((c) => c.valid);
  const passwordsMatch = password === confirmPassword && password.length > 0;

  const sendOtp = async () => {
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({ email }),
      });
      const out = await res.json();
      if (!res.ok) {
        setError(out?.error ?? 'Failed to send code');
        return;
      }
      setMessage('If the account exists, an OTP has been sent.');
      setStep('verify');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({ email, otp }),
      });
      const out = await res.json();
      if (!res.ok) {
        setError(out?.error ?? 'Invalid or expired code');
        return;
      }
      setAccessToken(out?.access_token ?? null);
      setRefreshToken(out?.refresh_token ?? null);
      setStep('update');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async () => {
    if (!allValid) {
      setError('Please meet all password requirements');
      return;
    }
    if (!passwordsMatch) {
      setError('Passwords do not match');
      return;
    }

    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      if (!accessToken || !refreshToken) {
        setError('Missing session');
        return;
      }

      // Set the session on the client
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (sessionError) {
        throw new Error('Failed to restore session');
      }

      // Update password using client
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        throw updateError;
      }

      setAccessToken(null);
      setRefreshToken(null);
      await supabase.auth.signOut();

      setStep('done');
      setMessage('Password updated. Please login with your new password.');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Password Reset</CardTitle>
        </CardHeader>
        <CardContent>
          {step === 'request' ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              {error ? (
                <div className="text-sm text-destructive">{error}</div>
              ) : null}
              {message ? (
                <div className="text-sm text-primary">{message}</div>
              ) : null}
              <Button
                onClick={sendOtp}
                disabled={loading || !email}
                className="w-full"
              >
                {loading ? 'Sending…' : 'Send OTP'}
              </Button>
            </div>
          ) : null}

          {step === 'verify' ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm">Enter OTP sent to {email}</label>
                <Input
                  inputMode="numeric"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
              {error ? (
                <div className="text-sm text-destructive">{error}</div>
              ) : null}
              {message ? (
                <div className="text-sm text-primary">{message}</div>
              ) : null}
              <Button
                onClick={verifyOtp}
                disabled={loading || otp.length < 6}
                className="w-full"
              >
                {loading ? 'Verifying…' : 'Verify OTP'}
              </Button>
            </div>
          ) : null}

          {step === 'update' ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">New Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>

              <div className="space-y-2 rounded-md bg-muted p-3 text-sm">
                <div className="flex items-center gap-2 font-medium">
                  <Info className="h-4 w-4" />
                  Password Requirements:
                </div>
                <ul className="space-y-1">
                  {criteria.map((c, i) => (
                    <li
                      key={i}
                      className={`flex items-center gap-2 ${
                        c.valid ? 'text-green-600' : 'text-muted-foreground'
                      }`}
                    >
                      {c.valid ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <div className="h-3 w-3 rounded-full border border-current" />
                      )}
                      {c.label}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <label className="text-sm font-medium">Confirm Password</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
                {confirmPassword && !passwordsMatch && (
                  <div className="text-xs text-destructive mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" /> Passwords do not match
                  </div>
                )}
              </div>

              {error ? (
                <div className="text-sm text-destructive font-medium">
                  {error}
                </div>
              ) : null}
              {message ? (
                <div className="text-sm text-primary font-medium">
                  {message}
                </div>
              ) : null}
              <Button
                onClick={updatePassword}
                disabled={loading || !allValid || !passwordsMatch}
                className="w-full"
              >
                {loading ? 'Updating…' : 'Update Password'}
              </Button>
            </div>
          ) : null}

          {step === 'done' ? (
            <div className="space-y-4">
              {message ? (
                <div className="text-sm text-primary">{message}</div>
              ) : null}
              <Button
                onClick={() => navigate('/admin/login', { replace: true })}
                className="w-full"
              >
                Go to Login
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};
