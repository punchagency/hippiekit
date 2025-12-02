import { getValidToken } from '@/lib/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export type FavoriteItem = {
  _id: string;
  userId: string;
  productId: number;
  product: { title: string; image: string; priceText?: string };
  categories: Array<{ id: number; name: string; slug: string; image?: string }>;
  createdAt: string;
};

export type FavoritesResponse = {
  success: boolean;
  data: FavoriteItem[];
  meta: { page: number; limit: number; total: number; hasMore: boolean };
};

export const addFavorite = async (productId: number) => {
  const token = getValidToken();
  if (!token) throw new Error('Not authorized');
  const res = await fetch(`${API_URL}/api/favorites/${productId}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
  });
  if (!res.ok && res.status !== 200 && res.status !== 201) {
    const err = await res.text();
    throw new Error(err || 'Failed to add favorite');
  }
  return res.json().catch(() => ({}));
};

export const removeFavorite = async (productId: number) => {
  const token = getValidToken();
  if (!token) throw new Error('Not authorized');
  const res = await fetch(`${API_URL}/api/favorites/${productId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true',
    },
  });
  if (!res.ok && res.status !== 204) {
    const err = await res.text();
    throw new Error(err || 'Failed to remove favorite');
  }
  return true;
};

export const listFavorites = async (params?: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}): Promise<FavoritesResponse> => {
  const token = getValidToken();
  if (!token) {
    console.warn('No valid token for favorites');
    return {
      success: false,
      data: [],
      meta: { page: 1, limit: 15, total: 0, hasMore: false },
    };
  }
  const q = new URLSearchParams();
  if (params?.page) q.set('page', String(params.page));
  if (params?.limit) q.set('limit', String(params.limit));
  if (params?.category) q.set('category', params.category);
  if (params?.search) q.set('search', params.search);
  const res = await fetch(`${API_URL}/api/favorites?${q.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
  });
  if (!res.ok) {
    console.error('Failed to load favorites:', res.status, res.statusText);
    const contentType = res.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to load favorites');
    } else {
      const text = await res.text();
      console.error('Non-JSON response:', text.substring(0, 200));
      throw new Error(`Server error: ${res.status}`);
    }
  }
  return res.json();
};

export const listFavoriteCategories = async (): Promise<{
  success: boolean;
  data: Array<{
    id: number;
    name: string;
    slug: string;
    count: number;
    image?: string;
  }>;
}> => {
  const token = getValidToken();
  if (!token) {
    console.warn('No valid token for favorites categories');
    return { success: false, data: [] };
  }
  const res = await fetch(`${API_URL}/api/favorites/categories`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
  });
  if (!res.ok) {
    console.error(
      'Failed to load favorite categories:',
      res.status,
      res.statusText
    );
    const contentType = res.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to load favorite categories');
    } else {
      const text = await res.text();
      console.error('Non-JSON response:', text.substring(0, 200));
      throw new Error(`Server error: ${res.status}`);
    }
  }
  return res.json();
};
