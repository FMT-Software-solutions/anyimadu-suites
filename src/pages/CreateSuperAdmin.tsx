import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CopyButton } from '@/components/CopyButton';

const SPECIAL_EMAIL = 'anyimadudev@gmail.com';

export const CreateSuperAdmin = () => {
  const navigate = useNavigate();
  const [checkingSession, setCheckingSession] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Promote states
  const [promoting, setPromoting] = useState(false);
  const [promoteSuccess, setPromoteSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

  // Create user states
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createdPassword, setCreatedPassword] = useState<string | null>(null);
  const [createMessage, setCreateMessage] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const s = data.session;
      if (!s) {
        navigate(
          '/admin/login?redirect=' +
            encodeURIComponent('/admin/create-super-admin')
        );
        return;
      }
      const email = s.user?.email || '';
      const allowedRoles = ['admin', 'super_admin'];
      const am: any = s.user?.app_metadata;
      const um: any = s.user?.user_metadata;
      const r = am?.role ?? am?.roles ?? um?.role ?? um?.roles;
      const isAdmin = Array.isArray(r)
        ? r.some((x: any) => allowedRoles.includes(String(x)))
        : allowedRoles.includes(String(r));
      setAllowed(email.toLowerCase() === SPECIAL_EMAIL || isAdmin);
      setCheckingSession(false);
    };
    init();
  }, [navigate]);

  const handleRedirect = useCallback(() => {
    navigate(
      '/admin/login?redirect=' + encodeURIComponent('/admin?tab=dashboard'),
      { replace: true }
    );
  }, [navigate]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (promoteSuccess && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((c) => c - 1);
      }, 1000);
    } else if (promoteSuccess && countdown === 0) {
      handleRedirect();
    }
    return () => clearInterval(timer);
  }, [promoteSuccess, countdown, handleRedirect]);

  const promote = async () => {
    setError(null);
    setPromoteSuccess(false);
    setPromoting(true);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        setError('No session');
        return;
      }
      const res = await fetch(
        `${supabaseUrl}/functions/v1/promote-super-admin`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: supabaseKey,
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({}),
        }
      );
      const out = await res.json();
      if (!res.ok) {
        setError(out?.error ?? 'Failed to promote');
        return;
      }
      // Success
      await supabase.auth.signOut();
      setPromoteSuccess(true);
      setCountdown(5);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPromoting(false);
    }
  };

  const createAdminUser = async () => {
    setCreateError(null);
    setCreateMessage(null);
    setCreatedPassword(null);
    setCreateLoading(true);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        setCreateError('No session');
        return;
      }
      const res = await fetch(
        `${supabaseUrl}/functions/v1/create-super-admin-user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: supabaseKey,
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: newEmail,
            name: newName,
            loginUrl: window.location.origin + '/admin/login',
          }),
        }
      );
      const out = await res.json();
      if (!res.ok || out?.error) {
        setCreateError(out?.error ?? 'Failed to create user');
        return;
      }
      setCreatedPassword(out?.password ?? null);
      setCreateMessage(
        'Super admin user created. Password emailed and shown below.'
      );
      setNewEmail('');
      setNewName('');
    } catch (e) {
      setCreateError((e as Error).message);
    } finally {
      setCreateLoading(false);
    }
  };

  if (checkingSession) return null;
  if (!allowed) {
    navigate(
      '/admin/login?reason=not_allowed&redirect=' +
        encodeURIComponent('/admin/create-super-admin'),
      { replace: true }
    );
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Super Admin</CardTitle>
        </CardHeader>
        <CardContent>
          {promoteSuccess ? (
            <div className="space-y-4 text-center">
              <div className="text-green-600 font-medium">
                Role updated to super_admin successfully!
              </div>
              <div className="text-sm text-muted-foreground">
                You have been signed out to apply changes.
              </div>
              <div className="text-sm font-bold text-primary">
                Redirecting to login in {countdown} seconds...
              </div>
              <Button onClick={handleRedirect} className="w-full">
                Go to Login Now
              </Button>
            </div>
          ) : (
            <>
              {error ? (
                <div className="text-sm text-destructive mb-4">{error}</div>
              ) : null}
              <Button onClick={promote} disabled={promoting} className="w-full">
                {promoting ? 'Working…' : 'Promote me to super_admin'}
              </Button>

              <div className="mt-6 border-t pt-4 space-y-3">
                <div className="text-sm font-medium">
                  Create Super Admin User
                </div>
                <div>
                  <label className="text-sm">Full Name</label>
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm">Email</label>
                  <Input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                </div>
                {createError ? (
                  <div className="text-sm text-destructive">{createError}</div>
                ) : null}
                {createMessage ? (
                  <div className="text-sm text-primary">{createMessage}</div>
                ) : null}
                <Button
                  onClick={createAdminUser}
                  disabled={createLoading || !newEmail || !newName}
                  className="w-full"
                >
                  {createLoading ? 'Creating…' : 'Create Super Admin User'}
                </Button>
                {createdPassword ? (
                  <div className="flex items-center justify-between bg-muted rounded px-3 py-2">
                    <div className="text-sm font-mono">{createdPassword}</div>
                    <CopyButton text={createdPassword} />
                  </div>
                ) : null}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
