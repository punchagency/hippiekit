/**
 * Token Storage Abstraction with Secure Storage
 *
 * Provides a unified interface for storing and retrieving bearer tokens
 * Uses Capacitor Secure Storage for encrypted storage on iOS/Android
 * Falls back to localStorage for web platform
 *
 * Features:
 * - Encrypted storage on native platforms
 * - Automatic migration from localStorage
 * - Web platform fallback
 * - Async/await API
 */

import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';
import { Capacitor } from '@capacitor/core';

const TOKEN_KEY = 'bearer_token';
const USER_KEY = 'user_data';
const MIGRATION_KEY = 'secure_storage_migrated';

// Check if running on native platform (iOS/Android)
const isNativePlatform = (): boolean => {
  return Capacitor.isNativePlatform();
};

// Initialize and migrate data from localStorage if needed
let migrationPromise: Promise<void> | null = null;

const migrateFromLocalStorage = async (): Promise<void> => {
  // Only migrate once
  if (migrationPromise) return migrationPromise;

  migrationPromise = (async () => {
    try {
      // Check if already migrated
      const migrated = localStorage.getItem(MIGRATION_KEY);
      if (migrated === 'true') return;

      console.log(
        '🔄 Migrating auth data from localStorage to Secure Storage...'
      );

      // Get existing data from localStorage
      const token = localStorage.getItem(TOKEN_KEY);
      const userData = localStorage.getItem(USER_KEY);

      if (isNativePlatform()) {
        // Migrate to secure storage on native platforms
        if (token) {
          await SecureStoragePlugin.set({ key: TOKEN_KEY, value: token });
          console.log('✅ Token migrated to Secure Storage');
        }
        if (userData) {
          await SecureStoragePlugin.set({ key: USER_KEY, value: userData });
          console.log('✅ User data migrated to Secure Storage');
        }

        // Clear localStorage after successful migration
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }

      // Mark migration as complete
      localStorage.setItem(MIGRATION_KEY, 'true');
      console.log('✅ Migration complete');
    } catch (error) {
      console.error('❌ Migration failed:', error);
      // Don't throw - allow app to continue with localStorage fallback
    }
  })();

  return migrationPromise;
};

// Storage implementation
const storage = {
  async get(key: string): Promise<string | null> {
    try {
      if (isNativePlatform()) {
        await migrateFromLocalStorage();
        const result = await SecureStoragePlugin.get({ key });
        return result.value;
      } else {
        // Web fallback
        return localStorage.getItem(key);
      }
    } catch (error: unknown) {
      // Key not found is expected, return null
      if (
        error &&
        typeof error === 'object' &&
        'message' in error &&
        typeof error.message === 'string' &&
        error.message.includes('Item with given key does not exist')
      ) {
        return null;
      }
      console.error(`Error getting ${key}:`, error);
      return null;
    }
  },

  async set(key: string, value: string): Promise<void> {
    try {
      if (isNativePlatform()) {
        await migrateFromLocalStorage();
        await SecureStoragePlugin.set({ key, value });
      } else {
        // Web fallback
        localStorage.setItem(key, value);
      }
    } catch (error) {
      console.error(`Error setting ${key}:`, error);
      throw error;
    }
  },

  async remove(key: string): Promise<void> {
    try {
      if (isNativePlatform()) {
        await SecureStoragePlugin.remove({ key });
      } else {
        // Web fallback
        localStorage.removeItem(key);
      }
    } catch (error: unknown) {
      // Key not found is not an error
      if (
        error &&
        typeof error === 'object' &&
        'message' in error &&
        typeof error.message === 'string' &&
        error.message.includes('Item with given key does not exist')
      ) {
        return;
      }
      console.error(`Error removing ${key}:`, error);
    }
  },

  async clear(): Promise<void> {
    try {
      if (isNativePlatform()) {
        await SecureStoragePlugin.clear();
      } else {
        // Web fallback - only clear auth keys
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },
};

export const tokenStore = {
  /**
   * Get the stored bearer token
   */
  getToken: async (): Promise<string | null> => {
    return storage.get(TOKEN_KEY);
  },

  /**
   * Store a bearer token
   */
  setToken: async (token: string): Promise<void> => {
    await storage.set(TOKEN_KEY, token);
  },

  /**
   * Remove the stored bearer token
   */
  removeToken: async (): Promise<void> => {
    await storage.remove(TOKEN_KEY);
  },

  /**
   * Get stored user data
   */
  getUser: async <T = unknown>(): Promise<T | null> => {
    try {
      const userData = await storage.get(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  },

  /**
   * Store user data
   */
  setUser: async <T = unknown>(user: T): Promise<void> => {
    await storage.set(USER_KEY, JSON.stringify(user));
  },

  /**
   * Remove stored user data
   */
  removeUser: async (): Promise<void> => {
    await storage.remove(USER_KEY);
  },

  /**
   * Clear all auth data
   */
  clear: async (): Promise<void> => {
    await storage.clear();
  },

  /**
   * Check if running on native platform (for debugging)
   */
  isNative: (): boolean => {
    return isNativePlatform();
  },
};
