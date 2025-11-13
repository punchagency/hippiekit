import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authClient } from '../lib/auth';
import Splash from '../pages/Splash';

interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  image?: string;
  emailVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
  refreshSession: () => Promise<void>;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  phoneNumber?: string;
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
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    fetch('http://192.168.1.24:8000')
      .then((res) => res.text())
      .then(console.log)
      .catch(console.error);
  }, []);

  // Function to fetch session from Better Auth
  const fetchSession = async () => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || 'http://192.168.1.24:8000'
        }/api/auth/get-session`,
        {
          credentials: 'include', // Important: send cookies
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setUser({
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            phoneNumber: data.user.phoneNumber,
            image: data.user.image,
            emailVerified: data.user.emailVerified,
            createdAt: data.user.createdAt,
            updatedAt: data.user.updatedAt,
          });
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to fetch session:', error);
      setUser(null);
    }
  };

  useEffect(() => {
    // Check session on mount
    fetchSession().finally(() => setLoading(false));

    // Show splash screen for 2 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authClient.signIn.email({
        email,
        password,
      });

      if (response.data) {
        // Fetch updated session after login
        await fetchSession();
      } else if (response.error) {
        throw new Error(response.error.message || 'Login failed');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      throw new Error(message);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const response = await authClient.signUp.email({
        email: userData.email,
        password: userData.password,
        name: userData.username,
      });

      if (response.data) {
        // Fetch updated session after registration
        await fetchSession();
      } else if (response.error) {
        throw new Error(response.error.message || 'Registration failed');
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Registration failed';
      throw new Error(message);
    }
  };

  const logout = async () => {
    try {
      // Sign out from Better Auth (clears cookies)
      await authClient.signOut();
      setUser(null);
    } catch (error) {
      console.error('Better Auth logout failed:', error);
      setUser(null);
    }
  };

  const refreshSession = async () => {
    await fetchSession();
  };

  const updateProfile = async (_userData: Partial<User>) => {
    try {
      // Better Auth doesn't have a direct updateProfile method
      // You'll need to implement this using Better Auth's update user endpoint
      // For now, we'll fetch the session to get updated user data
      await fetchSession();

      // TODO: Implement actual profile update via Better Auth API
      console.warn('Profile update not yet implemented with Better Auth');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Update failed';
      throw new Error(message);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    refreshSession,
  };

  // Show splash screen while initializing
  if (showSplash) {
    return <Splash />;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
