import { MailIcon, PhoneIcon, UserIcon } from '@/assets/icons';
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
import profileImgSample from '@/assets/profileImgSample.jpg';
import { Button } from '@/components/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  email: z.email('Invalid email address'),
  phoneNumber: z.string().optional(),
  image: z.string().optional(),
});

const EditProfile = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profileImage, setProfileImage] = useState<string>('');
  const [imgError, setImgError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phoneNumber: '',
      image: '',
    },
  });

  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        image: user.profileImage || '',
      });
      setProfileImage(user.profileImage || '');
    }
  }, [user, form]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      // Convert to base64 for preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfileImage(base64String);
        form.setValue('image', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');

      // Update profile using custom auth API
      await updateProfile({
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
        profileImage: data.image || undefined,
      });

      setSuccess('Profile updated successfully!');

      // Redirect to profile page after 2 seconds
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to update profile. Please try again.'
      );
      console.error('Update profile error:', err);
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <section className="z-10 font-family-roboto mx-[24.5px] pb-10">
      <div className="h-[165px] flex justify-center gap-2.5 pt-[49px]">
        <UserIcon height="22" width="19.097" />
        <p className="font-family-segoe text-primary text-[20px]">
          Edit Profile
        </p>
      </div>

      <div className="relative w-fit mx-auto mt-[-50px]">
        <div className="w-[100px] h-[100px] rounded-[63px] border-[6px] border-[#FFF] object-cover overflow-hidden">
          <img
            src={imgError || !profileImage ? profileImgSample : profileImage}
            alt="Profile"
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        </div>
        <button
          type="button"
          onClick={handleImageClick}
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-[30px] h-[30px] bg-white rounded-full flex items-center justify-center cursor-pointer shadow-md"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#650084"
            strokeWidth="2"
          >
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
            <circle cx="12" cy="13" r="4"></circle>
          </svg>
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
      />

      <p className="font-family-segoe text-center text-primary text-[18px] font-extrabold mt-3">
        {user?.name || 'User'}
      </p>
      <p className="text-center text-[16px] text-gray-600">{user?.email}</p>

      {/* Success Message */}
      {success && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <div>
        <form
          id="edit-form"
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
                      autoComplete="name"
                      disabled={isLoading}
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
                      autoComplete="email"
                    />
                  </InputGroup>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="phoneNumber"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel className="text-[14px]" htmlFor="phoneNumber">
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
                      id="phoneNumber"
                      type="tel"
                      aria-invalid={fieldState.invalid}
                      placeholder="Add Phone Number"
                      autoComplete="tel"
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
          className="w-full text-[#FFF] mt-11 disabled:opacity-50 disabled:cursor-not-allowed"
          form="edit-form"
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
              Saving...
            </span>
          ) : (
            'Save'
          )}
        </Button>
      </div>
    </section>
  );
};

export default EditProfile;
