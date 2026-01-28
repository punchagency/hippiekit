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
  EyeOffIcon,
} from '@/assets/icons';
import { TitleSubtitle } from '@/components/auth/title-subtitle';
import { useAuth } from '@/context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { signInWithGoogle } from '@/lib/auth';
import EmailVerificationModal from '@/components/EmailVerificationModal';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  email: z.string().email('Invalid email address'),
  phone: z
    .string()
    .refine(
      (val) => !val || (val.length >= 10 && val.length <= 15),
      'Phone number must be between 10 and 15 digits if provided'
    )
    .refine(
      (val) => !val || /^\+?[0-9]*$/.test(val),
      'Phone number can only contain digits and optional +'
    ),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long.' })
    .max(100, { message: 'Password cannot exceed 100 characters.' })
    .regex(/[A-Z]/, {
      message: 'Password must contain at least one uppercase letter.',
    })
    .regex(/[a-z]/, {
      message: 'Password must contain at least one lowercase letter.',
    })
    .regex(/[0-9]/, { message: 'Password must contain at least one number.' })
    .regex(/[^a-zA-Z0-9]/, {
      message: 'Password must contain at least one special character.',
    }),
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
      // Navigation handled by OAuth callback or native flow
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Failed to sign up with Google.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookSignUp = async () => {
    // Placeholder – native Facebook sign-in not implemented.
    setError('Facebook sign-up is not available yet.');
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
        name: data.name,
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
    <section className="px-5 font-family-poppins text-[#222] min-h-full">
      <TitleSubtitle
        title="Create Account"
        subtitle="Sign up to get started"
      />

      <div>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <form
          id="signup-form"
          className="mt-6"
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
          className="w-full text-[#FFF] mt-6"
          form="signup-form"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </div>

      <div className="mt-6 pb-8">
        <div className="flex flex-col justify-center gap-3 items-center">
          <p className="text-gray-500">OR</p>
          <p className="font-medium text-sm">Sign up with</p>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 px-5 h-[42px] bg-white rounded-full font-medium text-sm shadow-sm hover:shadow-md transition-shadow border border-gray-200 disabled:opacity-50"
            >
              <GoogleIcon /> Google
            </button>
            <button
              type="button"
              onClick={handleFacebookSignUp}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 px-5 h-[42px] bg-white rounded-full font-medium text-sm shadow-sm hover:shadow-md transition-shadow border border-gray-200 disabled:opacity-50"
            >
              <FacebookIcon /> Facebook
            </button>
          </div>

          <div className="mt-4 text-sm">
            <span className="text-gray-600">Already have an account? </span>
            <Link className="font-semibold hover:text-primary" to="/signin">
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
