import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifyEmail } from '../lib/auth';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { SafeAreaLayout } from '@/components/layouts/SafeAreaLayout';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  );
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const verify = async () => {
      try {
        const token = searchParams.get('token');

        if (!token) {
          setStatus('error');
          setMessage('No verification token provided');
          return;
        }

        const result = await verifyEmail(token);

        if (result.success) {
          setStatus('success');
          setMessage('Email verified successfully!');

          // Redirect to login after 2 seconds
          setTimeout(() => {
            navigate('/signin', { replace: true });
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
  }, [searchParams, navigate]);

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
