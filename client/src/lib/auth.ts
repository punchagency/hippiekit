import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: 'http://localhost:8000', // Your backend URL
});

export const { signIn, signUp, signOut, useSession } = authClient;

// OAuth helper methods
export const signInWithGoogle = () => {
  return signIn.social({
    provider: 'google',
    callbackURL: '/',
  });
};

export const signInWithFacebook = () => {
  return signIn.social({
    provider: 'facebook',
    callbackURL: '/',
  });
};
