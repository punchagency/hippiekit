import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface PublicRouteProps {
  children: React.ReactNode;
}

export const PublicRoute = ({ children }: PublicRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-primary text-xl">Loading...</div>
      </div>
    );
  }

  // If user is authenticated, redirect to home page
  if (user) {
    return <Navigate to="/" replace />;
  }

  // If not authenticated, allow access to public routes
  return <>{children}</>;
};
