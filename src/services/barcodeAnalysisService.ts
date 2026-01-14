/**
 * Modular Barcode API Service
 * Provides separate endpoints for fast, progressive barcode analysis
 */

const AI_SERVICE_URL =
  import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8001';

export interface ProductData {
  name: string;
  brands: string;
  brand: string;
  image_url: string;
  categories: string;
  quantity: string;
  packaging: string;
  ingredients_text: string;
  ingredients_list: string[];
  has_ingredients: boolean;
  materials: any;
  nutrition: any;
  labels: string;
  countries: string;
  url: string;
  source: string;
}

export interface IngredientsAnalysis {
  success: boolean;
  has_ingredients: boolean;
  harmful: string[];
  safe: string[];
  harmful_count: number;
  safe_count: number;
  descriptions: {
    harmful: Record<string, string>;
    safe: Record<string, string>;
  };
  message: string;
}

export interface IngredientsSeparation {
  success: boolean;
  has_ingredients: boolean;
  harmful: string[];
  safe: string[];
  harmful_count: number;
  safe_count: number;
  total_count: number;
  message: string;
}

export interface IngredientsDescriptions {
  success: boolean;
  descriptions: {
    harmful: Record<string, string>;
    safe: Record<string, string>;
  };
  message: string;
}

export interface PackagingAnalysis {
  success: boolean;
  has_packaging_data: boolean;
  analysis: {
    materials: string[];
    analysis: Record<string, any>;
    overall_safety: string;
    summary: string;
    source: string;
  };
  message: string;
}

export interface PackagingSeparation {
  success: boolean;
  has_packaging_data: boolean;
  materials: string[];
  packaging_text: string;
  packaging_tags: string[];
  source: string;
  product_context?: {
    brand_name?: string | null;
    product_name?: string | null;
    categories?: string | null;
    categories_tags?: string[];
    food_contact?: boolean | null;
    packagings_data?: any[];
  };
  message: string;
}

export interface PackagingDescriptions {
  success: boolean;
  analysis: {
    materials: string[];
    analysis: Record<string, any>;
    overall_safety: string;
    summary: string;
  };
  message: string;
}

/**
 * STEP 1: Get basic product info (FAST - 1-2 seconds)
 */
export const lookupBarcode = async (
  barcode: string
): Promise<{
  success: boolean;
  found: boolean;
  product: ProductData | null;
  message: string;
}> => {
  try {
    console.log(
      `🔍 Calling AI service: ${AI_SERVICE_URL}/barcode/lookup?barcode=${barcode}`
    );

    const response = await fetch(
      `${AI_SERVICE_URL}/barcode/lookup?barcode=${encodeURIComponent(barcode)}`,
      {
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      }
    );

    console.log('📡 Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error Response:', errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('📦 API Response data:', data);
    return data;
  } catch (error) {
    console.error('❌ Fetch error in lookupBarcode:', error);
    throw error;
  }
};

/**
 * STEP 2A: Separate ingredients (FAST - 2-3 seconds) - Get names only
 */
export const separateIngredients = async (
  barcode: string,
  productData?: ProductData
): Promise<IngredientsSeparation> => {
  const response = await fetch(
    `${AI_SERVICE_URL}/barcode/ingredients/separate`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({
        barcode,
        product_data: productData || null,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

/**
 * STEP 2B: Get ingredient descriptions (SLOW - 3-5 seconds) - Call after separation
 */
export const describeIngredients = async (
  barcode: string,
  harmfulIngredients: string[],
  safeIngredients: string[]
): Promise<IngredientsDescriptions> => {
  const response = await fetch(
    `${AI_SERVICE_URL}/barcode/ingredients/describe`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({
        barcode,
        harmful_ingredients: harmfulIngredients,
        safe_ingredients: safeIngredients,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

/**
 * STEP 2 (Legacy): Analyze ingredients with AI (MEDIUM - 5-10 seconds)
 * @deprecated Use separateIngredients + describeIngredients for progressive loading
 */
export const analyzeIngredients = async (
  barcode: string,
  productData?: ProductData
): Promise<IngredientsAnalysis> => {
  const response = await fetch(
    `${AI_SERVICE_URL}/barcode/ingredients/analyze`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({
        barcode,
        product_data: productData || null,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

/**
 * STEP 3A: Separate packaging materials (FAST - 1-2 seconds) - Get names only
 */
export const separatePackaging = async (
  barcode: string,
  productData?: ProductData
): Promise<PackagingSeparation> => {
  const response = await fetch(`${AI_SERVICE_URL}/barcode/packaging/separate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
    body: JSON.stringify({
      barcode,
      product_data: productData || null,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

/**
 * STEP 3B: Get packaging descriptions (SLOW - 3-5 seconds) - Call after separation
 */
export const describePackaging = async (
  barcode: string,
  packagingText: string,
  packagingTags: string[],
  normalizedMaterials?: string[],
  productContext?: PackagingSeparation['product_context']
): Promise<PackagingDescriptions> => {
  const response = await fetch(`${AI_SERVICE_URL}/barcode/packaging/describe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
    body: JSON.stringify({
      barcode,
      packaging_text: packagingText,
      packaging_tags: packagingTags,
      normalized_materials: normalizedMaterials,
      brand_name: productContext?.brand_name || null,
      product_name: productContext?.product_name || null,
      categories: productContext?.categories || null,
      food_contact: productContext?.food_contact ?? null,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

/**
 * STEP 3 (Legacy): Analyze packaging (MEDIUM - 3-7 seconds)
 * @deprecated Use separatePackaging + describePackaging for progressive loading
 */
export const analyzePackaging = async (
  barcode: string,
  productData?: ProductData
): Promise<PackagingAnalysis> => {
  const response = await fetch(`${AI_SERVICE_URL}/barcode/packaging/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
    body: JSON.stringify({
      barcode,
      product_data: productData || null,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

/**
 * Complete barcode analysis flow with progress callbacks
 */
export interface AnalysisCallbacks {
  onProductLoaded?: (product: ProductData) => void;
  onIngredientsAnalyzed?: (analysis: IngredientsAnalysis) => void;
  onPackagingAnalyzed?: (analysis: PackagingAnalysis) => void;
  onComplete?: () => void;
  onError?: (error: string, step: string) => void;
}

export const analyzeBarcodeComplete = async (
  barcode: string,
  callbacks: AnalysisCallbacks
) => {
  try {
    // Step 1: Get basic product info
    const productResult = await lookupBarcode(barcode);

    if (!productResult.found || !productResult.product) {
      callbacks.onError?.('Product not found', 'lookup');
      return;
    }

    callbacks.onProductLoaded?.(productResult.product);

    // Step 2 & 3: Run ingredients and packaging analysis in parallel
    const [ingredientsResult, packagingResult] = await Promise.allSettled([
      analyzeIngredients(barcode, productResult.product).then((result) => {
        callbacks.onIngredientsAnalyzed?.(result);
        return result;
      }),
      analyzePackaging(barcode, productResult.product).then((result) => {
        callbacks.onPackagingAnalyzed?.(result);
        return result;
      }),
    ]);

    // Check for errors
    if (ingredientsResult.status === 'rejected') {
      callbacks.onError?.(ingredientsResult.reason.message, 'ingredients');
    }

    if (packagingResult.status === 'rejected') {
      callbacks.onError?.(packagingResult.reason.message, 'packaging');
    }

    callbacks.onComplete?.();
  } catch (error) {
    callbacks.onError?.(
      error instanceof Error ? error.message : 'Unknown error',
      'general'
    );
  }
};

// Default export for convenience
export default {
  lookupBarcode,
  separateIngredients,
  describeIngredients,
  separatePackaging,
  describePackaging,
  analyzeIngredients, // deprecated - use separate + describe
  analyzePackaging, // deprecated - use separate + describe
  analyzeBarcodeComplete,
};
