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

const formSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});
export default function ResetPassword() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    //Do something witht the form values
    console.log(data);
  }

  return (
    <section className="mt-20 mx-[25.45px] font-family-poppins text-[#222]">
      <TitleSubtitle
        title="Reset Password"
        subtitle="Enter email address and a link to reset your password will be sent to you."
      />

      <form onSubmit={form.handleSubmit(onSubmit)}>
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
        className="w-full text-[#FFF] mt-[323.95px]"
        form="login-form"
        type="submit"
      >
        Request Password Reset
      </Button>

      <div className="mt-[259.3px] flex justify-center">
        <p>
          Remember Password? <span className="font-semibold">Login</span>
        </p>
      </div>
    </section>
  );
}
