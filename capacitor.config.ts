import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'alumniui',
  webDir: 'build',
  // server: {
  //   url: 'http://192.168.1.10:3000', // your local IP + dev server port
  //   cleartext: true, // allows HTTP
  // },
    plugins: {
    SplashScreen: {
      launchShowDuration: 100, // in ms
      launchAutoHide: true,
      backgroundColor: '#ffffff',
      showSpinner: true,
      androidSpinnerStyle: 'small',
      iosSpinnerStyle: 'small',
      spinnerColor: '#000000'
    }
  }

};

export default config;
