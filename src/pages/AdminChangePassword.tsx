import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, X, Info } from 'lucide-react';

export const AdminChangePassword = () => {
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate(
          '/admin/login?redirect=' +
            encodeURIComponent('/admin/change-password')
        );
      } else {
        setSessionChecked(true);
      }
    };
    check();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate(
          '/admin/login?redirect=' +
            encodeURIComponent('/admin/change-password')
        );
      } else {
        setSessionChecked(true);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

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

  const change = async () => {
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
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        setError('Auth session missing. Please try logging in again.');
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
        data: { first_time_login: false },
      });

      if (updateError) {
        throw updateError;
      }

      setMessage('Password updated. Please login again.');
      await supabase.auth.signOut();
      const redirect = sp.get('redirect');
      navigate(
        '/admin/login' +
          (redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''),
        { replace: true }
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (!sessionChecked) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent>
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
              <div className="text-sm text-primary font-medium">{message}</div>
            ) : null}

            <Button
              onClick={change}
              disabled={loading || !allValid || !passwordsMatch}
              className="w-full"
            >
              {loading ? 'Updating…' : 'Update Password'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
