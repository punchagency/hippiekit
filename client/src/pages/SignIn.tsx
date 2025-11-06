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
import { LockIcon, EyeIcon, UserIcon } from '@/assets/icons';
import { TitleSubtitle } from '@/components/auth/title-subtitle';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const formSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

function SignIn() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

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
    <section className="mt-12 sm:mt-20 mx-4 sm:mx-[25.45px] font-family-poppins text-[#222] pb-20">
      <TitleSubtitle title="Login" subtitle="Login to get started" />

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <div>
        <form
          id="login-form"
          className="mt-8 sm:mt-10"
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
              className="flex justify-end text-[#222] hover:text-[#7B61FF]"
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
                        <EyeIcon />
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
          className="w-full text-[#FFF] mt-32 sm:mt-[226.85px] disabled:opacity-50 disabled:cursor-not-allowed"
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
      </div>

      <div className="mt-8 sm:mt-10 flex justify-center text-sm sm:text-base">
        <Link to="/sign-up" className="text-[#222] hover:text-[#7B61FF]">
          Create account
        </Link>
      </div>
    </section>
  );
}

export default SignIn;
