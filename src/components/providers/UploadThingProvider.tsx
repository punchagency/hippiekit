import { Toaster as UploadThingToaster } from 'sonner';

export function UploadThingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <UploadThingToaster position="top-center" />
      {children}
    </>
  );
}
