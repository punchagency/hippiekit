import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface PublicRouteProps {
  children: React.ReactNode;
}

export const PublicRoute = ({ children }: PublicRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-primary text-xl">Loading...</div>
      </div>
    );
  }

  // Special case: Allow /verify-email to proceed even if authenticated
  // This handles deep links from email verification on native app
  const isVerifyEmailPage = location.pathname === '/verify-email';
  const hasVerificationToken = new URLSearchParams(location.search).has(
    'token'
  );

  if (isVerifyEmailPage && hasVerificationToken) {
    // Always allow verify-email with token, regardless of auth status
    return <>{children}</>;
  }

  // If user is authenticated, redirect to home page
  if (user) {
    return <Navigate to="/" replace />;
  }

  // If not authenticated, allow access to public routes
  return <>{children}</>;
};
