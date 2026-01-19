import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import productResultsIcon from '@/assets/productResultsIcon.svg';
import heartIcon from '@/assets/heartIcon.svg';
import chemicalsIcon from '@/assets/chemicalsIcon.svg';
import cleanIngredientsIcon from '@/assets/cleanIngredientsIcon.svg';
import productContainerIngIcon from '@/assets/productContainerIngIcon.svg';
import aiIcon from '@/assets/aiIcon.svg';
import {
  type BarcodeProduct,
  type ProductRecommendations,
  getBarcodeRecommendations,
} from '@/services/scanService';
import barcodeAnalysisService from '@/services/barcodeAnalysisService';
import { saveScanResult } from '@/services/scanResultService';
import { useAuth } from '@/context/AuthContext';
import { ProductResultInfoCard } from '@/components/ProductResultInfoCard';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/PageHeader';
import { pickFromGallery, takePicture } from '@/lib/cameraService';
import { toast } from '@/lib/toast';

// Format tag names: replace underscores with spaces and capitalize each word
const formatTagName = (tag: string): string => {
  return tag
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Helper function to detect network errors
const isNetworkError = (error: any): boolean => {
  if (!error) return false;

  const errorMessage = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

  // Check for common network error indicators
  return (
    errorMessage.includes('network') ||
    errorMessage.includes('fetch') ||
    errorMessage.includes('failed to fetch') ||
    errorMessage.includes('networkerror') ||
    errorMessage.includes('network request failed') ||
    errorMessage.includes('offline') ||
    errorMessage.includes('no internet') ||
    errorMessage.includes('connection') ||
    errorMessage.includes('resolve host') ||
    errorMessage.includes('hostname') ||
    errorMessage.includes('dns') ||
    errorMessage.includes('enotfound') ||
    errorMessage.includes('getaddrinfo') ||
    error.name === 'NetworkError' ||
    error.name === 'TypeError' && errorMessage.includes('fetch')
  );
};

const BarcodeProductResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { product: initialProduct, barcode } = location.state as {
    product: BarcodeProduct | null;
    barcode: string;
  };

  // State for product data (starts with basic, updates progressively)
  const [product, setProduct] = useState<BarcodeProduct | null>(initialProduct);
  const [loadingBasicData, setLoadingBasicData] = useState(!initialProduct);
  const [error, setError] = useState<string | null>(null);
  const [isNetworkIssue, setIsNetworkIssue] = useState(false);
  const [loadingIngredients, setLoadingIngredients] = useState(!initialProduct); // Start as true to show skeleton immediately
  const [loadingDescriptions, setLoadingDescriptions] = useState(false);
  const [loadingPackaging, setLoadingPackaging] = useState(!initialProduct); // Start as true to show skeleton immediately
  const [loadingPackagingDescriptions, setLoadingPackagingDescriptions] =
    useState(false);

  // Use ref to track latest product data for recommendations
  const productRef = useRef<BarcodeProduct | null>(initialProduct);

  // Update ref whenever product changes
  useEffect(() => {
    productRef.current = product;
  }, [product]);

  // State for selected items
  const [selectedHarmful, setSelectedHarmful] = useState<string | null>(null);
  const [selectedSafe, setSelectedSafe] = useState<string | null>(null);
  const [selectedPackaging, setSelectedPackaging] = useState<string | null>(
    null
  );
  const [selectedAIAlternative, setSelectedAIAlternative] = useState<{
    name: string;
    brand: string;
    description: string;
    logo_url?: string;
  } | null>(null);

  // State for image modal
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // State for recommendations
  const [recommendations, setRecommendations] =
    useState<ProductRecommendations | null>(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(
    !initialProduct
  ); // Start as true to show skeleton immediately

  // Use modular API to progressively load data
  useEffect(() => {
    if (!barcode) return;

    const loadData = async () => {
      try {
        setLoadingBasicData(true);
        setLoadingIngredients(true);
        setLoadingPackaging(true);

        // Step 1: Fast lookup (1-2s)
        console.log('📦 Fetching basic product info...');
        const lookupResult = await barcodeAnalysisService.lookupBarcode(
          barcode
        );

        console.log('✅ Lookup result:', lookupResult);

        if (!lookupResult.found) {
          setError(
            'Product not found via barcode lookup. Try Scanning the Image.'
          );
          setLoadingBasicData(false);
          setLoadingIngredients(false);
          setLoadingPackaging(false);
          return;
        }

        console.log('✅ Basic info received:', lookupResult.product);

        if (!lookupResult.product) {
          setError('Product data not available');
          setLoadingBasicData(false);
          setLoadingIngredients(false);
          setLoadingPackaging(false);
          return;
        }

        setProduct({
          barcode: barcode,
          name: lookupResult.product.name,
          brand: lookupResult.product.brands || '',
          source: lookupResult.product.source || 'openfoodfacts',
          image_url: lookupResult.product.image_url,
          quantity: lookupResult.product.quantity,
          categories: lookupResult.product.categories,
          ingredients: (lookupResult.product.ingredients_list || []).map(
            (ingredient: string) => ({
              text: ingredient,
              type: 'ingredient',
            })
          ),
          packaging: lookupResult.product.packaging || '',
          materials: {
            packaging: '',
            packaging_text: '',
            packaging_tags: [],
            materials: [],
          },
          nutrition: {},
          labels: '',
          countries: '',
          url: '',
          ingredient_descriptions: { harmful: {}, safe: {} },
        });
        setLoadingBasicData(false);

        // Step 2 & 3: Load ingredients and packaging INDEPENDENTLY (progressive loading!)
        // Launch both in parallel but let each update UI as soon as it's ready

        // Step 2A: Separate ingredients FAST (2-3s) - Show names immediately
        barcodeAnalysisService
          .separateIngredients(barcode, lookupResult.product || undefined)
          .then((separationResult) => {
            console.log('🧪 Ingredient separation received:', separationResult);

            // IMMEDIATELY launch descriptions request (don't wait for state updates)
            setLoadingDescriptions(true);
            barcodeAnalysisService
              .describeIngredients(
                barcode,
                separationResult.harmful,
                separationResult.safe
              )
              .then((descriptionsResult) => {
                console.log(
                  '📝 Ingredient descriptions received:',
                  descriptionsResult
                );
                setProduct((prev) => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    ingredient_descriptions: {
                      harmful: descriptionsResult.descriptions?.harmful || {},
                      safe: descriptionsResult.descriptions?.safe || {},
                    },
                  };
                });
                setLoadingDescriptions(false);
              })
              .catch((err) => {
                console.error('❌ Failed to load descriptions:', err);
                setLoadingDescriptions(false);
              });

            // Show ingredient names immediately with placeholder descriptions
            const harmfulPlaceholders: Record<string, string> = {};
            const safePlaceholders: Record<string, string> = {};

            separationResult.harmful.forEach((name) => {
              harmfulPlaceholders[name] = ''; // Empty string as placeholder
            });

            separationResult.safe.forEach((name) => {
              safePlaceholders[name] = ''; // Empty string as placeholder
            });

            setProduct((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                chemical_analysis: {
                  ...prev.chemical_analysis,
                  safety_score: prev.chemical_analysis?.safety_score || 0,
                  harmful_chemicals: separationResult.harmful.map((name) => ({
                    chemical: name,
                    category: 'ingredient',
                    severity: 'moderate' as const,
                    why_flagged: 'Flagged by AI analysis',
                  })),
                  safe_chemicals: separationResult.safe.map((name) => ({
                    name: name,
                    category: 'ingredient',
                  })),
                },
                ingredient_descriptions: {
                  harmful: harmfulPlaceholders,
                  safe: safePlaceholders,
                },
              };
            });
            setLoadingIngredients(false);
          })
          .catch((err) => {
            console.error('❌ Failed to separate ingredients:', err);
            setLoadingIngredients(false);
            setLoadingDescriptions(false);
          });

        // Step 3A: Separate packaging materials FAST (1-2s) - Show names immediately
        barcodeAnalysisService
          .separatePackaging(barcode, lookupResult.product || undefined)
          .then((separationResult) => {
            console.log('📦 Packaging separation received:', separationResult);

            // IMMEDIATELY launch descriptions request (don't wait for state updates)
            setLoadingPackagingDescriptions(true);
            barcodeAnalysisService
              .describePackaging(
                barcode,
                separationResult.packaging_text,
                separationResult.packaging_tags,
                separationResult.materials, // Pass normalized materials
                separationResult.product_context // Pass product context for better analysis
              )
              .then((descriptionsResult) => {
                console.log(
                  '📝 Packaging descriptions received:',
                  descriptionsResult
                );
                setProduct((prev) => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    packaging_analysis: {
                      ...descriptionsResult.analysis,
                      overall_safety: descriptionsResult.analysis
                        .overall_safety as
                        | 'safe'
                        | 'caution'
                        | 'harmful'
                        | 'unknown',
                    },
                  };
                });
                setLoadingPackagingDescriptions(false);
              })
              .catch((err) => {
                console.error('❌ Failed to load packaging descriptions:', err);
                setLoadingPackagingDescriptions(false);
              });

            // Show material names immediately with placeholder analysis
            const materialPlaceholders: Record<string, any> = {};
            separationResult.materials.forEach((material) => {
              materialPlaceholders[material] = {
                description: '',
                harmful: false,
                health_concerns: '',
                environmental_impact: '',
                severity: 'low',
              };
            });

            setProduct((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                packaging_analysis: {
                  materials: separationResult.materials,
                  analysis: materialPlaceholders,
                  overall_safety: 'unknown' as
                    | 'safe'
                    | 'caution'
                    | 'harmful'
                    | 'unknown',
                  summary: '',
                },
              };
            });
            setLoadingPackaging(false);
          })
          .catch((err) => {
            console.error('❌ Failed to separate packaging:', err);
            setLoadingPackaging(false);
            setLoadingPackagingDescriptions(false);
          });

        // Step 4: Fetch recommendations (can start immediately, doesn't need to wait)
        console.log('🔍 Fetching recommendations...');
        setLoadingRecommendations(true);
        // Use lookupResult.product directly instead of productRef (which hasn't updated yet)
        if (lookupResult.product && lookupResult.product.name) {
          // Create a temporary product object with the structure expected by recommendations
          const productForRecommendations = {
            barcode: barcode,
            name: lookupResult.product.name,
            brand: lookupResult.product.brands || '',
            source: lookupResult.product.source || 'openfoodfacts',
            image_url: lookupResult.product.image_url,
            quantity: lookupResult.product.quantity,
            categories: lookupResult.product.categories,
            ingredients: lookupResult.product.ingredients_list || [],
            packaging: lookupResult.product.packaging || '',
            materials: {
              packaging: '',
              packaging_text: '',
              packaging_tags: [],
              materials: [],
            },
            nutrition: {},
            labels: '',
            countries: '',
            url: '',
            ingredient_descriptions: { harmful: {}, safe: {} },
          };

          getBarcodeRecommendations(barcode, productForRecommendations)
            .then((recs) => {
              console.log('✅ Recommendations received:', recs);
              setRecommendations(recs);
            })
            .catch((err) => {
              console.error('❌ Failed to load recommendations:', err);
            })
            .finally(() => {
              setLoadingRecommendations(false);
            });
        } else {
          setLoadingRecommendations(false);
        }
      } catch (err) {
        console.error('❌ Error loading product data:', err);
        console.error('Error details:', {
          message: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined,
          type: typeof err,
        });

        // Check if it's a network error
        const networkError = isNetworkError(err);
        setIsNetworkIssue(networkError);

        if (networkError) {
          setError('No internet connection detected');
        } else {
          setError(
            err instanceof Error ? err.message : 'Failed to load product data'
          );
        }

        setLoadingBasicData(false);
        setLoadingIngredients(false);
        setLoadingPackaging(false);
        setLoadingRecommendations(false);
      }
    };

    loadData();
  }, [barcode]);

  // Save scan result to database when all data is loaded
  useEffect(() => {
    // Only save when we have complete data and user is authenticated
    const shouldSave =
      product &&
      !loadingBasicData &&
      !loadingIngredients &&
      !loadingDescriptions &&
      !loadingPackaging &&
      !loadingPackagingDescriptions &&
      !loadingRecommendations &&
      barcode;

    if (!shouldSave) return;

    const saveScanData = async () => {
      try {
        // Check if user is authenticated
        if (!isAuthenticated) {
          console.log('💾 User not authenticated, skipping scan result save');
          return;
        }

        console.log('💾 User authenticated, preparing to save scan result...');

        // Extract harmful and safe ingredients
        const harmfulDescriptions =
          product.ingredient_descriptions?.harmful || {};
        const safeDescriptions = product.ingredient_descriptions?.safe || {};

        // Extract packaging analysis
        const packagingAnalysis = product.packaging_analysis;
        const packagingMaterials = packagingAnalysis?.materials || [];
        const packagingDetails = packagingAnalysis?.analysis || {};

        // Prepare harmful ingredients
        const harmfulIngredients = Object.entries(harmfulDescriptions).map(
          ([name, description]) => ({
            name,
            description: String(description),
          })
        );

        // Prepare safe ingredients
        const safeIngredients = Object.entries(safeDescriptions).map(
          ([name, description]) => ({
            name,
            description: String(description),
          })
        );

        // Prepare packaging data
        const packagingData = packagingMaterials
          .map((material) => {
            const details = packagingDetails[material];
            if (!details) return null;

            const formattedName = formatTagName(material);
            return {
              name: formattedName,
              description: `${details.description}\n\n${details.health_concerns !== 'None identified'
                ? `Health Concerns: ${details.health_concerns}\n`
                : ''
                }Environmental Impact: ${details.environmental_impact}`,
            };
          })
          .filter(
            (item): item is { name: string; description: string } =>
              item !== null
          );

        // Prepare recommendations
        const recommendationsData = [];

        // Add WordPress products
        if (recommendations?.products) {
          recommendationsData.push(
            ...recommendations.products.map((product) => ({
              name: product.name,
              brand: product.name.split(' ')[0] || 'Unknown',
              description: product.description,
              image_url: product.image_url,
              price: product.price,
              permalink: product.permalink,
              source: 'wordpress' as const,
            }))
          );
        }

        // Add AI alternatives
        if (recommendations?.ai_alternatives) {
          recommendationsData.push(
            ...recommendations.ai_alternatives.map((alt) => ({
              name: alt.name,
              brand: alt.brand,
              description: alt.description,
              image_url: alt.logo_url,
              source: 'ai' as const,
            }))
          );
        }

        // Prepare chemical analysis
        const chemicalAnalysis = product.chemical_analysis
          ? {
            safety_score: product.chemical_analysis.safety_score,
            total_harmful: Object.keys(harmfulDescriptions).length,
            total_safe: Object.keys(safeDescriptions).length,
          }
          : undefined;

        // Save to database
        const scanData = {
          barcode,
          productName: product.name,
          productBrand: product.brand,
          productImage: product.image_url,
          safeIngredients,
          harmfulIngredients,
          packaging: packagingData,
          packagingSummary: packagingAnalysis?.summary,
          packagingSafety: packagingAnalysis?.overall_safety as
            | 'safe'
            | 'harmful'
            | 'caution'
            | undefined,
          recommendations: recommendationsData,
          chemicalAnalysis,
        };

        console.log('💾 Saving scan result to database:', scanData);
        await saveScanResult(scanData);
        console.log('✅ Scan result saved successfully');
      } catch (error) {
        console.error('❌ Failed to save scan result:', error);
        // Don't show error to user - saving is a background operation
      }
    };

    saveScanData();
  }, [
    product,
    loadingBasicData,
    loadingIngredients,
    loadingDescriptions,
    loadingPackaging,
    loadingPackagingDescriptions,
    loadingRecommendations,
    recommendations,
    barcode,
    isAuthenticated,
  ]);

  // Show error state
  if (error || (!product && !loadingBasicData)) {
    return (
      <section className="relative px-5 pt-6 pb-4 md:mx-7">
        <PageHeader title="Product Analysis" />
        <div className="flex flex-col gap-5 p-4 items-center justify-center min-h-[400px]">
          <p className="text-gray-600 mb-4 text-center">
            Product not found via barcode lookup. Try Scanning the Image.
          </p>
          <button
            onClick={async () => {
              try {
                const photo = await takePicture();
                if (!photo?.webPath) return;

                // Navigate immediately to results page - data will load there
                navigate('/product-identification-results', {
                  state: {
                    scannedImage: photo.webPath,
                  },
                });
              } catch (e) {
                console.error('Product identification error:', e);
                if (e instanceof Error) {
                  toast.error(e.message);
                } else {
                  toast.error('Failed to take photo. Please try again.');
                }
              }
            }}
            className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Take Picture
          </button>
          <button
            onClick={async () => {
              try {
                const photo = await pickFromGallery();
                if (!photo?.webPath) return;

                // Navigate immediately to results page - data will load there
                navigate('/product-identification-results', {
                  state: {
                    scannedImage: photo.webPath,
                  },
                });
              } catch (e) {
                console.error('Product identification error:', e);
                if (e instanceof Error) {
                  toast.error(e.message);
                } else {
                  toast.error('Failed to select photo. Please try again.');
                }
              }
            }}
            className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Browse Photo
          </button>
        </div>
      </section>
    );
  }

  // Removed the early return that caused blank screen
  // Let the component render with loading skeletons instead

  if (!product && !loadingBasicData) {
    // Only show this if we're not loading and have no product
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <p className="text-gray-600 mb-4">No product data available</p>
        <button
          onClick={() => navigate('/scan')}
          className="px-4 py-2 bg-primary text-white rounded-lg"
        >
          Back to Scan
        </button>
      </div>
    );
  }

  // Debug: Log product data to see what we're receiving
  console.log('Product data:', product);
  console.log('Ingredient descriptions:', product?.ingredient_descriptions);
  console.log('Packaging analysis:', product?.packaging_analysis);
  console.log('Chemical analysis:', product?.chemical_analysis);
  console.log('Raw ingredients:', product?.ingredients);
  console.log('Raw packaging:', product?.packaging);

  // Extract harmful and safe ingredients (with null checks)
  const harmfulDescriptions = product?.ingredient_descriptions?.harmful || {};
  const safeDescriptions = product?.ingredient_descriptions?.safe || {};

  // Extract packaging analysis
  const packagingAnalysis = product?.packaging_analysis;
  const packagingMaterials = packagingAnalysis?.materials || [];
  const packagingDetails = packagingAnalysis?.analysis || {};

  // Prepare tags and descriptions
  const harmfulTags = Object.keys(harmfulDescriptions);
  const safeTags = Object.keys(safeDescriptions);

  // Format packaging tags for display (replace underscores and capitalize)
  const packagingTags = packagingMaterials.map((material) =>
    formatTagName(material)
  );

  // Create tag descriptions mappings
  const harmfulTagDescriptions: Record<string, string> = harmfulDescriptions;
  const safeTagDescriptions: Record<string, string> = safeDescriptions;
  const packagingTagDescriptions: Record<string, string> = {};

  // Debug logging for packaging
  console.log('=== PACKAGING DEBUG ===');
  console.log('packagingMaterials:', packagingMaterials);
  console.log('packagingDetails keys:', Object.keys(packagingDetails));
  console.log('packagingDetails:', packagingDetails);

  // Create descriptions map using formatted names as keys
  packagingMaterials.forEach((material) => {
    const formattedName = formatTagName(material);
    const details = packagingDetails[material];
    console.log(`Looking for material: "${material}"`);
    console.log(`Found details:`, details);

    if (details) {
      packagingTagDescriptions[formattedName] = `${details.description}\n\n${details.health_concerns !== 'None identified'
        ? `Health Concerns: ${details.health_concerns}\n`
        : ''
        }Environmental Impact: ${details.environmental_impact}`;
    } else {
      console.warn(`No details found for material: "${material}"`);
    }
  });

  console.log('Final packagingTagDescriptions:', packagingTagDescriptions);
  console.log('=== END PACKAGING DEBUG ===');

  // Determine AI Note message based on data quality
  // const getAINote = () => {
  //   const hasIngredients = harmfulTags.length > 0 || safeTags.length > 0;
  //   const hasPackaging = packagingTags.length > 0;

  //   if (!hasIngredients && !hasPackaging) {
  //     return 'Limited product information available. This analysis is based on available data from Open Food Facts database. Some details may be incomplete.';
  //   }

  //   const warnings = [];

  //   if (
  //     product.chemical_analysis &&
  //     product.chemical_analysis.safety_score < 40
  //   ) {
  //     warnings.push(
  //       '⚠️ This product has a low safety score due to harmful chemicals.'
  //     );
  //   }

  //   if (packagingAnalysis?.overall_safety === 'harmful') {
  //     warnings.push('⚠️ Packaging may contain harmful materials.');
  //   }

  //   if (warnings.length > 0) {
  //     return warnings.join(' ');
  //   }

  //   return 'Analysis based on Open Food Facts database and AI-powered ingredient research.';
  // };

  return (
    <section className="relative px-5 pt-6 pb-4 md:mx-7">
      {/* Header */}
      <PageHeader title="Barcode Product" />

      {/* Product Results Section Header */}
      <section className="rounded-2xl px-4 py-4 bg-white shadow-sm flex gap-2.5 items-center justify-center">
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
          <img
            src={productResultsIcon}
            alt=""
            className="w-4 h-4"
          />
        </div>
        <span className="font-family-segoe text-primary text-base sm:text-[17px] font-bold">
          Product Results
        </span>
      </section>

      {/* Main Product Card */}
      {loadingBasicData ? (
        <div className="mt-3 py-5 px-4 bg-white rounded-2xl shadow-sm flex flex-col gap-5 overflow-hidden">
          <div className="bg-white rounded-2xl w-full shadow-sm p-3.5 flex gap-3 items-start animate-pulse">
            {/* Image skeleton */}
            <div className="w-16 h-16 sm:w-[72px] sm:h-[72px] bg-primary/10 rounded-xl flex-shrink-0"></div>

            {/* Product info skeleton */}
            <div className="flex flex-col flex-1 gap-2 min-w-0 py-1">
              <div className="h-5 bg-primary/10 rounded-lg w-3/4"></div>
              <div className="h-4 bg-primary/10 rounded-lg w-1/2"></div>
            </div>

            {/* Favorite button skeleton */}
            <div className="w-8 h-8 bg-primary/10 rounded-xl flex-shrink-0"></div>
          </div>

          {/* Loading message */}
          <div className="flex items-center justify-center gap-2.5 py-3 bg-primary/5 rounded-xl">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium text-primary">
              Loading product data...
            </span>
          </div>
        </div>
      ) : product ? (
        <div className="mt-3 py-5 px-4 bg-white rounded-2xl shadow-sm flex flex-col gap-5 overflow-hidden">
          <div className="bg-white rounded-2xl w-full shadow-sm border border-gray-100 p-3.5 flex gap-3 items-start">
            {/* Product Image */}
            <div
              className="relative w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-xl overflow-hidden flex-shrink-0 cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-200"
              onClick={() =>
                product.image_url && setSelectedImage(product.image_url)
              }
            >
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                  <span className="text-gray-400 text-xs">No image</span>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col flex-1 gap-1.5 min-w-0 py-0.5">
              {/* Product Name */}
              <h3 className="font-family-segoe font-bold text-[15px] sm:text-base text-gray-900 capitalize leading-snug break-words">
                {product.name}
              </h3>
              {/* Brand */}
              {product.brand && (
                <p className="font-roboto font-normal text-xs sm:text-[13px] text-gray-500 leading-normal truncate">
                  {product.brand}
                </p>
              )}
            </div>

            {/* Favorite Button */}
            <button className="w-8 h-8 sm:w-9 sm:h-9 bg-primary/8 rounded-xl flex items-center justify-center hover:bg-primary/15 active:scale-95 transition-all flex-shrink-0">
              <img src={heartIcon} alt="Favorite" className="w-4 h-4" />
            </button>
          </div>

          {/* Harmful Chemicals Section */}
          {loadingIngredients ? (
            <div
              className="animate-fade-in-up mt-5"
              style={{ animationDelay: '0.1s' }}
            >
              <div className="rounded-2xl px-4 py-5 bg-[#FFF] shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 bg-[#F35959]/10 rounded-xl animate-pulse"></div>
                  <div className="h-4 bg-primary/10 rounded-lg w-48 animate-pulse"></div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <div className="h-8 bg-[#F35959]/10 rounded-lg w-20 animate-pulse"></div>
                  <div className="h-8 bg-[#F35959]/10 rounded-lg w-24 animate-pulse"></div>
                  <div className="h-8 bg-[#F35959]/10 rounded-lg w-16 animate-pulse"></div>
                </div>
                <div className="rounded-xl bg-[#FFF0F0] p-4">
                  <div className="flex items-center gap-2 py-2">
                    <div className="w-4 h-4 border-2 border-[#F35959] border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm font-medium text-[#F35959]">
                      Analyzing ingredients with AI...
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : harmfulTags.length > 0 ? (
            <div
              className="animate-fade-in-up"
              style={{ animationDelay: '0.1s' }}
            >
              <ProductResultInfoCard
                icon={chemicalsIcon}
                title="chemicals and additives"
                titleType="negative"
                tags={harmfulTags}
                tagColor="red"
                tagDescriptions={harmfulTagDescriptions}
                onTagClick={(tag) => setSelectedHarmful(tag)}
                selectedTag={selectedHarmful}
                descTitle={selectedHarmful || 'Harmful Chemicals'}
                description={
                  loadingDescriptions
                    ? 'Analyzing ingredients with AI...'
                    : selectedHarmful && harmfulTagDescriptions[selectedHarmful]
                      ? String(harmfulTagDescriptions[selectedHarmful])
                      : 'Tap on a chemical above to see why it may be harmful'
                }
                isLoadingDescription={loadingDescriptions}
              />
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Clean Ingredients Section */}
      {loadingIngredients ? (
        <section
          className="rounded-2xl px-4 py-5 mt-5 bg-[#FFF] shadow-sm animate-fade-in-up"
          style={{ animationDelay: '0.2s' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-[#4E6C34]/10 rounded-xl animate-pulse"></div>
            <div className="h-4 bg-primary/10 rounded-lg w-56 animate-pulse"></div>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="h-8 bg-[#4E6C34]/10 rounded-lg w-24 animate-pulse"></div>
            <div className="h-8 bg-[#4E6C34]/10 rounded-lg w-20 animate-pulse"></div>
            <div className="h-8 bg-[#4E6C34]/10 rounded-lg w-28 animate-pulse"></div>
            <div className="h-8 bg-[#4E6C34]/10 rounded-lg w-16 animate-pulse"></div>
          </div>
          <div className="rounded-xl bg-[#F0F7EC] p-4">
            <div className="flex items-center gap-2 py-2">
              <div className="w-4 h-4 border-2 border-[#4E6C34] border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-medium text-[#4E6C34]">
                Identifying safe ingredients...
              </span>
            </div>
          </div>
        </section>
      ) : safeTags.length > 0 ? (
        <section
          className="rounded-2xl px-4 py-5 mt-5 bg-[#FFF] shadow-sm overflow-hidden animate-fade-in-up"
          style={{ animationDelay: '0.2s' }}
        >
          <ProductResultInfoCard
            icon={cleanIngredientsIcon}
            title="The clean, safe ingredients"
            titleType="positive"
            tags={safeTags}
            tagColor="green"
            tagDescriptions={safeTagDescriptions}
            onTagClick={(tag) => setSelectedSafe(tag)}
            selectedTag={selectedSafe}
            descTitle={selectedSafe || 'Safe Ingredients'}
            description={
              loadingDescriptions
                ? 'Analyzing ingredients with AI...'
                : selectedSafe && safeTagDescriptions[selectedSafe]
                  ? String(safeTagDescriptions[selectedSafe])
                  : 'Tap on an ingredient above to learn more about it'
            }
            isLoadingDescription={loadingDescriptions}
          />
        </section>
      ) : null}

      {/* Packaging Material Section */}
      {loadingPackaging ? (
        <section
          className="rounded-2xl px-4 py-5 mt-5 bg-[#FFF] shadow-sm animate-fade-in-up"
          style={{ animationDelay: '0.3s' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-primary/10 rounded-xl animate-pulse"></div>
            <div className="h-4 bg-primary/10 rounded-lg w-60 animate-pulse"></div>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="h-8 bg-primary/10 rounded-lg w-20 animate-pulse"></div>
            <div className="h-8 bg-primary/10 rounded-lg w-24 animate-pulse"></div>
          </div>
          <div className="rounded-xl bg-[#F5F0F7] p-4">
            <div className="flex items-center gap-2 py-2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-medium text-primary">
                Analyzing packaging materials...
              </span>
            </div>
          </div>
        </section>
      ) : packagingTags.length > 0 ? (
        <section
          className="rounded-2xl px-4 py-5 mt-5 bg-[#FFF] shadow-sm overflow-hidden animate-fade-in-up"
          style={{ animationDelay: '0.3s' }}
        >
          <ProductResultInfoCard
            icon={productContainerIngIcon}
            title="product container & packaging"
            titleType={
              packagingAnalysis?.overall_safety === 'harmful'
                ? 'negative'
                : packagingAnalysis?.overall_safety === 'safe'
                  ? 'positive'
                  : 'normal'
            }
            tags={packagingTags}
            tagColor={
              packagingAnalysis?.overall_safety === 'harmful'
                ? 'red'
                : packagingAnalysis?.overall_safety === 'safe'
                  ? 'green'
                  : undefined
            }
            tagDescriptions={packagingTagDescriptions}
            onTagClick={(tag) => setSelectedPackaging(tag)}
            selectedTag={selectedPackaging}
            descTitle={selectedPackaging || 'Packaging Overview'}
            description={
              loadingPackagingDescriptions
                ? 'Analyzing packaging materials with AI...'
                : selectedPackaging &&
                  packagingTagDescriptions[selectedPackaging]
                  ? String(packagingTagDescriptions[selectedPackaging])
                  : packagingAnalysis?.summary
                    ? String(packagingAnalysis.summary)
                    : 'Tap on a material above to see details'
            }
            isLoadingDescription={loadingPackagingDescriptions}
          />
        </section>
      ) : null}

      {/* Hippiekit Product Recommendations */}
      <section className="mt-6">
        {loadingRecommendations ? (
          // Loading skeleton
          <div className="animate-pulse">
            <div className="flex items-center justify-center gap-2.5 py-4 mb-4 bg-white rounded-2xl">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="font-family-roboto text-[15px] sm:text-base font-medium text-primary">
                Finding Similar Alternatives
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-3.5 flex gap-3 shadow-sm"
                >
                  <div className="w-16 h-16 bg-primary/10 rounded-xl"></div>
                  <div className="flex-1 flex flex-col gap-2 py-1">
                    <div className="h-4 bg-primary/10 rounded-lg w-3/4"></div>
                    <div className="h-3 bg-primary/10 rounded w-full"></div>
                  </div>
                  <div className="w-20 h-9 bg-[#00A23E]/10 rounded-xl"></div>
                </div>
              ))}
            </div>
          </div>
        ) : recommendations &&
          (recommendations.products.length > 0 ||
            recommendations.ai_alternatives.length > 0) ? (
          <div>
            {/* WordPress Products */}
            {recommendations.products.length > 0 && (
              <div className="mb-6">
                <header className="font-family-segoe text-[15px] sm:text-base font-bold text-gray-800 mb-3.5 flex items-center gap-2">
                  <div className="w-1.5 h-5 bg-[#00A23E] rounded-full"></div>
                  Hippiekit Vetted Swaps
                </header>
                <div className="flex flex-col gap-3">
                  {recommendations.products.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white rounded-2xl w-full shadow-sm p-3.5 flex flex-col sm:flex-row gap-3 items-start sm:items-center overflow-hidden hover:shadow-md active:scale-[0.99] transition-all"
                    >
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-16 h-16 sm:w-[68px] sm:h-[68px] object-cover rounded-xl flex-shrink-0"
                      />

                      <div className="flex flex-col flex-1 gap-1.5 min-w-0">
                        <h3 className="font-family-segoe font-bold text-[14px] sm:text-[15px] text-gray-900 capitalize leading-snug break-words">
                          {product.name}
                        </h3>
                        <p className="font-roboto font-normal text-xs sm:text-[13px] text-gray-500 leading-relaxed line-clamp-2">
                          {product.description}
                        </p>
                        {product.price && (
                          <span className="font-roboto text-xs sm:text-[13px] font-bold text-[#00A23E]">
                            {product.price}
                          </span>
                        )}
                      </div>

                      <Button
                        onClick={() => window.open(product.permalink, '_blank')}
                        className="bg-[#00A23E] text-white px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl hover:bg-[#008f35] active:scale-95 transition-all flex-shrink-0 whitespace-nowrap shadow-sm"
                      >
                        Buy now
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI-Generated Alternatives */}
            {recommendations.ai_alternatives.length > 0 && (
              <div>
                <header className="font-family-segoe text-[15px] sm:text-base font-bold text-gray-800 mb-3.5 flex items-center gap-2">
                  <div className="w-1.5 h-5 bg-[#20799F] rounded-full"></div>
                  Healthier Eco-Friendly Alternatives
                  <div className="flex items-center gap-1 px-2 py-1 bg-linear-to-r from-primary/10 to-[#20799F]/10 rounded-full">
                    <img src={aiIcon} alt="AI" className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold bg-linear-to-r from-primary to-[#20799F] bg-clip-text text-transparent">
                      AI
                    </span>
                  </div>
                </header>
                <div className="flex flex-col gap-3">
                  {recommendations.ai_alternatives.map((alt, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedAIAlternative(alt)}
                      className="bg-white rounded-2xl w-full shadow-sm p-3.5 flex flex-col sm:flex-row gap-3 items-start sm:items-center overflow-hidden cursor-pointer hover:shadow-md active:scale-[0.99] transition-all border border-transparent hover:border-[#20799F]/20"
                    >
                      <div className="w-16 h-16 sm:w-[68px] sm:h-[68px] bg-linear-to-br from-[#00A23E] to-[#20799F] rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
                        {alt.logo_url ? (
                          <img
                            src={alt.logo_url}
                            alt={`${alt.brand} logo`}
                            className="w-full h-full object-contain p-1.5"
                            onError={(e) => {
                              // Fallback to emoji if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML =
                                  '<span class="text-white font-bold text-2xl">🌱</span>';
                              }
                            }}
                          />
                        ) : (
                          <span className="text-white font-bold text-2xl">
                            🌱
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col flex-1 gap-1 min-w-0">
                        <h3 className="font-family-segoe font-bold text-[14px] sm:text-[15px] text-gray-900 leading-snug break-words">
                          {alt.name}
                        </h3>
                        <p className="font-roboto text-xs font-semibold text-[#00A23E]">
                          {alt.brand}
                        </p>
                        <p className="font-roboto font-normal text-xs sm:text-[12px] text-gray-500 leading-relaxed line-clamp-2">
                          {alt.description}
                        </p>
                      </div>

                      {/* Tap indicator */}
                      <div className="hidden sm:flex w-8 h-8 rounded-xl bg-[#20799F]/10 items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-[#20799F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </section>

      {/* Product Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="bg-white rounded-[15px] max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-[0px_4px_20px_0px_rgba(0,0,0,0.25)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with close button */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <h2 className="font-roboto font-bold text-lg text-black">
                {product?.name}
              </h2>
              <button
                onClick={() => setSelectedImage(null)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Image Content */}
            <div className="flex-1 flex items-center justify-center bg-gray-50 overflow-auto">
              <img
                src={selectedImage}
                alt={product?.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = '';
                  e.currentTarget.classList.add('hidden');
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* AI Alternative Detail Modal */}
      {selectedAIAlternative && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedAIAlternative(null)}
        >
          <div
            className="bg-white rounded-[15px] max-w-md w-full max-h-[90vh] overflow-y-auto shadow-[0px_4px_20px_0px_rgba(0,0,0,0.25)] animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with close button */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between rounded-t-[15px]">
              <h2 className="font-roboto font-bold text-lg text-black">
                Product Details
              </h2>
              <button
                onClick={() => setSelectedAIAlternative(null)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col gap-4">
              {/* Logo/Image */}
              <div className="w-full flex justify-center">
                <div className="w-32 h-32 bg-linear-to-br from-[#00A23E] to-[#20799F] rounded-2xl flex items-center justify-center overflow-hidden shadow-lg">
                  {selectedAIAlternative.logo_url ? (
                    <img
                      src={selectedAIAlternative.logo_url}
                      alt={`${selectedAIAlternative.brand} logo`}
                      className="w-full h-full object-contain p-3"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML =
                            '<span class="text-white font-bold text-5xl">🌱</span>';
                        }
                      }}
                    />
                  ) : (
                    <span className="text-white font-bold text-5xl">🌱</span>
                  )}
                </div>
              </div>

              {/* Product Name */}
              <div className="text-center">
                <h3 className="font-roboto font-bold text-xl text-black mb-2">
                  {selectedAIAlternative.name}
                </h3>
                <p className="font-roboto text-base font-semibold text-[#00A23E]">
                  {selectedAIAlternative.brand}
                </p>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200"></div>

              {/* Full Description */}
              <div>
                <h4 className="font-roboto font-semibold text-sm text-gray-700 mb-2">
                  Why This Product?
                </h4>
                <p className="font-roboto text-sm text-[#4e4e4e] leading-relaxed">
                  {selectedAIAlternative.description}
                </p>
              </div>

              {/* AI Note */}
              <div className="bg-[#20799F]/10 border border-[#20799F]/20 rounded-lg p-3">
                <div className="flex gap-2 items-start">
                  <img
                    src={aiIcon}
                    alt="AI"
                    className="w-5 h-5 flex-shrink-0 mt-0.5"
                  />
                  <p className="font-roboto text-xs text-[#20799F] leading-relaxed">
                    This recommendation was AI-generated based on the product
                    you scanned and focuses on healthier, cleaner alternatives.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Debug Info - Remove after testing
      <section className="mt-5 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <h3 className="font-bold text-yellow-800 mb-2">Debug Info</h3>
        <div className="text-xs text-yellow-900 space-y-1">
          <p>Harmful tags: {harmfulTags.length}</p>
          <p>Safe tags: {safeTags.length}</p>
          <p>Packaging tags: {packagingTags.length}</p>
          <p>
            Has ingredient_descriptions:{' '}
            {product.ingredient_descriptions ? 'Yes' : 'No'}
          </p>
          <p>
            Has packaging_analysis: {product.packaging_analysis ? 'Yes' : 'No'}
          </p>
          <p>
            Has chemical_analysis: {product.chemical_analysis ? 'Yes' : 'No'}
          </p>
          <details className="mt-2">
            <summary className="cursor-pointer font-semibold">
              View Raw Data
            </summary>
            <pre className="mt-2 text-xs overflow-auto max-h-60 bg-white p-2 rounded">
              {JSON.stringify(product, null, 2)}
            </pre>
          </details>
        </div>
      </section> */}

      {/* AI Note - Only show if we have AI-generated recommendations */}
      {recommendations && recommendations.ai_alternatives.length > 0 && (
        <section className="mt-8 mb-24 p-4 sm:p-5 text-white font-family-roboto leading-relaxed rounded-2xl bg-linear-to-br from-[#20799F] to-[#1a6585] shadow-lg">
          <header className="flex gap-2.5 font-semibold text-[15px] sm:text-base items-center">
            <div className="w-8 h-8 bg-white/15 rounded-xl flex items-center justify-center">
              <img
                src={aiIcon}
                alt=""
                className="w-4 h-4"
              />
            </div>
            <span>AI Note</span>
          </header>

          <p className="mt-3.5 text-[13px] sm:text-sm text-white/90">
            These products have not been researched by Hippiekit yet. Please
            research before purchasing to ensure they meet your standards.
          </p>
        </section>
      )}
    </section>
  );
};

export default BarcodeProductResults;
