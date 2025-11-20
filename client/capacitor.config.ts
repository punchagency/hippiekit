import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hippiekit.app',
  appName: 'hippiekit',
  webDir: 'dist', // keep as your build output
  server: {
    url: 'http://192.168.1.36:5173', // your React dev server IP
    cleartext: true, // allows HTTP requests
  },
  plugins: {
    StatusBar: {
      style: 'dark',
      backgroundColor: '#650084',
      overlaysWebView: false,
    },
    Keyboard: {
      resize: 'native',
      style: 'dark',
      resizeOnFullScreen: true,
    },
  },
};

export default config;
