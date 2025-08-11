import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'alumniui',
  webDir: 'build',
  server: {
    url: 'http://192.168.1.10:3000', // your local IP + dev server port
    cleartext: true, // allows HTTP
  },

};

export default config;
