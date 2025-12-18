import { App, type URLOpenListenerEvent } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import type { PluginListenerHandle } from '@capacitor/core';

export interface DeepLinkHandler {
  initialize: (navigate: (path: string) => void) => void;
  cleanup: () => void;
}

let listenerHandle: PluginListenerHandle | null = null;

/**
 * Initialize deep link handler for Capacitor app
 * Handles incoming deep links like: hippiekit://verify-email?token=abc123
 */
export function initializeDeepLinkHandler(
  navigate: (path: string) => void
): void {
  // Only initialize on native platforms
  if (!Capacitor.isNativePlatform()) {
    console.log('Deep link handler: Running on web, skipping initialization');
    return;
  }

  console.log('Deep link handler: Initializing for native platform');

  // Listen for app URL open events
  App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
    console.log('Deep link received:', event.url);

    try {
      const url = new URL(event.url);
      const pathname = url.pathname;
      const searchParams = url.searchParams;

      console.log('Deep link pathname:', pathname);
      console.log('Deep link search params:', Object.fromEntries(searchParams));

      // Handle email verification deep link
      if (pathname === '/verify-email' || url.host === 'verify-email') {
        const token = searchParams.get('token');
        if (token) {
          console.log('Navigating to verify-email page with token');
          navigate(`/verify-email?token=${token}`);
        } else {
          console.warn('Deep link missing token parameter');
        }
      } else {
        console.log('Unhandled deep link path:', pathname);
      }
    } catch (error) {
      console.error('Error parsing deep link URL:', error);
    }
  }).then((handle) => {
    listenerHandle = handle;
    console.log('Deep link listener registered successfully');
  });
}

/**
 * Cleanup deep link listener when component unmounts
 */
export function cleanupDeepLinkHandler(): void {
  if (listenerHandle) {
    listenerHandle.remove();
    listenerHandle = null;
    console.log('Deep link listener removed');
  }
}
