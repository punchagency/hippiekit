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
  affiliate_url?: string;
}

export interface AIGeneratedProduct {
  name: string;
  brand: string;
  description: string;
  type: 'ai_generated';
  logo_url?: string;
}

export interface ProductRecommendations {
  status: 'success' | 'partial' | 'ai_fallback' | 'error';
  products: ScanProduct[];
  ai_alternatives: AIGeneratedProduct[];
  message: string;
  embedding_method?: 'image' | 'text' | 'error';
}

export interface ScanResponse {
  success: boolean;
  matches_found: number;
  products: ScanProduct[];
  message: string;
}

export interface BarcodeProduct {
  barcode: string;
  name: string;
  brand: string;
  categories: string;
  source: string;
  image_url: string;
  ingredients: Array<{
    text: string;
    type: string;
    id?: string;
    percent?: number;
    vegan?: boolean | null;
    vegetarian?: boolean | null;
  }>;
  materials: {
    packaging: string;
    packaging_text: string;
    packaging_tags: string[];
    materials: string[];
  };
  nutrition: {
    energy_kcal?: number;
    energy_kj?: number;
    fat?: number;
    saturated_fat?: number;
    carbohydrates?: number;
    sugars?: number;
    fiber?: number;
    proteins?: number;
    salt?: number;
    sodium?: number;
    nutrition_score?: number;
    nutrition_grade?: string;
  };
  labels: string;
  packaging: string;
  quantity: string;
  countries: string;
  url: string;
  chemical_analysis?: {
    harmful_chemicals: Array<{
      chemical: string;
      category: string;
      severity: 'critical' | 'high' | 'moderate' | 'low';
      why_flagged: string;
    }>;
    safe_chemicals?: Array<{
      name: string;
      category: string;
    }>;
    safety_score: number;
    recommendations?: {
      avoid: string[];
      look_for: string[];
      certifications: string[];
    };
  };
  ingredient_descriptions?: {
    safe: Record<string, string>;
    harmful: Record<string, string>;
  };
  packaging_analysis?: {
    materials: string[];
    analysis: Record<
      string,
      {
        description: string;
        harmful: boolean;
        health_concerns: string;
        environmental_impact: string;
        severity: 'low' | 'moderate' | 'high' | 'critical';
      }
    >;
    overall_safety: 'safe' | 'caution' | 'harmful' | 'unknown';
    summary: string;
  };
  recommendations?: ProductRecommendations;
}

export interface BarcodeLookupResponse {
  success: boolean;
  found: boolean;
  product: BarcodeProduct | null;
  message: string;
}

export interface ProductIdentificationResponse {
  product_name: string;
  brand: string;
  category: string;
  product_type: string;
  ingredients: string;
  marketing_claims: string[];
  certifications_visible: string[];
  barcode?: string;
  container_info: {
    material: string;
    type: string;
    size: string;
  };
  data_source:
    | 'database'
    | 'web_search'
    | 'ai_knowledge'
    | 'category_generic'
    | 'ai_vision';
  confidence: 'high' | 'medium' | 'low';
  ingredients_note?: string;
  ingredient_descriptions?: {
    safe: Record<string, string>;
    harmful: Record<string, string>;
  };
  packaging_analysis?: {
    materials: string[];
    analysis: Record<
      string,
      {
        description: string;
        harmful: boolean;
        health_concerns: string;
        environmental_impact: string;
        severity: string;
      }
    >;
    overall_safety: 'safe' | 'caution' | 'harmful' | 'unknown';
    summary: string;
  };
  chemical_analysis: {
    flags: Array<{
      chemical: string;
      category: string;
      severity: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
      why_flagged: string;
    }>;
    safety_score: number;
    recommendations: {
      avoid: string[];
      look_for: string[];
      certifications: string[];
    };
    data_source: string;
    confidence: string;
  };
}

export interface VisionAnalysis {
  product_info: {
    name: string;
    brand: string;
    category: string;
    type: string;
  };
  visible_text: string;
  ingredients: string;
  concerning_chemicals: string;
  packaging: {
    material: string;
    type: string;
    recyclable: string;
  };
  nutrition: string;
  health_assessment: {
    score: number;
    risk_level: string;
    concerns: string;
    benefits: string;
    explanation: string;
  };
  eco_assessment: {
    score: number;
    concerns: string;
    benefits: string;
    explanation: string;
  };
  recommendation: {
    avoid: string;
    reasons: string;
    alternatives: string;
  };
  raw_analysis: string;
  chemical_analysis?: {
    flags: Array<{
      chemical: string;
      category: string;
      severity: 'critical' | 'high' | 'moderate' | 'low';
      why_flagged: string;
    }>;
    safety_score: number | null;
    recommendations: {
      avoid: string[];
      look_for: string[];
      certifications: string[];
    };
  };
}

export interface VisionAnalysisResponse {
  success: boolean;
  message: string;
  analysis: VisionAnalysis | null;
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
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
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
 * Scan an image with OpenAI Vision to extract OCR + analysis
 */
export const scanImageVision = async (
  imageUri: string
): Promise<VisionAnalysisResponse> => {
  try {
    const response = await fetch(imageUri);
    const blob = await response.blob();

    const formData = new FormData();
    formData.append('image', blob, 'photo.jpg');

    // Set up timeout for the API call (45 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);

    try {
      const res = await fetch(`${AI_SERVICE_URL}/scan-vision`, {
        method: 'POST',
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || 'Failed to run vision analysis');
      }

      const result: VisionAnalysisResponse = await res.json();
      return result;
    } catch (fetchError) {
      clearTimeout(timeoutId);

      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        throw new Error(
          'Vision analysis timed out. Please try again with a clearer, closer photo of the product label.'
        );
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('Error running vision scan:', error);
    throw error;
  }
};

/**
 * Look up a product by barcode (BASIC - fast initial load)
 * Returns essential data only: name, brand, image, safety score
 * Use this for initial page navigation, then call separate ingredient/packaging analysis
 */
export const lookupBarcodeBasic = async (
  barcode: string
): Promise<BarcodeLookupResponse> => {
  try {
    const response = await fetch(
      `${AI_SERVICE_URL}/barcode/lookup?barcode=${encodeURIComponent(barcode)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to lookup barcode');
    }

    const result: BarcodeLookupResponse = await response.json();
    return result;
  } catch (error) {
    console.error('Error looking up barcode (basic):', error);
    throw error;
  }
};

/**
 * Get product recommendations for a barcode-scanned product
 * This is called separately after the main barcode lookup to avoid slowing down initial results
 *
 * @param barcode - The product barcode
 * @param productData - Optional pre-fetched product data to avoid redundant API calls
 */
export const getBarcodeRecommendations = async (
  barcode: string,
  productData?: any
): Promise<ProductRecommendations | null> => {
  try {
    const response = await fetch(`${AI_SERVICE_URL}/barcode/recommendations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({
        barcode,
        product_data: productData, // Pass product data to avoid redundant API call
      }),
    });

    if (!response.ok) {
      console.error('Failed to get recommendations:', response.statusText);
      return null;
    }

    const data = await response.json();

    if (data.success && data.recommendations) {
      return data.recommendations;
    }

    return null;
  } catch (error) {
    console.error('Error getting barcode recommendations:', error);
    return null;
  }
};

/**
 * Get product recommendations by product name and brand (for photo identification)
 * Uses all OCR-extracted data for rich semantic matching
 */
export const getProductRecommendations = async (
  productName: string,
  brand: string,
  category?: string,
  ingredients?: string,
  marketingClaims?: string,
  certifications?: string,
  productType?: string,
  imageUri?: string
): Promise<ProductRecommendations | null> => {
  try {
    // Create form data to send image along with product info
    const formData = new FormData();
    formData.append('product_name', productName);
    formData.append('brand', brand || '');
    if (category) {
      formData.append('category', category);
    }
    if (ingredients) {
      formData.append('ingredients', ingredients);
    }
    if (marketingClaims) {
      formData.append('marketing_claims', marketingClaims);
    }
    if (certifications) {
      formData.append('certifications', certifications);
    }
    if (productType) {
      formData.append('product_type', productType);
    }

    // If image URI is provided, convert to blob and attach
    if (imageUri) {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      formData.append('image', blob, 'product-photo.jpg');
    }

    const apiResponse = await fetch(
      `${AI_SERVICE_URL}/identify/product/recommendations`,
      {
        method: 'POST',
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
        body: formData,
      }
    );

    console.log('Recommendations API response status:', apiResponse.status);

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error(
        'Failed to get product recommendations:',
        apiResponse.statusText,
        errorText
      );
      return null;
    }

    const data = await apiResponse.json();
    console.log('Recommendations API response data:', data);

    if (data.success && data.recommendations) {
      return data.recommendations;
    }

    console.warn('API returned success=false or no recommendations:', data);
    return null;
  } catch (error) {
    console.error('Error getting product recommendations:', error);
    return null;
  }
};

/**
 * Get index statistics
 */
export const getIndexStats = async () => {
  try {
    const response = await fetch(`${AI_SERVICE_URL}/index/stats`, {
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get index stats');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting index stats:', error);
    throw error;
  }
};

/**
 * Identify product from front photo and get complete analysis
 * Uses multi-tier approach: Database -> Web Search -> AI Knowledge -> Category Generic
 */
export const identifyProduct = async (
  imageUri: string
): Promise<ProductIdentificationResponse> => {
  try {
    const response = await fetch(imageUri);
    const blob = await response.blob();

    const formData = new FormData();
    formData.append('image', blob, 'product-photo.jpg');

    // Set up timeout for the API call (60 seconds for web search)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      const res = await fetch(`${AI_SERVICE_URL}/identify/product`, {
        method: 'POST',
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || 'Failed to identify product');
      }

      const result: ProductIdentificationResponse = await res.json();
      return result;
    } catch (fetchError) {
      clearTimeout(timeoutId);

      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        throw new Error(
          'Product identification timed out. This may happen when searching for ingredients online. Please try again.'
        );
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('Error identifying product:', error);
    throw error;
  }
};

// ===== MODULAR PHOTO IDENTIFICATION API (Progressive Loading) =====

/**
 * Step 1: Get basic product info from image (FAST - 1-2s)
 */
export const identifyProductBasic = async (imageUri: string) => {
  try {
    const response = await fetch(imageUri);
    const blob = await response.blob();

    const formData = new FormData();
    formData.append('image', blob, 'product-photo.jpg');

    const res = await fetch(`${AI_SERVICE_URL}/identify/product/basic`, {
      method: 'POST',
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Failed to identify product');
    }

    return await res.json();
  } catch (error) {
    console.error('Error identifying product (basic):', error);
    throw error;
  }
};

/**
 * Step 2: Separate ingredients into harmful/safe (FAST - 2-3s)
 */
export const separatePhotoIngredients = async (
  productName: string,
  brand: string,
  category?: string
) => {
  try {
    const formData = new FormData();
    formData.append('product_name', productName);
    formData.append('brand', brand);
    if (category) formData.append('category', category);

    const res = await fetch(`${AI_SERVICE_URL}/identify/ingredients/separate`, {
      method: 'POST',
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Failed to separate ingredients');
    }

    return await res.json();
  } catch (error) {
    console.error('Error separating ingredients:', error);
    throw error;
  }
};

/**
 * Step 3: Get AI descriptions for ingredients (SLOWER - 3-5s)
 */
export const describePhotoIngredients = async (
  harmfulIngredients: string[],
  safeIngredients: string[]
) => {
  try {
    const formData = new FormData();
    formData.append('harmful_ingredients', harmfulIngredients.join(','));
    formData.append('safe_ingredients', safeIngredients.join(','));

    const res = await fetch(`${AI_SERVICE_URL}/identify/ingredients/describe`, {
      method: 'POST',
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Failed to describe ingredients');
    }

    return await res.json();
  } catch (error) {
    console.error('Error describing ingredients:', error);
    throw error;
  }
};

/**
 * Step 4: Get packaging material names (FAST - <1s with vision data)
 */
export const separatePhotoPackaging = async (
  productName: string,
  brand: string,
  category?: string,
  containerMaterial?: string,
  containerType?: string
) => {
  try {
    const formData = new FormData();
    formData.append('product_name', productName);
    formData.append('brand', brand);
    if (category) formData.append('category', category);
    if (containerMaterial)
      formData.append('container_material', containerMaterial);
    if (containerType) formData.append('container_type', containerType);

    const res = await fetch(`${AI_SERVICE_URL}/identify/packaging/separate`, {
      method: 'POST',
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Failed to find packaging');
    }

    return await res.json();
  } catch (error) {
    console.error('Error finding packaging:', error);
    throw error;
  }
};

/**
 * Step 5: Get detailed packaging analysis (SLOWER - 2-4s)
 */
export const describePhotoPackaging = async (
  packagingText: string,
  materials: string[],
  brandName?: string,
  productName?: string,
  category?: string
) => {
  try {
    const formData = new FormData();
    formData.append('packaging_text', packagingText);
    formData.append('materials', materials.join(','));
    if (brandName) formData.append('brand_name', brandName);
    if (productName) formData.append('product_name', productName);
    if (category) formData.append('category', category);

    const res = await fetch(`${AI_SERVICE_URL}/identify/packaging/describe`, {
      method: 'POST',
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Failed to analyze packaging');
    }

    return await res.json();
  } catch (error) {
    console.error('Error analyzing packaging:', error);
    throw error;
  }
};
