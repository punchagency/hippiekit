import axios from 'axios';
import { tokenStore } from '@/lib/tokenStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface SaveScanResultRequest {
  scanType?: 'barcode' | 'photo';
  barcode?: string;
  productName: string;
  productBrand?: string;
  productImage?: string;
  scannedImage?: string;
  safeIngredients: { name: string; description: string }[];
  harmfulIngredients: { name: string; description: string }[];
  questionableIngredients?: { name: string; description: string }[];
  packaging: { name: string; description: string }[];
  packagingSummary?: string;
  packagingSafety?: 'safe' | 'harmful' | 'caution' | 'unknown';
  recommendations: {
    id?: string;
    name: string;
    brand: string;
    description: string;
    image_url?: string;
    price?: string;
    permalink?: string;
    source: 'wordpress' | 'ai';
  }[];
  chemicalAnalysis?: {
    safety_score?: number;
    total_harmful?: number;
    total_questionable?: number;
    total_safe?: number;
  };
}

export interface ScanResult extends SaveScanResultRequest {
  _id: string;
  userId: string;
  scannedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScanResultsResponse {
  success: boolean;
  data: ScanResult[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ScanStatsResponse {
  success: boolean;
  data: {
    totalScans: number;
    uniqueProducts: number;
    mostScanned: {
      _id: string;
      count: number;
      productName: string;
    }[];
  };
}

// Get authentication token
const getAuthToken = async () => {
  return await tokenStore.getToken();
};

// Save scan result to database
export const saveScanResult = async (
  scanData: SaveScanResultRequest
): Promise<ScanResult> => {
  const token = await getAuthToken();

  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await axios.post(`${API_URL}/api/scan-results`, scanData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  return response.data.data;
};

// Get all scan results for current user
export const getScanResults = async (
  page: number = 1,
  limit: number = 10
): Promise<ScanResultsResponse> => {
  const token = await getAuthToken();

  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await axios.get(`${API_URL}/api/scan-results`, {
    params: { page, limit },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

// Get scan result by ID
export const getScanResultById = async (id: string): Promise<ScanResult> => {
  const token = await getAuthToken();

  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await axios.get(`${API_URL}/api/scan-results/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.data;
};

// Get scan results by barcode
export const getScanResultsByBarcode = async (
  barcode: string
): Promise<ScanResult[]> => {
  const token = await getAuthToken();

  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await axios.get(
    `${API_URL}/api/scan-results/barcode/${barcode}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data.data;
};

// Delete scan result
export const deleteScanResult = async (id: string): Promise<void> => {
  const token = await getAuthToken();

  if (!token) {
    throw new Error('Authentication required');
  }

  await axios.delete(`${API_URL}/api/scan-results/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Delete all scan results
export const deleteAllScanResults = async (): Promise<void> => {
  const token = await getAuthToken();

  if (!token) {
    throw new Error('Authentication required');
  }

  await axios.delete(`${API_URL}/api/scan-results`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Get scan statistics
export const getScanStats = async (): Promise<ScanStatsResponse> => {
  const token = await getAuthToken();

  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await axios.get(`${API_URL}/api/scan-results/stats`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export default {
  saveScanResult,
  getScanResults,
  getScanResultById,
  getScanResultsByBarcode,
  deleteScanResult,
  deleteAllScanResults,
  getScanStats,
};
