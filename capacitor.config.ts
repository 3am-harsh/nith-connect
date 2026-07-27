import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nith.connect',
  appName: 'NITH Connect',
  webDir: 'public',
  server: {
    url: 'https://nith-connect-oi66.vercel.app',
    cleartext: true
  },
  plugins: {
    Keyboard: {
      resize: 'body',
      style: 'dark'
    },
    CapacitorCookies: {
      enabled: true
    },
    CapacitorHttp: {
      enabled: true
    },
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ["google.com"]
    }
  }
};

export default config;
