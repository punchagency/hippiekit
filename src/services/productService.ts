import { CapacitorHttp } from '@capacitor/core';
import type { HttpResponse } from '@capacitor/core';
import type { Product } from './categoryService';

// Use backend proxy like categoryService
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const WP_API_URL = `${API_URL}/api/wordpress`;
const AI_SERVICE_URL =
  import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8001';

const httpGetJson = async <T>(url: string): Promise<T> => {
  const response: HttpResponse = await CapacitorHttp.get({ url });
  if (response.status < 200 || response.status >= 300) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.data as T;
};

const httpPostJson = async <T>(url: string, data: any): Promise<T> => {
  const response: HttpResponse = await CapacitorHttp.post({
    url,
    headers: { 'Content-Type': 'application/json' },
    data,
  });
  if (response.status < 200 || response.status >= 300) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.data as T;
};

export const fetchProductById = async (productId: number): Promise<Product> => {
  return await httpGetJson<Product>(`${WP_API_URL}/products/${productId}`);
};

// ==================== Semantic Search ====================

export interface SemanticSearchResult {
  id: string;
  score: number;
  name: string;
  slug: string;
  price: string;
  image: string;
  category: string;
  categories: string[];
  description: string;
  sku: string;
  stock_status: string;
}

export interface SemanticSearchResponse {
  query: string;
  results: SemanticSearchResult[];
  count: number;
  limit: number;
  min_score: number;
  category_filter?: string;
  search_type: 'semantic' | 'wordpress_fallback' | 'failed';
}

/**
 * Perform semantic search using AI service
 * This provides intelligent search that matches similar terms (e.g., "glassware" matches "glass")
 */
export const searchProductsSemantic = async (
  query: string,
  options?: {
    limit?: number;
    minScore?: number;
    category?: string;
    useCache?: boolean;
  },
): Promise<SemanticSearchResponse> => {
  const {
    limit = 20,
    minScore = 0.5,
    category,
    useCache = true,
  } = options || {};

  return await httpPostJson<SemanticSearchResponse>(
    `${AI_SERVICE_URL}/api/search/`,
    {
      query,
      limit,
      min_score: minScore,
      category,
      use_cache: useCache,
    },
  );
};

/**
 * Get search suggestions for autocomplete
 */
export const getSearchSuggestions = async (
  partialQuery: string,
  limit: number = 5,
): Promise<string[]> => {
  if (partialQuery.length < 2) {
    return [];
  }

  try {
    const response = await httpGetJson<{ suggestions: string[] }>(
      `${AI_SERVICE_URL}/api/search/suggest?q=${encodeURIComponent(partialQuery)}&limit=${limit}`,
    );
    return response.suggestions;
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    return [];
  }
};
