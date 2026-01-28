import { useEffect } from 'react';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

export const useStatusBar = () => {
  useEffect(() => {
    const setupStatusBar = async () => {
      if (!Capacitor.isNativePlatform()) return;

      const isAndroid = Capacitor.getPlatform() === 'android';

      try {
        // Enable edge-to-edge: content goes behind status bar
        await StatusBar.setOverlaysWebView({ overlay: true });

        // Dark style = dark icons for light backgrounds
        await StatusBar.setStyle({ style: Style.Light });

        // Ensure status bar is visible
        await StatusBar.show();

        // On Android, env(safe-area-inset-*) doesn't work properly
        // We need to manually set CSS variables for safe area insets
        if (isAndroid) {
          // Android status bar is typically 24dp
          const statusBarHeight = 24;
          // Android navigation bar (gesture navigation) is typically 20-24dp
          // For 3-button navigation it's ~48dp, but gesture nav is more common now
          const navigationBarHeight = 24;
          
          document.documentElement.style.setProperty(
            '--safe-area-inset-top',
            `${statusBarHeight}px`
          );
          document.documentElement.style.setProperty(
            '--safe-area-inset-bottom',
            `${navigationBarHeight}px`
          );
        }
      } catch (error) {
        console.error('Error setting up status bar:', error);
      }
    };

    setupStatusBar();
  }, []);
};
