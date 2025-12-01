/**
 * Token Storage Abstraction
 *
 * Provides a unified interface for storing and retrieving bearer tokens
 * Uses localStorage for both web and mobile platforms (Capacitor supports localStorage)
 *
 * Future upgrade path: Replace with Capacitor Secure Storage for encrypted storage
 */

const TOKEN_KEY = 'bearer_token';
const USER_KEY = 'user_data';

export const tokenStore = {
  /**
   * Get the stored bearer token
   */
  getToken: (): string | null => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token from storage:', error);
      return null;
    }
  },

  /**
   * Store a bearer token
   */
  setToken: (token: string): void => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error('Error storing token:', error);
    }
  },

  /**
   * Remove the stored bearer token
   */
  removeToken: (): void => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error removing token:', error);
    }
  },

  /**
   * Get stored user data
   */
  getUser: <T = any>(): T | null => {
    try {
      const userData = localStorage.getItem(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user from storage:', error);
      return null;
    }
  },

  /**
   * Store user data
   */
  setUser: <T = any>(user: T): void => {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error storing user:', error);
    }
  },

  /**
   * Remove stored user data
   */
  removeUser: (): void => {
    try {
      localStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error('Error removing user:', error);
    }
  },

  /**
   * Clear all auth data
   */
  clear: (): void => {
    tokenStore.removeToken();
    tokenStore.removeUser();
  },
};
