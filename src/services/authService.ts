import axios from 'axios';

// Types
interface RegisterData {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface UpdateProfileData {
  name?: string;
  email?: string;
  password?: string;
  phoneNumber?: string;
  profileImage?: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  profileImage?: string;
  token?: string;
}

interface AuthResponse {
  success: boolean;
  data?: User;
  message: string;
  resetToken?: string;
}

/**
 * ⚠️ DEPRECATED - NOT IN USE
 *
 * This auth service is no longer used. We've migrated to Better Auth.
 * All authentication is now handled by Better Auth client (lib/auth.ts).
 *
 * Better Auth provides:
 * - authClient.signUp.email() - Register with email/password
 * - authClient.signIn.email() - Login with email/password
 * - authClient.signIn.social() - OAuth login (Google, Facebook)
 * - authClient.signOut() - Logout
 * - authClient.useSession() - Get current session (React hook)
 * - authClient.sendVerificationEmail() - Send verification email
 * - authClient.resetPassword() - Password reset
 *
 * Better Auth uses secure HTTP-only cookies instead of localStorage tokens.
 *
 * Kept for reference only. Do not use in new code.
 *
 * See: client/src/lib/auth.ts for Better Auth client configuration
 * See: client/src/context/AuthContext.tsx for auth state management
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Register user
export const register = async (
  userData: RegisterData
): Promise<AuthResponse> => {
  try {
    const response = await api.post('/register', userData);
    if (response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }
    return response.data;
  } catch (error: unknown) {
    const errorMessage = axios.isAxiosError(error)
      ? error.response?.data?.message || error.message
      : 'Registration failed';
    console.error(
      'Registration error:',
      axios.isAxiosError(error) ? error.response?.data || error.message : error
    );
    throw new Error(errorMessage);
  }
};

// Login user
export const login = async (
  credentials: LoginCredentials
): Promise<AuthResponse> => {
  const response = await api.post('/login', credentials);
  if (response.data.data.token) {
    localStorage.setItem('token', response.data.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.data));
  }
  return response.data;
};

// Logout user
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Get current user
export const getMe = async (): Promise<AuthResponse> => {
  const response = await api.get('/me');
  return response.data;
};

// Update profile
export const updateProfile = async (
  userData: UpdateProfileData
): Promise<AuthResponse> => {
  const response = await api.put('/profile', userData);
  if (response.data.data.token) {
    localStorage.setItem('token', response.data.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.data));
  }
  return response.data;
};

// Forgot password
export const forgotPassword = async (email: string): Promise<AuthResponse> => {
  const response = await api.post('/forgot-password', { email });
  return response.data;
};

// Reset password
export const resetPassword = async (
  resetToken: string,
  password: string
): Promise<AuthResponse> => {
  const response = await api.post(`/reset-password/${resetToken}`, {
    password,
  });
  return response.data;
};

// Verify OTP
export const verifyOTP = async (
  email: string,
  otp: string
): Promise<AuthResponse> => {
  const response = await api.post('/verify-otp', { email, otp });
  if (response.data.data.token) {
    localStorage.setItem('token', response.data.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.data));
  }
  return response.data;
};

// Get user from localStorage
export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
};

export default {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
  verifyOTP,
  getCurrentUser,
  isAuthenticated,
};
