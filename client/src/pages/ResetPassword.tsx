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
import { MailIcon } from '@/assets/icons';
import { TitleSubtitle } from '@/components/auth/title-subtitle';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PasswordResetOtpModal from '@/components/PasswordResetOtpModal';

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export default function ResetPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      setError('');

      // Use custom auth API to send OTP
      await forgotPassword(data.email);

      // Show OTP modal on success
      setUserEmail(data.email);
      setShowOtpModal(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to send reset code. Please try again.'
      );
      console.error('Reset password error:', err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleModalClose = () => {
    setShowOtpModal(false);
  };

  const handleOtpVerified = async (otp: string) => {
    // Navigate to password confirmation page with OTP token
    navigate('/reset-password/confirm', {
      state: {
        email: userEmail,
        otp: otp,
      },
    });
  };

  return (
    <section className="mt-20 mx-[25.45px] font-family-poppins text-[#222] pb-20">
      <TitleSubtitle
        title="Reset Password"
        subtitle="Enter email address and a verification code will be sent to you."
      />

      {
        <>
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form
            id="reset-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-8"
          >
            <FieldGroup className="relative">
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <InputGroup className="rounded-none">
                      <InputGroupAddon>
                        <InputGroupText>
                          <MailIcon />
                        </InputGroupText>
                      </InputGroupAddon>
                      <InputGroupInput
                        {...field}
                        id="email"
                        type="email"
                        aria-invalid={fieldState.invalid}
                        placeholder="Enter Email"
                        autoComplete="email"
                        disabled={isLoading}
                      />
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
            className="w-full text-[#FFF] mt-[323.95px] disabled:opacity-50 disabled:cursor-not-allowed"
            form="reset-form"
            type="submit"
            disabled={isLoading}
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
                Sending...
              </span>
            ) : (
              'Request Password Reset'
            )}
          </Button>
        </>
      }

      <div className="mt-10 flex justify-center">
        <p>
          Remember Password?{' '}
          <Link to="/signin" className="font-semibold hover:text-[#7B61FF]">
            Login
          </Link>
        </p>
      </div>

      {/* OTP Verification Modal */}
      <PasswordResetOtpModal
        isOpen={showOtpModal}
        onClose={handleModalClose}
        onVerified={handleOtpVerified}
        email={userEmail}
      />
    </section>
  );
}
