import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hippiekit.app',
  appName: 'hippiekit',
  webDir: 'dist', // keep as your build output

  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#650084',
      overlaysWebView: false,
    },
    Keyboard: {
      resize: 'native',
      style: 'dark',
      resizeOnFullScreen: true,
    },
  },
  // Live reload on device: serve from your LAN Vite dev server
  server: {
    cleartext: true,
  },
};

export default config;
