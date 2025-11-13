import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const { refreshSession } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Wait a moment for the server to set cookies
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Refresh the session to get user data
        await refreshSession();

        // Redirect to home page
        navigate('/', { replace: true });
      } catch (error) {
        console.error('OAuth callback error:', error);
        // If something fails, redirect to sign in
        navigate('/signin', { replace: true });
      }
    };

    handleCallback();
  }, [navigate, refreshSession]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
