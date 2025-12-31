import { generateReactHelpers } from '@uploadthing/react';

// Generate helpers without type constraint since backend is separate
// The router type is defined on the backend and will be validated at runtime
export const { useUploadThing, uploadFiles } = generateReactHelpers({
  url:
    import.meta.env.VITE_UPLOADTHING_URL ||
    'http://localhost:8000/api/uploadthing',
});
