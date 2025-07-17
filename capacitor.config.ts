import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'alumniui',
  webDir: 'build',
  server: {
    url: 'http://192.168.29.24:3000/login', // your local IP address (not localhost!)
    cleartext: true,
  },
};

export default config;
