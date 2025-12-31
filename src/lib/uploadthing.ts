import { generateReactHelpers } from '@uploadthing/react';
import type { OurFileRouter } from '../../../backend/routes/uploadthing';

export const { useUploadThing, uploadFiles } =
  generateReactHelpers<OurFileRouter>({
    url:
      import.meta.env.VITE_UPLOADTHING_URL ||
      'http://localhost:8000/api/uploadthing',
  });
