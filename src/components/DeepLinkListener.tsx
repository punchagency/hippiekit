import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  initializeDeepLinkHandler,
  cleanupDeepLinkHandler,
} from '../utils/deepLinkHandler';

/**
 * Component that listens for deep links and routes accordingly.
 * Must be placed inside a Router component.
 */
export function DeepLinkListener() {
  const navigate = useNavigate();

  useEffect(() => {
    initializeDeepLinkHandler(navigate);

    return () => {
      cleanupDeepLinkHandler();
    };
  }, [navigate]);

  return null; // This component doesn't render anything
}
