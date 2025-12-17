import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import * as authAPI from '../lib/authAPI';
import { getValidToken, handleOAuthCallback } from '../lib/auth';

interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  profileImage?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  resetPassword: (
    email: string,
    otp: string,
    newPassword: string
  ) => Promise<void>;
  googleSignIn: (idToken: string) => Promise<void>;
  isAuthenticated: boolean;
  refreshSession: () => Promise<void>;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch session using JWT token with expiry validation
  const fetchSession = async () => {
    try {
      // Check if token exists and is not expired
      const token = await getValidToken();
      if (!token) {
        setUser(null);
        return;
      }

      const result = await authAPI.getMe();
      if (result.success && result.data) {
        setUser({
          id: result.data._id,
          name: result.data.name,
          email: result.data.email,
          phoneNumber: result.data.phoneNumber,
          profileImage: result.data.profileImage,
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to fetch session:', error);
      setUser(null);
    }
  };

  useEffect(() => {
    // Handle OAuth callback if present, then fetch session
    (async () => {
      const oauthResult = await handleOAuthCallback();
      if (oauthResult.success) {
        console.log('✅ OAuth callback handled successfully');
        // Fetch session after OAuth token is stored
        await fetchSession();
      } else {
        // No OAuth callback, just check existing session
        await fetchSession();
      }
      setLoading(false);
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const result = await authAPI.signIn(email, password);
    if (result.success) {
      await fetchSession();
    } else {
      throw new Error(result.message || 'Login failed');
    }
  };

  const register = async (userData: RegisterData) => {
    const result = await authAPI.signUp(
      userData.name,
      userData.email,
      userData.password,
      userData.phoneNumber
    );
    if (result.success) {
      await fetchSession();
    } else {
      throw new Error(result.message || 'Registration failed');
    }
  };

  const logout = async () => {
    await authAPI.signOut();
    setUser(null);
  };

  const refreshSession = async () => {
    await fetchSession();
  };

  const updateProfile = async (userData: Partial<User>) => {
    const result = await authAPI.updateProfile(userData);
    if (result.success) {
      await fetchSession();
    } else {
      throw new Error(result.message || 'Update failed');
    }
  };

  const forgotPassword = async (email: string) => {
    const result = await authAPI.forgotPassword(email);
    if (!result.success) {
      throw new Error(result.message || 'Failed to send OTP');
    }
  };

  const verifyOtp = async (email: string, otp: string) => {
    const result = await authAPI.verifyOtp(email, otp);
    if (!result.success) {
      throw new Error(result.message || 'Invalid OTP');
    }
  };

  const resetPassword = async (
    email: string,
    otp: string,
    newPassword: string
  ) => {
    const result = await authAPI.resetPassword(email, otp, newPassword);
    if (result.success) {
      await fetchSession();
    } else {
      throw new Error(result.message || 'Password reset failed');
    }
  };

  const googleSignIn = async (idToken: string) => {
    const result = await authAPI.googleSignIn(idToken);
    if (result.success) {
      await fetchSession();
    } else {
      throw new Error(result.message || 'Google sign-in failed');
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    forgotPassword,
    verifyOtp,
    resetPassword,
    googleSignIn,
    isAuthenticated: !!user,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
