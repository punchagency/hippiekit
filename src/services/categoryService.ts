import { CapacitorHttp } from '@capacitor/core';
import type { HttpResponse } from '@capacitor/core';
import {
  useQuery,
  useInfiniteQuery,
  type UseQueryResult,
  type UseInfiniteQueryResult,
} from '@tanstack/react-query';

// Use backend proxy to avoid SSL cert issues with WordPress
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const WP_API_URL = `${API_URL}/api/wordpress`;

export interface Category {
  id: number;
  name: string;
  count: number;
  slug: string;
  description: string;
  link: string;
  parent: number; // 0 for top-level categories, parent category ID for subcategories
  meta: {
    featured_image: string;
    excerpt: string;
  };
}

export interface Product {
  id: number;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  /** Optional excerpt for list items; present on single product */
  excerpt?: {
    rendered: string;
  };
  featured_media: number;
  /** WordPress permalink (present on single product) */
  link?: string;
  meta: {
    video_embed_url: string;
    cta_button_text: string;
    cta_button_url: string;
  };
  'product-categories': number[];
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string;
      alt_text: string;
    }>;
  };
}

const httpGetJson = async <T>(url: string): Promise<T> => {
  const response: HttpResponse = await CapacitorHttp.get({ url });
  if (response.status < 200 || response.status >= 300) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.data as T;
};

export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const data = await httpGetJson<Category[]>(`${WP_API_URL}/categories`);

    // Filter only top-level categories (parent === 0)
    const topLevelCategories = data.filter((cat) => cat.parent === 0);

    const categoriesWithImages = await Promise.all(
      topLevelCategories.map(async (category: Category) => {
        if (category.meta?.featured_image) {
          try {
            const mediaData = await httpGetJson<{ source_url?: string }>(
              `${WP_API_URL}/media/${category.meta.featured_image}`
            );
            return {
              ...category,
              meta: {
                ...category.meta,
                featured_image:
                  mediaData.source_url || category.meta.featured_image,
              },
            };
          } catch {
            console.error('Failed to fetch media for category:', category.id);
          }
        }
        return category;
      })
    );

    return categoriesWithImages;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const fetchSubCategories = async (
  parentId: number
): Promise<Category[]> => {
  try {
    const data = await httpGetJson<Category[]>(
      `${WP_API_URL}/categories?parent=${parentId}`
    );

    const categoriesWithImages = await Promise.all(
      data.map(async (category: Category) => {
        if (category.meta?.featured_image) {
          try {
            const mediaData = await httpGetJson<{ source_url?: string }>(
              `${WP_API_URL}/media/${category.meta.featured_image}`
            );
            return {
              ...category,
              meta: {
                ...category.meta,
                featured_image:
                  mediaData.source_url || category.meta.featured_image,
              },
            };
          } catch {
            console.error('Failed to fetch media for category:', category.id);
          }
        }
        return category;
      })
    );

    return categoriesWithImages;
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    throw error;
  }
};

export const fetchProducts = async (
  perPage: number = 10
): Promise<Product[]> => {
  try {
    return await httpGetJson<Product[]>(
      `${WP_API_URL}/products?per_page=${perPage}`
    );
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const fetchProductsPaginated = async (
  page: number = 1,
  perPage: number = 15,
  categorySlug?: string
): Promise<Product[]> => {
  try {
    let url = `${WP_API_URL}/products?page=${page}&per_page=${perPage}`;

    // If category slug is provided, fetch by category
    if (categorySlug) {
      const categories = await httpGetJson<Category[]>(
        `${WP_API_URL}/categories?slug=${categorySlug}`
      );

      if (!categories || categories.length === 0) {
        return [];
      }

      const categoryId = categories[0].id;
      url = `${WP_API_URL}/products?page=${page}&per_page=${perPage}&category_id=${categoryId}`;
    }

    return await httpGetJson<Product[]>(url);
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const fetchLatestProductsPaginated = async (
  page: number = 1,
  perPage: number = 15
): Promise<Product[]> => {
  try {
    const url = `${WP_API_URL}/products?page=${page}&per_page=${perPage}&orderby=date&order=desc`;
    return await httpGetJson<Product[]>(url);
  } catch (error) {
    console.error('Error fetching latest products:', error);
    throw error;
  }
};

export const fetchProductsByCategory = async (
  categorySlug: string
): Promise<Product[]> => {
  try {
    if (!categorySlug) {
      return [];
    }

    // First, fetch the category to get its ID
    const categories = await httpGetJson<Category[]>(
      `${WP_API_URL}/categories?slug=${categorySlug}`
    );

    if (!categories || categories.length === 0) {
      return [];
    }

    const categoryId = categories[0].id;

    // Then fetch products by category ID
    return await httpGetJson<Product[]>(
      `${WP_API_URL}/products?category_id=${categoryId}`
    );
  } catch (error) {
    console.error('Error fetching products by category:', error);
    throw error;
  }
};

export const searchCategoriesAndProducts = async (
  searchTerm: string,
  categorySlug?: string
): Promise<{ categories: Category[]; products: Product[] }> => {
  try {
    if (!searchTerm || searchTerm.trim() === '') {
      return { categories: [], products: [] };
    }

    let productUrl = `${WP_API_URL}/products?search=${encodeURIComponent(
      searchTerm
    )}&per_page=15`;

    // If searching within a category, get category ID first
    if (categorySlug) {
      const categories = await httpGetJson<Category[]>(
        `${WP_API_URL}/categories?slug=${categorySlug}`
      );
      if (categories && categories.length > 0) {
        const categoryId = categories[0].id;
        productUrl = `${WP_API_URL}/products?search=${encodeURIComponent(
          searchTerm
        )}&category_id=${categoryId}&per_page=15`;
      }
    }

    // Search categories and products in parallel
    const [categoriesData, productsData] = await Promise.all([
      httpGetJson<Category[]>(
        `${WP_API_URL}/categories?search=${encodeURIComponent(searchTerm)}`
      ),
      httpGetJson<Product[]>(productUrl),
    ]);

    // Fetch featured images for categories
    const categoriesWithImages = await Promise.all(
      categoriesData.map(async (category: Category) => {
        if (category.meta.featured_image) {
          try {
            const mediaData = await httpGetJson<{ source_url?: string }>(
              `${WP_API_URL}/media/${category.meta.featured_image}`
            );
            return {
              ...category,
              meta: {
                ...category.meta,
                featured_image:
                  mediaData.source_url || category.meta.featured_image,
              },
            };
          } catch {
            console.error('Failed to fetch media for category:', category.id);
          }
        }
        return category;
      })
    );

    return {
      categories: categoriesWithImages,
      products: productsData,
    };
  } catch (error) {
    console.error('Error searching:', error);
    throw error;
  }
};

// ==================== TanStack Query Hooks ====================

/**
 * Hook to fetch all categories with caching
 * Categories are cached for 7 days since they rarely change
 */
export const useCategories = (): UseQueryResult<Category[], Error> => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: Infinity, // Categories never go stale - they're static content
    gcTime: Infinity, // Keep in cache forever
    refetchOnMount: false, // Don't refetch on component mount
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnReconnect: false, // Don't refetch on reconnect
    networkMode: 'offlineFirst', // Use cache first, even if online
  });
};

/**
 * Hook to fetch subcategories by parent ID
 * @param parentId - Parent category ID
 */
export const useSubCategories = (
  parentId: number
): UseQueryResult<Category[], Error> => {
  return useQuery({
    queryKey: ['categories', 'subcategories', parentId],
    queryFn: () => fetchSubCategories(parentId),
    enabled: !!parentId,
    staleTime: Infinity, // Subcategories never go stale - they're static content
    gcTime: 1000 * 60 * 60 * 24 * 30, // 30 days cache retention
    refetchOnMount: false, // Don't refetch on component mount
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnReconnect: false, // Don't refetch on reconnect
  });
};

/**
 * Hook to fetch products with caching
 * @param perPage - Number of products to fetch (default: 10)
 */
export const useProducts = (
  perPage: number = 10
): UseQueryResult<Product[], Error> => {
  return useQuery({
    queryKey: ['products', perPage],
    queryFn: () => fetchProducts(perPage),
    staleTime: 1000 * 60 * 5, // 5 minutes - fresh enough to show new products
    gcTime: 1000 * 60 * 30, // 30 minutes cache retention
  });
};

/**
 * Hook to fetch paginated products with optional category filter
 * @param page - Page number (default: 1)
 * @param perPage - Products per page (default: 15)
 * @param categorySlug - Optional category slug to filter by
 */
export const useProductsPaginated = (
  page: number = 1,
  perPage: number = 15,
  categorySlug?: string
): UseQueryResult<Product[], Error> => {
  return useQuery({
    queryKey: ['products', 'paginated', page, perPage, categorySlug],
    queryFn: () => fetchProductsPaginated(page, perPage, categorySlug),
  });
};

/**
 * Hook to fetch products by category slug
 * @param categorySlug - Category slug to filter products
 */
export const useProductsByCategory = (
  categorySlug: string
): UseQueryResult<Product[], Error> => {
  return useQuery({
    queryKey: ['products', 'category', categorySlug],
    queryFn: () => fetchProductsByCategory(categorySlug),
    enabled: !!categorySlug, // Only run query if categorySlug exists
  });
};

/**
 * Hook to search categories and products
 * @param searchTerm - Search term
 * @param categorySlug - Optional category slug to filter search
 */
export const useSearchCategoriesAndProducts = (
  searchTerm: string,
  categorySlug?: string
): UseQueryResult<{ categories: Category[]; products: Product[] }, Error> => {
  return useQuery({
    queryKey: ['search', searchTerm, categorySlug],
    queryFn: () => searchCategoriesAndProducts(searchTerm, categorySlug),
    enabled: !!searchTerm && searchTerm.trim() !== '', // Only run query if search term exists
  });
};

// ==================== Infinite Scroll Hooks ====================

/**
 * Hook to fetch products with infinite scroll by category
 * @param categorySlug - Category slug to filter products
 * @param perPage - Products per page (default: 15)
 */
export const useInfiniteProductsByCategory = (
  categorySlug: string,
  perPage: number = 15,
  enabled: boolean = true
): UseInfiniteQueryResult<
  {
    products: Product[];
    nextPage: number | undefined;
  },
  Error
> => {
  return useInfiniteQuery({
    queryKey: ['products', 'infinite', 'category', categorySlug],
    queryFn: async ({ pageParam = 1 }) => {
      const products = await fetchProductsPaginated(
        pageParam,
        perPage,
        categorySlug
      );
      return {
        products,
        nextPage: products.length === perPage ? pageParam + 1 : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
    enabled: !!categorySlug && enabled,
  });
};

/**
 * Hook to fetch products with infinite scroll (all products)
 * @param perPage - Products per page (default: 15)
 */
export const useInfiniteProducts = (
  perPage: number = 15
): UseInfiniteQueryResult<
  {
    products: Product[];
    nextPage: number | undefined;
  },
  Error
> => {
  return useInfiniteQuery({
    queryKey: ['products', 'infinite', 'all'],
    queryFn: async ({ pageParam = 1 }) => {
      const products = await fetchProductsPaginated(pageParam, perPage);
      return {
        products,
        nextPage: products.length === perPage ? pageParam + 1 : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  });
};

/**
 * Hook to fetch newest products with infinite scroll (ordered by publish date desc)
 * @param perPage - Products per page (default: 15)
 */
export const useInfiniteLatestProducts = (
  perPage: number = 15
): UseInfiniteQueryResult<
  {
    products: Product[];
    nextPage: number | undefined;
  },
  Error
> => {
  return useInfiniteQuery({
    queryKey: ['products', 'infinite', 'latest'],
    queryFn: async ({ pageParam = 1 }) => {
      const products = await fetchLatestProductsPaginated(pageParam, perPage);
      return {
        products,
        nextPage: products.length === perPage ? pageParam + 1 : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  });
};

/**
 * Hook to search products with infinite scroll
 * @param searchTerm - Search term
 * @param categorySlug - Optional category slug to filter search
 * @param perPage - Products per page (default: 15)
 */
export const useInfiniteSearchProducts = (
  searchTerm: string,
  categorySlug?: string,
  perPage: number = 15
): UseInfiniteQueryResult<
  {
    products: Product[];
    categories: Category[];
    nextPage: number | undefined;
  },
  Error
> => {
  return useInfiniteQuery({
    queryKey: ['search', 'infinite', searchTerm, categorySlug],
    queryFn: async ({ pageParam = 1 }) => {
      // For first page, get both categories and products
      if (pageParam === 1) {
        const result = await searchCategoriesAndProducts(
          searchTerm,
          categorySlug
        );
        return {
          products: result.products.slice(0, perPage),
          categories: result.categories,
          nextPage: result.products.length > perPage ? 2 : undefined,
        };
      }
      // For subsequent pages, only get products
      // Note: WordPress search API doesn't support pagination well, so we return empty
      return {
        products: [],
        categories: [],
        nextPage: undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
    enabled: !!searchTerm && searchTerm.trim() !== '',
  });
};
