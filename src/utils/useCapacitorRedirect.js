import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';

const useCapacitorRedirect = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const isCapacitor = Capacitor.isNativePlatform();

    if (isCapacitor && location.pathname === '/') {
      navigate('/login', { replace: true });
    }
  }, [location, navigate]);
};

export default useCapacitorRedirect;
