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
      resize: 'native',
      style: 'dark',
      resizeOnFullScreen: true,
    },
  },
  // Live reload on device: serve from your LAN Vite dev server
  // Uncomment and update IP when using live reload during development
  // Comment out for production builds
  // server: {
  //   url: 'http://192.168.1.211:5173',
  //   cleartext: true,
  // },
};

export default config;
