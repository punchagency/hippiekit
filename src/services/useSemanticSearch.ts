import { useQuery } from '@tanstack/react-query';
import {
  searchProductsSemantic,
  type SemanticSearchResponse,
} from './productService';

/**
 * Hook to perform semantic search with caching and error handling
 * @param query - Search query string
 * @param options - Search options (limit, minScore, category, useCache)
 */
export const useSemanticSearch = (
  query: string,
  options?: {
    limit?: number;
    minScore?: number;
    category?: string;
    useCache?: boolean;
  },
) => {
  const {
    limit = 20,
    minScore = 0.5,
    category,
    useCache = true,
  } = options || {};

  return useQuery<SemanticSearchResponse, Error>({
    queryKey: ['search-products', query, limit, minScore, category],
    queryFn: () =>
      searchProductsSemantic(query, { limit, minScore, category, useCache }),
    enabled: !!query && query.trim().length > 0,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
  });
};
