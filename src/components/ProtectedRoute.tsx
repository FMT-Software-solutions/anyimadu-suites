import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

interface Props {
  children: React.ReactNode;
}

const SPECIAL_EMAIL = 'anyimadudev@gmail.com';

export const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [firstTime, setFirstTime] = useState(false);
  const [isSpecialUser, setIsSpecialUser] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      setIsAuthed(Boolean(session));

      const email = session?.user?.email;
      const isSpecial = email?.toLowerCase() === SPECIAL_EMAIL;
      setIsSpecialUser(isSpecial);

      const allowed = [
        'super_admin',
        'admin',
        'editor',
        'sales_rep',
        'read_only',
      ];
      const am: any = session?.user?.app_metadata;
      const um: any = session?.user?.user_metadata;
      const r = am?.role ?? am?.roles ?? um?.role ?? um?.roles;
      const ok = Array.isArray(r)
        ? r.some((x: any) => allowed.includes(String(x)))
        : allowed.includes(String(r));
      const isAdminType = (am?.user_type ?? um?.user_type) === 'admin';
      setIsAdmin(Boolean(ok && isAdminType));
      setFirstTime(Boolean(um?.first_time_login === true));
      setLoading(false);
    };
    init();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthed(Boolean(session));

      const email = session?.user?.email;
      const isSpecial = email?.toLowerCase() === SPECIAL_EMAIL;
      setIsSpecialUser(isSpecial);

      const allowed = [
        'super_admin',
        'admin',
        'editor',
        'sales_rep',
        'read_only',
      ];
      const am: any = session?.user?.app_metadata;
      const um: any = session?.user?.user_metadata;
      const r = am?.role ?? am?.roles ?? um?.role ?? um?.roles;
      const ok = Array.isArray(r)
        ? r.some((x: any) => allowed.includes(String(x)))
        : allowed.includes(String(r));
      const isAdminType = (am?.user_type ?? um?.user_type) === 'admin';
      setIsAdmin(Boolean(ok && isAdminType));
      setFirstTime(Boolean(um?.first_time_login === true));
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  if (loading) return null;

  if (!isAuthed) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/admin/login?redirect=${redirect}`} replace />;
  }

  // Handle Special User logic
  if (isSpecialUser && !isAdmin) {
    // If they are trying to go to create-super-admin, let them pass if that route is protected by this component
    // If they hit /admin/* (which uses ProtectedRoute), they should be redirected.
    return <Navigate to="/admin/create-super-admin" replace />;
  }

  if (
    isAdmin &&
    firstTime &&
    !location.pathname.startsWith('/admin/change-password')
  ) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return (
      <Navigate to={`/admin/change-password?redirect=${redirect}`} replace />
    );
  }

  if (!isAdmin) {
    // If not admin and not special user, redirect to home
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
