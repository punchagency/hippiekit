import { SocialLogin } from '@capgo/capacitor-social-login';
import type { GoogleLoginResponseOnline } from '@capgo/capacitor-social-login';
import { Capacitor } from '@capacitor/core';
import { googleSignIn } from './authAPI';

// Initialize Google Auth for Android/iOS
export const initializeGoogleAuth = async () => {
  if (
    Capacitor.getPlatform() === 'android' ||
    Capacitor.getPlatform() === 'ios'
  ) {
    await SocialLogin.initialize({
      google: {
        webClientId:
          '663744030891-k6hk8dgrpiopo8jp2diqv9ir7pk7760v.apps.googleusercontent.com',
        mode: 'online', // Use 'online' for simple authentication
      },
    });
  }
};

// Sign in with Google on Android/iOS
export const signInWithGoogleNative = async () => {
  try {
    const response = await SocialLogin.login({
      provider: 'google',
      options: {
        scopes: ['email', 'profile'],
      },
    });

    if (response.provider === 'google') {
      const result = response.result as GoogleLoginResponseOnline;

      if (!result.idToken) {
        return { success: false, error: 'No ID token received' };
      }

      // Use custom auth API
      const authResult = await googleSignIn(result.idToken);

      if (authResult.success) {
        // Redirect to home page on success
        window.location.href = '/';
        return { success: true, data: authResult.data };
      } else {
        return {
          success: false,
          error: authResult.message || 'Authentication failed',
        };
      }
    }

    return { success: false, error: 'Invalid provider response' };
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Sign-in failed',
    };
  }
};

// Sign out from Google on Android/iOS
export const signOutGoogleNative = async () => {
  try {
    await SocialLogin.logout({
      provider: 'google',
    });
  } catch (error) {
    console.error('Google Sign-Out Error:', error);
  }
};
