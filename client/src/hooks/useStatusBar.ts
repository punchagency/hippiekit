import { useEffect } from 'react';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

export const useStatusBar = () => {
  useEffect(() => {
    const setupStatusBar = async () => {
      // Only run on native platforms
      if (Capacitor.isNativePlatform()) {
        try {
          // Show the status bar
          await StatusBar.show();

          // Set the status bar style
          await StatusBar.setStyle({ style: Style.Light });

          // Set the background color (matches your primary color)
          await StatusBar.setBackgroundColor({ color: '#650084' });

          // Ensure content doesn't overlap with status bar
          await StatusBar.setOverlaysWebView({ overlay: false });
        } catch (error) {
          console.error('Error setting up status bar:', error);
        }
      }
    };

    setupStatusBar();
  }, []);
};
