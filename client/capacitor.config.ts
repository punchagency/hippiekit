import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hippiekit.app',
  appName: 'hippiekit',
  webDir: 'dist', // keep as your build output

  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    server: {
      url: 'http://192.168.1.25:5173', // your local network IP address
      cleartext: true,
    },
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
