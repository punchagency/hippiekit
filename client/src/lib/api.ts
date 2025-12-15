/**
 * API Client
 *
 * Centralized fetch wrapper that automatically includes bearer token
 * in all API requests.
 */

import { tokenStore } from './tokenStore';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface FetchOptions extends RequestInit {
  requiresAuth?: boolean;
}

/**
 * Make an authenticated API request
 * Automatically injects Authorization header with bearer token
 */
export const apiClient = async (
  endpoint: string,
  options: FetchOptions = {}
): Promise<Response> => {
  const { requiresAuth = true, headers = {}, ...fetchOptions } = options;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    ...(headers as Record<string, string>),
  };

  // Add bearer token if required
  if (requiresAuth) {
    const token = await tokenStore.getToken();
    if (token) {
      console.log(
        '🔍 Sending token (first 20 chars):',
        token.substring(0, 20) + '...'
      );
      console.log('🔍 Token length:', token.length);
      console.log(
        '🔍 Token format check:',
        token.split('.').length === 3
          ? 'Valid JWT format'
          : 'INVALID JWT FORMAT'
      );
      requestHeaders['Authorization'] = `Bearer ${token}`;
    } else {
      console.log('⚠️ No token found for authenticated request');
    }
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;

  const response = await fetch(url, {
    ...fetchOptions,
    headers: requestHeaders,
  });

  // Handle 401 responses - clear invalid tokens
  if (response.status === 401 && requiresAuth) {
    await tokenStore.clear();
  }

  return response;
};

/**
 * Typed API helpers
 */
export const api = {
  get: (endpoint: string, options?: FetchOptions) =>
    apiClient(endpoint, { ...options, method: 'GET' }),

  post: (endpoint: string, data?: any, options?: FetchOptions) =>
    apiClient(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    }),

  put: (endpoint: string, data?: any, options?: FetchOptions) =>
    apiClient(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (endpoint: string, options?: FetchOptions) =>
    apiClient(endpoint, { ...options, method: 'DELETE' }),

  patch: (endpoint: string, data?: any, options?: FetchOptions) =>
    apiClient(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};

/**
 * Example usage:
 *
 * // Authenticated request
 * const response = await api.get('/api/user/profile');
 * const data = await response.json();
 *
 * // Public request (no auth)
 * const response = await api.get('/api/public/data', { requiresAuth: false });
 *
 * // POST with data
 * const response = await api.post('/api/user/update', { name: 'John' });
 */
