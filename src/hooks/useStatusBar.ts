import { useEffect } from 'react';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

export const useStatusBar = () => {
  useEffect(() => {
    const setupStatusBar = async () => {
      if (!Capacitor.isNativePlatform()) return;

      try {
        // 1️⃣ IMPORTANT: prevent overlap FIRST
        await StatusBar.setOverlaysWebView({ overlay: false });

        // 2️⃣ Set background color
        await StatusBar.setBackgroundColor({ color: 'purple' });

        // 3️⃣ Set correct icon style for dark background
        await StatusBar.setStyle({ style: Style.Dark });

        // 4️⃣ Ensure it's visible
        await StatusBar.show();
      } catch (error) {
        console.error('Error setting up status bar:', error);
      }
    };

    setupStatusBar();
  }, []);
};
