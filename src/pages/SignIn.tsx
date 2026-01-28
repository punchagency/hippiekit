import { Button } from '@/components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  UserIcon,
  LockIcon,
  GoogleIcon,
  FacebookIcon,
  EyeIcon,
  EyeOffIcon,
} from '@/assets/icons';
// Placeholder for future social sign-in (Better Auth removed)
// Remove any stale imports from deprecated auth client
// Native Google sign-in now handled via androidAuth.ts if needed
import { TitleSubtitle } from '@/components/auth/title-subtitle';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { signInWithGoogle } from '@/lib/auth';

const formSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

function SignIn() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showVerificationSuccess, setShowVerificationSuccess] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();

  // Check if user was redirected after email verification or password reset
  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      setShowVerificationSuccess(true);
      // Auto-hide the success message after 10 seconds
      const timer = setTimeout(() => {
        setShowVerificationSuccess(false);
      }, 10000);
      return () => clearTimeout(timer);
    }

    if (searchParams.get('reset') === 'success') {
      setShowVerificationSuccess(true);
      // Auto-hide the success message after 10 seconds
      const timer = setTimeout(() => {
        setShowVerificationSuccess(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
      // Navigation is handled by OAuth callback or native flow
    } catch (err) {
      console.error('Google sign-in error:', err);
      setError('Failed to sign in with Google. Please try again.');
      setLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      // You can add Firebase Facebook auth here later
      setLoading(false);
      setError('Facebook login is not yet implemented with Firebase');
    } catch (err) {
      console.error('Facebook sign-in error:', err);
      setLoading(false);
      setError('Failed to sign in with Facebook. Please try again.');
    }
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      setLoading(true);
      setError('');
      await login(data.email, data.password);

      // Navigate to home page on success
      navigate('/');
    } catch (error: unknown) {
      console.log(error);
      setLoading(false);

      // Type guard for axios error
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as {
          response?: {
            data?: { requiresVerification?: boolean; message?: string };
          };
        };

        // Handle email verification requirement
        if (axiosError.response?.data?.requiresVerification) {
          navigate('/otp-verification', { state: { email: data.email } });
          return;
        }

        // Display error message
        setError(
          axiosError.response?.data?.message ||
          'Failed to sign in. Please try again.'
        );
      } else {
        setError('Failed to sign in. Please try again.');
      }
    }
  }

  return (
    <section className="px-5 font-family-poppins text-[#222] min-h-full">
      <TitleSubtitle title="Login" subtitle="Login to get started" />

      {showVerificationSuccess && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-start gap-3">
          <svg
            className="w-5 h-5 shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <p className="font-semibold">
              {searchParams.get('verified') === 'true'
                ? 'Email verified successfully!'
                : 'Password reset successfully!'}
            </p>
            <p className="mt-1">You can now log in with your credentials.</p>
          </div>
          <button
            onClick={() => setShowVerificationSuccess(false)}
            className="ml-auto text-green-700 hover:text-green-900"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <form
        id="login-form"
        className="mt-6"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FieldGroup>
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <InputGroup className="rounded-none">
                  <InputGroupAddon>
                    <InputGroupText>
                      <UserIcon />
                    </InputGroupText>
                  </InputGroupAddon>
                  <InputGroupInput
                    {...field}
                    id="email"
                    type="email"
                    aria-invalid={fieldState.invalid}
                    placeholder="Enter Email"
                    autoComplete="email"
                    disabled={loading}
                  />
                </InputGroup>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Link
            to="/reset-password"
            className="flex justify-end text-sm text-gray-600 hover:text-primary"
          >
            Forgot Password?
          </Link>

          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <InputGroup className="rounded-none">
                  <InputGroupAddon>
                    <InputGroupText>
                      <LockIcon />
                    </InputGroupText>
                  </InputGroupAddon>
                  <InputGroupInput
                    {...field}
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    aria-invalid={fieldState.invalid}
                    placeholder="Enter Password"
                    autoComplete="current-password"
                    disabled={loading}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupText
                      className="cursor-pointer"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeIcon /> : <EyeOffIcon />}
                    </InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
      </form>

      <Button
        className="w-full text-[#FFF] mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
        form="login-form"
        type="submit"
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Signing in...
          </span>
        ) : (
          'Login'
        )}
      </Button>

      <div className="mt-6 pb-8">
        <div className="flex flex-col justify-center gap-3 items-center">
          <p className="text-gray-500">OR</p>
          <p className="font-medium text-sm">Sign in with</p>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-5 h-[42px] bg-white rounded-full font-medium text-sm shadow-sm hover:shadow-md transition-shadow border border-gray-200 disabled:opacity-50"
            >
              <GoogleIcon /> Google
            </button>
            <button
              type="button"
              onClick={handleFacebookSignIn}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-5 h-[42px] bg-white rounded-full font-medium text-sm shadow-sm hover:shadow-md transition-shadow border border-gray-200 disabled:opacity-50"
            >
              <FacebookIcon /> Facebook
            </button>
          </div>

          <div className="mt-4 text-sm">
            <span className="text-gray-600">Don't have an account? </span>
            <Link
              to="/signup"
              className="font-semibold hover:text-primary"
            >
              Create account
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SignIn;
