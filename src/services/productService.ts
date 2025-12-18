import { CapacitorHttp } from '@capacitor/core';
import type { HttpResponse } from '@capacitor/core';
import type { Product } from './categoryService';

// Use backend proxy like categoryService
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const WP_API_URL = `${API_URL}/api/wordpress`;

const httpGetJson = async <T>(url: string): Promise<T> => {
  const response: HttpResponse = await CapacitorHttp.get({ url });
  if (response.status < 200 || response.status >= 300) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.data as T;
};

export const fetchProductById = async (productId: number): Promise<Product> => {
  return await httpGetJson<Product>(`${WP_API_URL}/products/${productId}`);
};
