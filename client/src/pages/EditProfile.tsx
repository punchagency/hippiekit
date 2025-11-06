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

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  email: z.email('Invalid email address'),
  username: z.string().min(2, 'Username must be at least 2 characters long'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits long'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

const EditProfile = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      username: '',
      phone: '',
      password: '',
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    //Do something witht the form values
    console.log(data);
  }
  return (
    <section className="z-10 font-family-roboto mx-[24.5px]">
      <div className="h-[165px] flex justify-center gap-2.5 pt-[49px]">
        <UserIcon height="22" width="19.097" />
        <p className="font-family-segoe text-primary text-[20px]">
          Edit Profile
        </p>
      </div>
      <div className="w-[100px] h-[100px] rounded-[63px] border-[6px] border-[#FFF] object-cover mx-auto mt-[-50px] overflow-hidden">
        <img src={profileImgSample} alt="Profile" />
      </div>

      <p className="font-family-segoe text-center text-primary text-[18px] font-extrabold">
        Carrie Lee
      </p>
      <p className="text-center text-[16px]">Founder</p>

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
              name="username"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="username">Username</FieldLabel>
                  <InputGroup className="rounded-none">
                    <InputGroupAddon>
                      <InputGroupText>
                        <UserIcon />
                      </InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput
                      {...field}
                      id="username"
                      type="text"
                      aria-invalid={fieldState.invalid}
                      placeholder="carrie@1"
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
          </FieldGroup>
        </form>

        <Button
          className="w-full text-[#FFF] mt-11"
          form="edit-form"
          type="submit"
        >
          Save
        </Button>
      </div>
    </section>
  );
};

export default EditProfile;
