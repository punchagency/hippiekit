import { createAuthClient } from 'better-auth/react';
import { emailOTPClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000', // Your backend URL
  plugins: [emailOTPClient()],
});

export const { signIn, signUp, signOut, useSession } = authClient;

// OAuth helper methods
export const signInWithGoogle = () => {
  const appUrl = import.meta.env.VITE_APP_URL || 'http://localhost:5173';
  return signIn.social({
    provider: 'google',
    callbackURL: appUrl, // Redirects to home page after successful authentication
  });
};

export const signInWithFacebook = () => {
  const appUrl = import.meta.env.VITE_APP_URL || 'http://localhost:5173';
  return signIn.social({
    provider: 'facebook',
    callbackURL: appUrl, // Redirects to home page after successful authentication
  });
};
