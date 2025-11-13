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
  MailIcon,
  PhoneIcon,
  LockIcon,
  GoogleIcon,
  FacebookIcon,
  EyeIcon,
} from '@/assets/icons';
import { TitleSubtitle } from '@/components/auth/title-subtitle';
import { useAuth } from '@/context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { signInWithGoogle, signInWithFacebook } from '@/lib/auth';
import EmailVerificationModal from '@/components/EmailVerificationModal';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

function SignUp() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const handleGoogleSignUp = async () => {
    try {
      setError('');
      setIsLoading(true);
      await signInWithGoogle();
      // Session will be checked when redirected back
    } catch {
      setIsLoading(false);
      setError('Failed to sign up with Google. Please try again.');
    }
  };

  const handleFacebookSignUp = async () => {
    try {
      setError('');
      setIsLoading(true);
      await signInWithFacebook();
      // Session will be checked when redirected back
    } catch {
      setIsLoading(false);
      setError('Failed to sign up with Facebook. Please try again.');
    }
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      setError('');

      await registerUser({
        username: data.name,
        email: data.email,
        password: data.password,
        phoneNumber: data.phone,
      });

      // Show email verification modal
      setRegisteredEmail(data.email);
      setShowEmailModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  }

  const handleModalClose = () => {
    setShowEmailModal(false);
    // Optionally redirect to sign-in page
    navigate('/signin');
  };
  return (
    <section className="mt-20 mx-[25.45px] font-family-poppins text-[#222]">
      <TitleSubtitle title="Create Account" subtitle="Sign up to get started" />

      <div>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form
          id="signup-form"
          className="mt-10"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="name">Name</FieldLabel>
                  <InputGroup className="rounded-none">
                    <InputGroupAddon>
                      <InputGroupText>
                        <UserIcon />
                      </InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput
                      {...field}
                      id="name"
                      type="text"
                      aria-invalid={fieldState.invalid}
                      placeholder="Enter First and Last Name"
                      autoComplete="off"
                    />
                  </InputGroup>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
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
                      autoComplete="off"
                    />
                  </InputGroup>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="phone"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel className="text-[14px]" htmlFor="phone">
                    Phone Number (optional)
                  </FieldLabel>
                  <InputGroup className="rounded-none">
                    <InputGroupAddon>
                      <InputGroupText>
                        <PhoneIcon />
                      </InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput
                      {...field}
                      id="phone"
                      type="tel"
                      aria-invalid={fieldState.invalid}
                      placeholder="Add Phone Number"
                      autoComplete="off"
                    />
                  </InputGroup>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
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
                      autoComplete="off"
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
          className="w-full text-[#FFF] mt-11"
          form="signup-form"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </div>

      <div className="mt-10">
        <div className="flex flex-col justify-center gap-4 items-center">
          <p>OR</p>
          <p className="font-medium">Sign up with</p>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleGoogleSignUp}
              className="flex items-center justify-center gap-4 w-[122px] h-[45px] bg-[#FFFFFF] rounded-[51px] font-medium shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
            >
              <GoogleIcon /> Google
            </button>
            <button
              type="button"
              onClick={handleFacebookSignUp}
              className="flex items-center justify-center gap-4 w-[122px] h-[45px] bg-[#FFFFFF] rounded-[51px] font-medium shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
            >
              <FacebookIcon /> Facebook
            </button>
          </div>

          <div className="mt-10">
            Already have an account?{' '}
            <Link className="font-semibold" to="/signin">
              Login
            </Link>
          </div>
        </div>
      </div>

      {/* Email Verification Modal */}
      <EmailVerificationModal
        isOpen={showEmailModal}
        onClose={handleModalClose}
        email={registeredEmail}
      />
    </section>
  );
}

export default SignUp;
