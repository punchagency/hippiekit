import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hippiekit.app',
  appName: 'hippiekit',
  webDir: 'dist', // keep as your build output

  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#f5f5f5'
    },
  },
  ios: {
    backgroundColor: '#f5f5f5'
  },
  // Live reload on device: serve from your LAN Vite dev server
  // Comment out for production builds
  server: {
    url: 'http://172.20.10.6:5173',
    cleartext: true,
  },
};

export default config;
