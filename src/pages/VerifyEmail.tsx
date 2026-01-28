import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifyEmail } from '../lib/auth';
import { AlertCircle, CheckCircle2, Loader2, Smartphone } from 'lucide-react';
import { Capacitor } from '@capacitor/core';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  );
  const [message, setMessage] = useState('Verifying your email...');
  const [showAppPrompt, setShowAppPrompt] = useState(false);
  const hasVerifiedRef = useRef(false);

  // Check if we're on mobile web (not the native app) or desktop web
  const isMobileWeb =
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) &&
    !Capacitor.isNativePlatform();

  const isNativeApp = Capacitor.isNativePlatform();

  useEffect(() => {
    const verify = async () => {
      // Prevent multiple verification attempts using ref (persists across renders)
      if (hasVerifiedRef.current) {
        console.log('⚠️ Already verified, skipping duplicate attempt');
        return;
      }

      try {
        const token = searchParams.get('token');

        if (!token) {
          setStatus('error');
          setMessage('No verification token provided');
          return;
        }

        // Set ref immediately to prevent any duplicate attempts (even in Strict Mode)
        hasVerifiedRef.current = true;
        console.log('🔒 Verification locked, proceeding...');

        // If on native Android app, verify directly and redirect to app login
        if (isNativeApp) {
          console.log('📱 Native app detected, verifying directly...');
          await performVerification(token, 'native');
          return;
        }

        // If on mobile web, try to open the app first
        if (isMobileWeb) {
          console.log('📱 Mobile web detected, attempting to open app...');
          setMessage('Checking for Hippiekit app...');

          // Try to open the app with deep link
          const deepLink = `hippiekit://verify-email?token=${token}`;
          window.location.href = deepLink;

          // Wait 2 seconds, if app didn't open, verify via web
          setTimeout(async () => {
            console.log('⏱️ Timeout reached, proceeding with web verification');
            setShowAppPrompt(true);
            await performVerification(token, 'web');
          }, 2000);

          return;
        }

        // On desktop web, verify directly
        console.log('🌐 Desktop web verification starting...');
        await performVerification(token, 'web');
      } catch (error) {
        setStatus('error');
        setMessage(
          error instanceof Error ? error.message : 'An error occurred'
        );
      }
    };

    const performVerification = async (
      token: string,
      platform: 'web' | 'native'
    ) => {
      try {
        setMessage('Verifying your email...');
        const result = await verifyEmail(token);

        if (result.success) {
          setStatus('success');

          // Different messaging for web vs native
          if (platform === 'native') {
            setMessage('Email verified successfully! Taking you to login...');
            // Redirect to login page after 2 seconds on native
            setTimeout(() => {
              navigate('/signin', { replace: true });
            }, 2000);
          } else {
            setMessage(
              'Verification successful! You can now proceed to the login page to sign in.'
            );
            // No automatic redirect on web - user must click button
          }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  const handleOpenApp = () => {
    const token = searchParams.get('token');
    if (token) {
      window.location.href = `hippiekit://verify-email?token=${token}`;
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center bg-linear-to-br from-purple-50 to-blue-50 px-4">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 mx-auto mb-4 text-purple-600 animate-spin" />
            <h1 className="text-xl font-bold text-gray-800 mb-2">
              Verifying Email
            </h1>
            <p className="text-gray-600 text-sm">{message}</p>

            {showAppPrompt && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-3">
                  Have the Hippiekit app?
                </p>
                <button
                  onClick={handleOpenApp}
                  className="flex items-center justify-center gap-2 w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Smartphone className="w-5 h-5" />
                  Open in Hippiekit App
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  Verifying via web...
                </p>
              </div>
            )}
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="w-14 h-14 mx-auto mb-4 text-green-600" />
            <h1 className="text-xl font-bold text-gray-800 mb-2">
              Email Verified!
            </h1>
            <p className="text-gray-600 text-sm mb-4">{message}</p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-green-700">
                {isNativeApp
                  ? 'Your account has been successfully verified. You are now logged in and can access all features of Hippiekit.'
                  : 'Your account has been successfully verified. Please go back to the login page and sign in with your credentials to access all features.'}
              </p>
            </div>
            <p className="text-sm text-gray-500">
              {isNativeApp
                ? 'Redirecting to app in 2 seconds...'
                : 'Click the button below to proceed to the login page.'}
            </p>
            <button
              onClick={() =>
                navigate(isNativeApp ? '/' : '/signin?verified=true', {
                  replace: true,
                })
              }
              className="w-full mt-4 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition font-medium"
            >
              {isNativeApp ? 'Continue to App' : 'Sign In Now'}
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle className="w-14 h-14 mx-auto mb-4 text-red-600" />
            <h1 className="text-xl font-bold text-gray-800 mb-2">
              Verification Failed
            </h1>
            <p className="text-gray-600 text-sm mb-4">{message}</p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-700">
                {message.includes('expired')
                  ? 'Your verification link has expired. Please request a new one.'
                  : 'There was a problem verifying your email. Please try again or contact support.'}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate('/signup', { replace: true })}
                className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition font-medium"
              >
                Request New Verification Link
              </button>
              <button
                onClick={() => navigate('/signin', { replace: true })}
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Back to Sign In
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
