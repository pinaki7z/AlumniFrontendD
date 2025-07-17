import { useEffect } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { useLocation, useNavigate } from 'react-router-dom';

export default function BackButtonHandler() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let listener;

    // Setup back button handler
    const setupListener = async () => {
      listener = await CapacitorApp.addListener('backButton', () => {
        const currentPath = location.pathname;

        if (currentPath === '/home') {
          if (window.confirm("Do you want to exit the app?")) {
            CapacitorApp.exitApp(); // closes the app
          }
        } else if (
          currentPath === '/login' ||
          currentPath === '/register' ||
          currentPath === '/'
        ) {
          if (window.confirm("Exit the app?")) {
            CapacitorApp.exitApp();
          }
        } else {
          navigate(-1); // go back in navigation stack
        }
      });
    };

    setupListener();

    return () => {
      if (listener && typeof listener.remove === 'function') {
        listener.remove();
      }
    };
  }, [location.pathname]);

  return null;
}
