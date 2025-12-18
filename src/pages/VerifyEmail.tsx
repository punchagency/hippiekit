import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifyEmail } from '../lib/auth';
import { AlertCircle, CheckCircle2, Loader2, Smartphone } from 'lucide-react';
import { SafeAreaLayout } from '@/components/layouts/SafeAreaLayout';
import { Capacitor } from '@capacitor/core';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  );
  const [message, setMessage] = useState('Verifying your email...');
  const [showAppPrompt, setShowAppPrompt] = useState(false);

  // Check if we're on mobile web (not the native app)
  const isMobileWeb =
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) &&
    !Capacitor.isNativePlatform();

  useEffect(() => {
    const verify = async () => {
      try {
        const token = searchParams.get('token');

        if (!token) {
          setStatus('error');
          setMessage('No verification token provided');
          return;
        }

        // If on mobile web, try to open the app first
        if (isMobileWeb) {
          console.log('📱 Mobile web detected, attempting to open app...');
          setMessage('Opening Hippiekit app...');

          // Try to open the app with deep link
          const deepLink = `hippiekit://verify-email?token=${token}`;
          window.location.href = deepLink;

          // Wait 2 seconds, if app didn't open, verify via web
          setTimeout(async () => {
            console.log('⏱️ Timeout reached, proceeding with web verification');
            setShowAppPrompt(true);
            await performVerification(token);
          }, 2000);

          return;
        }

        // On desktop or already in app, verify directly
        await performVerification(token);
      } catch (error) {
        setStatus('error');
        setMessage(
          error instanceof Error ? error.message : 'An error occurred'
        );
      }
    };

    const performVerification = async (token: string) => {
      try {
        setMessage('Verifying your email...');
        const result = await verifyEmail(token);

        if (result.success) {
          setStatus('success');
          setMessage('Email verified successfully!');

          // Redirect to login after 2 seconds with verified parameter
          setTimeout(() => {
            navigate('/signin?verified=true', { replace: true });
          }, 2000);
        } else {
          setStatus('error');
          setMessage(result.message || 'Email verification failed');
        }
      } catch (error) {
        setStatus('error');
        setMessage(
          error instanceof Error ? error.message : 'An error occurred'
        );
      }
    };

    verify();
  }, [searchParams, navigate, isMobileWeb]);

  const handleOpenApp = () => {
    const token = searchParams.get('token');
    if (token) {
      window.location.href = `hippiekit://verify-email?token=${token}`;
    }
  };

  return (
    <SafeAreaLayout>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="w-12 h-12 mx-auto mb-4 text-purple-600 animate-spin" />
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Verifying Email
              </h1>
              <p className="text-gray-600">{message}</p>

              {showAppPrompt && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-3">
                    If you have the Hippiekit app installed:
                  </p>
                  <button
                    onClick={handleOpenApp}
                    className="flex items-center justify-center gap-2 w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Smartphone className="w-5 h-5" />
                    Open in Hippiekit App
                  </button>
                </div>
              )}
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-600" />
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Success!
              </h1>
              <p className="text-gray-600 mb-4">{message}</p>
              <p className="text-sm text-gray-500">
                Redirecting to login in 2 seconds...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-600" />
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Verification Failed
              </h1>
              <p className="text-gray-600 mb-4">{message}</p>
              <button
                onClick={() => navigate('/signin', { replace: true })}
                className="w-full mt-4 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition"
              >
                Back to Sign In
              </button>
            </>
          )}
        </div>
      </div>
    </SafeAreaLayout>
  );
}
