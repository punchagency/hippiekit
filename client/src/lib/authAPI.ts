import { tokenStore } from './tokenStore';

// Base API URL baked at build-time. Must be absolute for mobile (no localhost on device).
const API_URL = (
  import.meta.env.VITE_API_URL || 'http://10.0.2.2:8000'
).replace(/\/$/, '');

interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    _id: string;
    name: string;
    email: string;
    phoneNumber?: string;
    profileImage?: string;
    token: string;
  };
}

interface UserResponse {
  success: boolean;
  data?: {
    _id: string;
    name: string;
    email: string;
    phoneNumber?: string;
    profileImage?: string;
  };
}

interface MessageResponse {
  success: boolean;
  message: string;
}

// Sign up with email and password
export async function signUp(
  name: string,
  email: string,
  password: string,
  phoneNumber: string
): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',

    },
    body: JSON.stringify({
      name,
      email,
      password,
      phoneNumber,
      provider: 'credentials',
      providerAccountId: email,
    }),
  });

  const data = await response.json();

  if (data.success && data.data?.token) {
    await tokenStore.setToken(data.data.token);
    await tokenStore.setUser({
      id: data.data._id,
      username: data.data.username,
      email: data.data.email,
      phoneNumber: data.data.phoneNumber,
      profileImage: data.data.profileImage,
    });
  }

  return data;
}

// Sign in with email and password
export async function signIn(
  email: string,
  password: string
): Promise<AuthResponse> {
  let rawText: string | null = null;
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',

      },
      body: JSON.stringify({ email, password }),
    });
    rawText = await response.text();
    let data: AuthResponse;
    try {
      data = JSON.parse(rawText);
    } catch (e) {
      console.warn(
        '⚠️ Non-JSON login response body (show first 120 chars):',
        rawText.slice(0, 120)
      );
      return {
        success: false,
        message: 'Invalid server response (HTML instead of JSON?)',
      };
    }
    if (data.success && data.data?.token) {
      await tokenStore.setToken(data.data.token);
      await tokenStore.setUser({
        id: data.data._id,
        username: data.data.name,
        email: data.data.email,
        phoneNumber: data.data.phoneNumber,
        profileImage: data.data.profileImage,
      });
    }
    return data;
  } catch (err) {
    console.error('❌ Login fetch error:', err, 'Raw:', rawText?.slice(0, 120));
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Network error',
    };
  }
}

// Get current user
export async function getMe(): Promise<UserResponse> {
  const token = await tokenStore.getToken();
  if (!token) {
    return { success: false };
  }
  let rawText: string | null = null;
  try {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',

      },
    });
    rawText = await response.text();
    let data: UserResponse;
    try {
      data = JSON.parse(rawText);
    } catch (e) {
      console.warn(
        '⚠️ Non-JSON /api/auth/me response (first 120 chars):',
        rawText.slice(0, 120)
      );
      return { success: false };
    }
    if (data.success && data.data) {
      tokenStore.setUser({
        id: data.data._id,
        username: data.data.name,
        email: data.data.email,
        phoneNumber: data.data.phoneNumber,
        profileImage: data.data.profileImage,
      });
    }
    return data;
  } catch (err) {
    console.error('❌ getMe error:', err, 'Raw:', rawText?.slice(0, 120));
    return { success: false };
  }
}

// Update user profile
export async function updateProfile(updates: {
  username?: string;
  email?: string;
  phoneNumber?: string;
  profileImage?: string;
  password?: string;
}): Promise<AuthResponse> {
  const token = await tokenStore.getToken();
  if (!token) {
    return { success: false, message: 'Not authenticated' };
  }

  const response = await fetch(`${API_URL}/api/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,

    },
    body: JSON.stringify(updates),
  });

  const data = await response.json();

  if (data.success && data.data) {
    await tokenStore.setUser({
      id: data.data._id,
      username: data.data.username,
      email: data.data.email,
      phoneNumber: data.data.phoneNumber,
      profileImage: data.data.profileImage,
    });
    if (data.data.token) {
      await tokenStore.setToken(data.data.token);
    }
  }

  return data;
}

// Request password reset (sends OTP to email)
export async function forgotPassword(email: string): Promise<MessageResponse> {
  const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',

    },
    body: JSON.stringify({ email }),
  });

  return response.json();
}

// Verify OTP
export async function verifyOtp(
  email: string,
  otp: string
): Promise<MessageResponse> {
  const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',

    },
    body: JSON.stringify({ email, otp }),
  });

  return response.json();
}

// Reset password with OTP
export async function resetPassword(
  email: string,
  otp: string,
  newPassword: string
): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/api/auth/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',

    },
    body: JSON.stringify({ email, otp, newPassword }),
  });

  const data = await response.json();

  if (data.success && data.data?.token) {
    await tokenStore.setToken(data.data.token);
    await tokenStore.setUser({
      id: data.data._id,
      username: data.data.username,
      email: data.data.email,
      phoneNumber: data.data.phoneNumber,
      profileImage: data.data.profileImage,
    });
  }

  return data;
}

// Google Sign-In (native)
export async function googleSignIn(idToken: string): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/api/auth/google-signin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',

    },
    body: JSON.stringify({ idToken }),
  });

  const data = await response.json();

  if (data.success && data.data?.token) {
    await tokenStore.setToken(data.data.token);
    await tokenStore.setUser({
      id: data.data._id,
      username: data.data.username,
      email: data.data.email,
      phoneNumber: data.data.phoneNumber,
      profileImage: data.data.profileImage,
    });
  }

  return data;
}

// Sign out
export async function signOut(): Promise<void> {
  await tokenStore.clear();
}
