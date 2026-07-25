import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nith.connect',
  appName: 'NITH Connect',
  webDir: 'public',
  server: {
    url: 'http://10.20.196.30:3000',
    cleartext: true
  }
};

export default config;
