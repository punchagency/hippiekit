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
import { LockIcon, EyeIcon } from '@/assets/icons';
import { TitleSubtitle } from '@/components/auth/title-subtitle';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const formSchema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    confirmPassword: z
      .string()
      .min(6, 'Password must be at least 6 characters long'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export default function ResetPasswordConfirm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { resetPassword } = useAuth();

  // Get email and OTP from router state (passed from OTP modal)
  const email = location.state?.email;
  const otp = location.state?.otp;

  useEffect(() => {
    if (!email || !otp) {
      setError(
        'Invalid or missing verification code. Please request a new password reset.'
      );
    }
  }, [email, otp]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    if (!email || !otp) {
      setError('Invalid or missing verification code.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      // Use custom auth API to reset password
      await resetPassword(email, otp, data.password);

      // Redirect to signin with success message
      navigate('/signin?reset=success');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to reset password. The code may have expired. Please request a new one.'
      );
      console.error('Reset password error:', err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="mt-20 mx-[25.45px] font-family-poppins text-[#222] pb-20">
      <TitleSubtitle
        title="Create New Password"
        subtitle="Create a new password to access your account."
      />

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <form
        id="reset-confirm-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="mt-8"
      >
        <FieldGroup className="space-y-6">
          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="password">New Password</FieldLabel>
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
                    placeholder="Enter New Password"
                    autoComplete="new-password"
                    disabled={isLoading || !email || !otp}
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

          <Controller
            name="confirmPassword"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="confirmPassword">
                  Confirm Password
                </FieldLabel>
                <InputGroup className="rounded-none">
                  <InputGroupAddon>
                    <InputGroupText>
                      <LockIcon />
                    </InputGroupText>
                  </InputGroupAddon>
                  <InputGroupInput
                    {...field}
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    aria-invalid={fieldState.invalid}
                    placeholder="Confirm New Password"
                    autoComplete="new-password"
                    disabled={isLoading || !email || !otp}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupText
                      className="cursor-pointer"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
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
        className="w-full text-[#FFF] mt-[250px] disabled:opacity-50 disabled:cursor-not-allowed"
        form="reset-confirm-form"
        type="submit"
        disabled={isLoading || !email || !otp}
      >
        {isLoading ? (
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
            Resetting...
          </span>
        ) : (
          'Reset Password'
        )}
      </Button>

      <div className="mt-10 flex justify-center">
        <p>
          Remember Password?{' '}
          <Link to="/signin" className="font-semibold hover:text-[#7B61FF]">
            Login
          </Link>
        </p>
      </div>
    </section>
  );
}
