import { Capacitor } from '@capacitor/core';
import { signInWithGoogleNative } from './androidAuth';
import { tokenStore } from './tokenStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// JWT token expiry validation
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= exp;
  } catch (error) {
    console.error('Error parsing token:', error);
    return true; // Treat invalid tokens as expired
  }
};

// Get valid token or null if expired
export const getValidToken = (): string | null => {
  const token = tokenStore.getToken();
  if (!token) return null;
  if (isTokenExpired(token)) {
    tokenStore.clear();
    return null;
  }
  return token;
};

// Custom auth API calls
export const login = async (email: string, password: string) => {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }

  const data = await response.json();
  if (data.success && data.data.token) {
    tokenStore.setToken(data.data.token);
    tokenStore.setUser(data.data);
  }
  return data;
};

export const register = async (userData: {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
}) => {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Registration failed');
  }

  const data = await response.json();
  if (data.success && data.data.token) {
    tokenStore.setToken(data.data.token);
    tokenStore.setUser(data.data);
  }
  return data;
};

export const logout = () => {
  tokenStore.clear();
};

export const getCurrentUser = async () => {
  const token = getValidToken();
  if (!token) return null;

  const response = await fetch(`${API_URL}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      tokenStore.clear();
    }
    return null;
  }

  const data = await response.json();
  return data.success ? data.data : null;
};

// OAuth helper methods with platform detection
export const signInWithGoogle = async () => {
  const platform = Capacitor.getPlatform();

  // Use native Google Sign-In on Android/iOS
  if (platform === 'android' || platform === 'ios') {
    return await signInWithGoogleNative();
  }

  // Use web-based OAuth - redirect to backend OAuth endpoint
  window.location.href = `${API_URL}/api/auth/google`;
};

// Handle OAuth callback (extract token from URL)
export const handleOAuthCallback = () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  const error = params.get('error');

  if (error) {
    console.error('OAuth error:', error);
    return { success: false, error };
  }

  if (token) {
    tokenStore.setToken(token);
    // Clean URL
    window.history.replaceState({}, document.title, window.location.pathname);
    return { success: true };
  }

  return { success: false, error: 'No token received' };
};

// Password reset functions
export const forgotPassword = async (email: string) => {
  const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to send reset code');
  }

  return await response.json();
};

export const verifyOTP = async (email: string, otp: string) => {
  const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Invalid OTP');
  }

  return await response.json();
};

export const resetPassword = async (
  email: string,
  otp: string,
  newPassword: string
) => {
  const response = await fetch(`${API_URL}/api/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp, newPassword }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Password reset failed');
  }

  const data = await response.json();
  if (data.success && data.data.token) {
    tokenStore.setToken(data.data.token);
    tokenStore.setUser(data.data);
  }
  return data;
};
