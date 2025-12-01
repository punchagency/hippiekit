import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div
          className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"
          style={{ borderColor: '#650084', borderTopColor: 'transparent' }}
        ></div>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};
