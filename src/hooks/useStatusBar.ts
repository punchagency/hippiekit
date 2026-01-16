import { useEffect } from 'react';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

export const useStatusBar = () => {
  useEffect(() => {
    const setupStatusBar = async () => {
      if (!Capacitor.isNativePlatform()) return;

      try {
        // Enable edge-to-edge: content goes behind status bar
        await StatusBar.setOverlaysWebView({ overlay: true });

        // Dark style = dark icons for light backgrounds
        await StatusBar.setStyle({ style: Style.Dark });

        // Ensure it's visible
        await StatusBar.show();
      } catch (error) {
        console.error('Error setting up status bar:', error);
      }
    };

    setupStatusBar();
  }, []);
};
