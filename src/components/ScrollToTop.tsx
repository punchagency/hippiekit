import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component that scrolls to top on every route change
 * Place this inside BrowserRouter but outside Routes
 */
export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0);
    
    // Also scroll any scrollable containers
    const scrollableContainers = document.querySelectorAll('[data-scroll-container]');
    scrollableContainers.forEach((container) => {
      container.scrollTo(0, 0);
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
