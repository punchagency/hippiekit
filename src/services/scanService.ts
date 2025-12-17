const AI_SERVICE_URL =
  import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8001';

export interface ScanProduct {
  id: string;
  name: string;
  price: string;
  image_url: string;
  permalink: string;
  description: string;
  similarity_score: number;
}

export interface ScanResponse {
  success: boolean;
  matches_found: number;
  products: ScanProduct[];
  message: string;
}

/**
 * Scan an image to find matching products using AI
 */
export const scanImage = async (imageUri: string): Promise<ScanResponse> => {
  try {
    // Convert image URI to blob
    const response = await fetch(imageUri);
    const blob = await response.blob();

    // Create form data
    const formData = new FormData();
    formData.append('image', blob, 'photo.jpg');

    // Send to AI service
    const scanResponse = await fetch(`${AI_SERVICE_URL}/scan`, {
      method: 'POST',
      body: formData,
    });

    if (!scanResponse.ok) {
      const error = await scanResponse.json();
      throw new Error(error.detail || 'Failed to scan image');
    }

    const result: ScanResponse = await scanResponse.json();
    return result;
  } catch (error) {
    console.error('Error scanning image:', error);
    throw error;
  }
};

/**
 * Get index statistics
 */
export const getIndexStats = async () => {
  try {
    const response = await fetch(`${AI_SERVICE_URL}/index/stats`);

    if (!response.ok) {
      throw new Error('Failed to get index stats');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting index stats:', error);
    throw error;
  }
};
