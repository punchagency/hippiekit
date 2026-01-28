/**
 * User Preferences Storage
 *
 * Provides persistent storage for user preferences like notifications
 * and country preferences. Uses Capacitor Preferences plugin for
 * native platforms and localStorage for web.
 *
 * Unlike tokenStore which uses SecureStorage for sensitive auth data,
 * this uses standard Preferences storage which is more appropriate
 * for non-sensitive user settings.
 */

import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

const PREFERENCES_KEY = 'user_preferences';

export interface UserPreferences {
  notifications: boolean;
  countryPreferences: {
    usa: boolean;
    canada: boolean;
    mexico: boolean;
    europe: boolean;
  };
}

const defaultPreferences: UserPreferences = {
  notifications: false,
  countryPreferences: {
    usa: false,
    canada: false,
    mexico: false,
    europe: false,
  },
};

// Check if running on native platform (iOS/Android)
const isNativePlatform = (): boolean => {
  return Capacitor.isNativePlatform();
};

export const preferencesStore = {
  /**
   * Get all user preferences
   */
  getPreferences: async (): Promise<UserPreferences> => {
    try {
      if (isNativePlatform()) {
        const result = await Preferences.get({ key: PREFERENCES_KEY });
        if (result.value) {
          return { ...defaultPreferences, ...JSON.parse(result.value) };
        }
      } else {
        // Web fallback
        const stored = localStorage.getItem(PREFERENCES_KEY);
        if (stored) {
          return { ...defaultPreferences, ...JSON.parse(stored) };
        }
      }
      return defaultPreferences;
    } catch (error) {
      console.error('Error getting preferences:', error);
      return defaultPreferences;
    }
  },

  /**
   * Save all user preferences
   */
  setPreferences: async (preferences: UserPreferences): Promise<void> => {
    try {
      const value = JSON.stringify(preferences);
      if (isNativePlatform()) {
        await Preferences.set({ key: PREFERENCES_KEY, value });
      } else {
        // Web fallback
        localStorage.setItem(PREFERENCES_KEY, value);
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      throw error;
    }
  },

  /**
   * Update notifications setting
   */
  setNotifications: async (enabled: boolean): Promise<void> => {
    const current = await preferencesStore.getPreferences();
    await preferencesStore.setPreferences({
      ...current,
      notifications: enabled,
    });
  },

  /**
   * Update a single country preference
   */
  setCountryPreference: async (
    country: keyof UserPreferences['countryPreferences'],
    enabled: boolean
  ): Promise<void> => {
    const current = await preferencesStore.getPreferences();
    await preferencesStore.setPreferences({
      ...current,
      countryPreferences: {
        ...current.countryPreferences,
        [country]: enabled,
      },
    });
  },

  /**
   * Clear all preferences (reset to defaults)
   */
  clearPreferences: async (): Promise<void> => {
    try {
      if (isNativePlatform()) {
        await Preferences.remove({ key: PREFERENCES_KEY });
      } else {
        localStorage.removeItem(PREFERENCES_KEY);
      }
    } catch (error) {
      console.error('Error clearing preferences:', error);
    }
  },
};
