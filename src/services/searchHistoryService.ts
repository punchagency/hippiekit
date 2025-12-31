import { getValidToken } from '@/lib/auth';

// Ensure API_BASE_URL always ends with /api
const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_BASE_URL = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

export interface SearchHistoryResponse {
  success: boolean;
  data: string[];
  message?: string;
}

// Get search history
export const getSearchHistory = async (): Promise<string[]> => {
  const token = await getValidToken();

  if (!token) {
    console.warn('No token available for search history');
    return [];
  }

  try {
    const response = await fetch(`${API_BASE_URL}/search-history`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        'Failed to fetch search history:',
        response.status,
        errorText
      );
      return [];
    }

    const result: SearchHistoryResponse = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching search history:', error);
    return [];
  }
};

// Add search term to history
export const addSearchHistory = async (
  searchTerm: string
): Promise<string[]> => {
  const token = await getValidToken();

  if (!token || !searchTerm.trim()) {
    return [];
  }

  try {
    const response = await fetch(`${API_BASE_URL}/search-history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ searchTerm: searchTerm.trim() }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        'Failed to add search history:',
        response.status,
        errorText
      );
      return [];
    }

    const result: SearchHistoryResponse = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error adding search history:', error);
    return [];
  }
};

// Clear all search history
export const clearSearchHistory = async (): Promise<boolean> => {
  const token = await getValidToken();

  if (!token) {
    return false;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/search-history`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        'Failed to clear search history:',
        response.status,
        errorText
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error clearing search history:', error);
    return false;
  }
};

// Delete specific search term
export const deleteSearchTerm = async (
  searchTerm: string
): Promise<string[]> => {
  const token = await getValidToken();

  if (!token) {
    return [];
  }

  try {
    const response = await fetch(`${API_BASE_URL}/search-history/term`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ searchTerm }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        'Failed to delete search term:',
        response.status,
        errorText
      );
      return [];
    }

    const result: SearchHistoryResponse = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error deleting search term:', error);
    return [];
  }
};
