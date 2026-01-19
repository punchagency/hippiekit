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

  const errorMessage =
    error instanceof Error
      ? error.message.toLowerCase()
      : String(error).toLowerCase();

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
    (error.name === 'TypeError' && errorMessage.includes('fetch'))
  );
};

const BarcodeProductResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const {
    product: initialProduct,
    barcode,
    savedScanData,
  } = location.state as {
    product: BarcodeProduct | null;
    barcode: string;
    savedScanData?: any;
  };

  // State for product data (starts with basic, updates progressively)
  const [product, setProduct] = useState<BarcodeProduct | null>(initialProduct);
  const [loadingBasicData, setLoadingBasicData] = useState(
    !initialProduct && !savedScanData
  );
  const [error, setError] = useState<string | null>(null);
  const [isNetworkIssue, setIsNetworkIssue] = useState(false);
  const [loadingIngredients, setLoadingIngredients] = useState(
    !initialProduct && !savedScanData
  ); // Start as true to show skeleton immediately
  const [loadingDescriptions, setLoadingDescriptions] = useState(false);
  const [loadingPackaging, setLoadingPackaging] = useState(
    !initialProduct && !savedScanData
  ); // Start as true to show skeleton immediately
  const [loadingPackagingDescriptions, setLoadingPackagingDescriptions] =
    useState(false);
  const [scanSaved, setScanSaved] = useState(false);

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
      // If we have savedScanData (from notification), use it directly
      if (savedScanData) {
        console.log('📦 Loading from saved barcode scan data:', savedScanData);

        // Convert saved data back to BarcodeProduct format
        const harmfulDescriptions: Record<string, string> = {};
        const safeDescriptions: Record<string, string> = {};

        savedScanData.harmfulIngredients?.forEach((ing: any) => {
          harmfulDescriptions[ing.name] = ing.description;
        });

        savedScanData.safeIngredients?.forEach((ing: any) => {
          safeDescriptions[ing.name] = ing.description;
        });

        const packagingDetails: Record<string, any> = {};
        savedScanData.packaging?.forEach((pkg: any) => {
          packagingDetails[pkg.name] = { description: pkg.description };
        });

        setProduct({
          barcode: savedScanData.barcode || barcode,
          name: savedScanData.productName,
          brand: savedScanData.productBrand || '',
          source: 'database',
          image_url: savedScanData.productImage || '',
          quantity: '',
          categories: '',
          ingredients: [
            ...Object.keys(harmfulDescriptions).map((name) => ({
              text: name,
              type: 'harmful' as const,
            })),
            ...Object.keys(safeDescriptions).map((name) => ({
              text: name,
              type: 'safe' as const,
            })),
          ],
          packaging:
            savedScanData.packaging?.map((p: any) => p.name).join(', ') || '',
          materials: {
            packaging: '',
            packaging_text: savedScanData.packagingSummary || '',
            packaging_tags:
              savedScanData.packaging?.map((p: any) => p.name) || [],
            materials: savedScanData.packaging?.map((p: any) => p.name) || [],
          },
          nutrition: {},
          labels: '',
          countries: '',
          url: '',
          ingredient_descriptions: {
            harmful: harmfulDescriptions,
            safe: safeDescriptions,
          },
          packaging_analysis: {
            materials: savedScanData.packaging?.map((p: any) => p.name) || [],
            analysis: packagingDetails,
            summary: savedScanData.packagingSummary || '',
            overall_safety: savedScanData.packagingSafety || 'unknown',
          },
          chemical_analysis: savedScanData.chemicalAnalysis,
        });

        setRecommendations({
          status: 'success',
          products:
            savedScanData.recommendations
              ?.filter((r: any) => r.source === 'wordpress')
              .map((r: any) => ({
                id: r.id,
                name: r.name,
                price: r.price || '',
                image_url: r.image_url,
                permalink: r.permalink,
                description: r.description,
                similarity_score: 1,
                affiliate_url: r.permalink,
              })) || [],
          ai_alternatives:
            savedScanData.recommendations?.filter(
              (r: any) => r.source === 'ai'
            ) || [],
          message: 'Loaded from saved scan',
        });

        // Mark all loading as complete
        setLoadingBasicData(false);
        setLoadingIngredients(false);
        setLoadingPackaging(false);
        setLoadingRecommendations(false);

        // Mark as already saved to prevent duplicate save
        setScanSaved(true);
        return;
      }

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
      barcode &&
      !scanSaved; // Don't save if already saved

    // Debug logging to understand why save might not trigger
    console.log('💾 Save check:', {
      hasProduct: !!product,
      loadingBasicData,
      loadingIngredients,
      loadingDescriptions,
      loadingPackaging,
      loadingPackagingDescriptions,
      loadingRecommendations,
      hasBarcode: !!barcode,
      scanSaved,
      shouldSave,
      isAuthenticated,
    });

    if (!shouldSave) return;

    const saveScanData = async () => {
      try {
        // Check if user is authenticated
        if (!isAuthenticated) {
          console.warn(
            '⚠️ User not authenticated, skipping scan result save. User must be logged in to save scan results and receive notifications.'
          );
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
              description: `${details.description}\n\n${
                details.health_concerns !== 'None identified'
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
              id: product.id,
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
          scanType: 'barcode' as const,
          barcode,
          productName: product.name,
          productBrand: product.brand,
          productImage: product.image_url,
          safeIngredients,
          harmfulIngredients,
          packaging: packagingData,
          packagingSummary: packagingAnalysis?.summary,
          packagingSafety: (() => {
            const safety = packagingAnalysis?.overall_safety;
            if (
              safety === 'safe' ||
              safety === 'harmful' ||
              safety === 'caution'
            ) {
              return safety;
            }
            return 'unknown' as const;
          })(),
          recommendations: recommendationsData,
          chemicalAnalysis,
        };

        console.log('💾 Saving scan result to database:', scanData);
        await saveScanResult(scanData);
        setScanSaved(true);
        console.log('✅ Scan result saved successfully - Notification created');
      } catch (error) {
        console.error('❌ Failed to save scan result:', error);
        console.error('Error details:', {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
        // Show error to user since notifications depend on successful save
        if (error instanceof Error) {
          if (error.message.includes('Authentication') || error.message.includes('401')) {
            console.warn('⚠️ Authentication error - user may need to log in again');
          } else if (error.message.includes('Network') || error.message.includes('fetch')) {
            console.warn('⚠️ Network error - scan result and notification not saved');
          } else {
            console.warn('⚠️ Scan result save failed - notification not created:', error.message);
          }
        }
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
    scanSaved,
  ]);

  // Show error state
  if (error || (!product && !loadingBasicData)) {
    return (
      <section className="relative px-5 pt-6 pb-4 md:mx-7">
        <PageHeader title="Product Analysis" />
        <div className="flex flex-col gap-5 p-2 items-center justify-center min-h-[400px] p-4">
          {isNetworkIssue ? (
            <>
              <div className="text-6xl mb-4">📡</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                No Internet Connection
              </h2>
              <p className="text-gray-600 mb-4 text-center max-w-md">
                Please connect to Wi-Fi or mobile data and try again.
              </p>
              <button
                onClick={() => {
                  // Reset error state and reload the page to retry with same barcode
                  setError(null);
                  setIsNetworkIssue(false);
                  window.location.reload();
                }}
                className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Try Again
              </button>
            </>
          ) : (
            <>
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
                  }
                }}
                className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Browse Photo
              </button>
            </>
          )}
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
      packagingTagDescriptions[formattedName] = `${details.description}\n\n${
        details.health_concerns !== 'None identified'
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
      <section className="rounded-[7px] px-3 sm:px-4 py-5 bg-[#FFF] shadow-[0_2px_4px_0_rgba(0,0,0,0.07)] flex gap-2 items-center justify-center flex-wrap">
        <img
          src={productResultsIcon}
          alt=""
          className="w-5 h-5 flex-shrink-0"
        />
        <span className="font-family-segoe text-primary text-base sm:text-[18px] font-bold">
          Product Results
        </span>
      </section>

      {/* Main Product Card */}
      {loadingBasicData ? (
        <div className="mt-2.5 py-4 sm:py-5 px-3 sm:px-3.5 bg-white rounded-[13px] shadow-[0px_1px_10px_0px_rgba(0,0,0,0.16)] flex flex-col gap-4 sm:gap-6 overflow-hidden">
          <div className="bg-white rounded-[13px] w-full shadow-[0px_1px_10px_0px_rgba(0,0,0,0.16)] p-2.5 flex gap-2 sm:gap-3 items-start animate-pulse">
            {/* Image skeleton */}
            <div className="w-14 h-14 sm:w-[60px] sm:h-[60px] bg-gray-200 rounded-lg flex-shrink-0"></div>

            {/* Product info skeleton */}
            <div className="flex flex-col flex-1 gap-1 sm:gap-2 min-w-0">
              <div className="h-4 sm:h-5 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/2"></div>
            </div>

            {/* Favorite button skeleton */}
            <div className="w-5 h-5 sm:w-[22px] sm:h-[22px] bg-gray-200 rounded-sm flex-shrink-0"></div>
          </div>

          {/* Loading message */}
          <div className="text-center py-2">
            <div className="inline-flex items-center gap-2 text-primary">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-medium">
                Loading product data...
              </span>
            </div>
          </div>
        </div>
      ) : product ? (
        <div className="mt-2.5 py-4 sm:py-5 px-3 sm:px-3.5 bg-white rounded-[13px] shadow-[0px_1px_10px_0px_rgba(0,0,0,0.16)] flex flex-col gap-4 sm:gap-6 overflow-hidden">
          <div className="bg-white rounded-[13px] w-full shadow-[0px_1px_10px_0px_rgba(0,0,0,0.16)] p-2.5 flex gap-2 sm:gap-3 items-start">
            {/* Product Image */}
            <div
              className="relative w-14 h-14 sm:w-[60px] sm:h-[60px] rounded-lg overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
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
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-xs">No image</span>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col flex-1 gap-1 sm:gap-2 min-w-0">
              {/* Product Name */}
              <h3 className="font-roboto font-semibold text-sm sm:text-[16px] text-black capitalize leading-snug break-words">
                {product.name}
              </h3>
              {/* Brand */}
              {product.brand && (
                <p className="font-roboto font-normal text-xs sm:text-[14px] text-[#4e4e4e] leading-normal truncate">
                  {product.brand}
                </p>
              )}
            </div>

            {/* Favorite Button */}
            <button className="w-5 h-5 sm:w-[22px] sm:h-[22px] bg-[rgba(255,255,255,0.3)] p-1 sm:p-[5px] rounded-sm shadow-[0px_2px_16px_0px_rgba(6,51,54,0.1)] flex-shrink-0">
              <img src={heartIcon} alt="Favorite" className="w-full h-full" />
            </button>
          </div>

          {/* Harmful Chemicals Section */}
          {loadingIngredients ? (
            <div
              className="animate-fade-in-up mt-5"
              style={{ animationDelay: '0.1s' }}
            >
              <div className="rounded-[7px] px-3 sm:px-4 py-4 sm:py-5 bg-[#FFF] shadow-[0_2px_4px_0_rgba(0,0,0,0.07)]">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded-full w-24 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded-full w-16 animate-pulse"></div>
                </div>
                <div className="text-center py-3">
                  <div className="inline-flex items-center gap-2 text-primary">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm font-medium">
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
                descTitle={selectedHarmful || 'Harmful Chemicals'}
                description={
                  loadingDescriptions
                    ? 'Analyzing ingredients with AI...'
                    : selectedHarmful && harmfulTagDescriptions[selectedHarmful]
                    ? String(harmfulTagDescriptions[selectedHarmful])
                    : 'Click on a chemical above to see why it may be harmful'
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
          className="rounded-[7px] px-3 sm:px-4 py-4 sm:py-5 mt-5 bg-[#FFF] shadow-[0_2px_4px_0_rgba(0,0,0,0.07)] animate-fade-in-up"
          style={{ animationDelay: '0.2s' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-56 animate-pulse"></div>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            <div className="h-6 bg-gray-200 rounded-full w-24 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded-full w-28 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded-full w-16 animate-pulse"></div>
          </div>
          <div className="text-center py-3">
            <div className="inline-flex items-center gap-2 text-green-600">
              <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-medium">
                Identifying safe ingredients...
              </span>
            </div>
          </div>
        </section>
      ) : safeTags.length > 0 ? (
        <section
          className="rounded-[7px] px-3 sm:px-4 py-4 sm:py-5 mt-5 bg-[#FFF] shadow-[0_2px_4px_0_rgba(0,0,0,0.07)] flex gap-2 items-center justify-center overflow-hidden animate-fade-in-up"
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
            descTitle={selectedSafe || 'Safe Ingredients'}
            description={
              loadingDescriptions
                ? 'Analyzing ingredients with AI...'
                : selectedSafe && safeTagDescriptions[selectedSafe]
                ? String(safeTagDescriptions[selectedSafe])
                : 'Click on an ingredient above to learn more about it'
            }
            isLoadingDescription={loadingDescriptions}
          />
        </section>
      ) : null}

      {/* Packaging Material Section */}
      {loadingPackaging ? (
        <section
          className="rounded-[7px] px-3 sm:px-4 py-4 sm:py-5 mt-5 bg-[#FFF] shadow-[0_2px_4px_0_rgba(0,0,0,0.07)] animate-fade-in-up"
          style={{ animationDelay: '0.3s' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-60 animate-pulse"></div>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            <div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded-full w-24 animate-pulse"></div>
          </div>
          <div className="text-center py-3">
            <div className="inline-flex items-center gap-2 text-blue-600">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-medium">
                Analyzing packaging materials...
              </span>
            </div>
          </div>
        </section>
      ) : packagingTags.length > 0 ? (
        <section
          className="rounded-[7px] px-3 sm:px-4 py-4 sm:py-5 mt-5 bg-[#FFF] shadow-[0_2px_4px_0_rgba(0,0,0,0.07)] flex gap-2 items-center justify-center overflow-hidden animate-fade-in-up"
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
            descTitle={selectedPackaging || 'Packaging Overview'}
            description={
              loadingPackagingDescriptions
                ? 'Analyzing packaging materials with AI...'
                : selectedPackaging &&
                  packagingTagDescriptions[selectedPackaging]
                ? String(packagingTagDescriptions[selectedPackaging])
                : packagingAnalysis?.summary
                ? String(packagingAnalysis.summary)
                : 'Click on a material above to see details'
            }
            isLoadingDescription={loadingPackagingDescriptions}
          />
        </section>
      ) : null}

      {/* Hippiekit Product Recommendations */}
      <section className="mt-5">
        {loadingRecommendations ? (
          // Loading skeleton
          <div className="animate-pulse">
            <div className="text-center py-4 mb-3.5">
              <div className="inline-flex items-center gap-2 text-primary">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="font-family-roboto text-base sm:text-[18px] font-medium">
                  Providing Similar Alternatives
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2.5">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-[13px] p-2.5 flex gap-3"
                >
                  <div className="w-[60px] h-[60px] bg-gray-200 rounded"></div>
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                  </div>
                  <div className="w-20 h-9 bg-gray-200 rounded"></div>
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
              <div className="mb-5">
                <header className="font-family-roboto text-base sm:text-[18px] font-medium mb-3.5">
                  Hippiekit Vetted Swaps
                </header>
                <div className="flex flex-col gap-2.5">
                  {recommendations.products.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => navigate(`/products/${product.id}`)}
                      className="bg-white rounded-[13px] w-full shadow-[0px_1px_10px_0px_rgba(0,0,0,0.16)] p-2.5 flex flex-col sm:flex-row gap-2 sm:gap-3 items-start sm:items-center overflow-hidden cursor-pointer hover:shadow-[0px_2px_15px_0px_rgba(0,0,0,0.22)] transition-shadow"
                    >
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-14 h-14 sm:w-[60px] sm:h-[60px] object-cover rounded-lg flex-shrink-0"
                      />

                      <div className="flex flex-col flex-1 gap-1 min-w-0">
                        <h3 className="font-roboto font-semibold text-sm sm:text-[16px] text-black capitalize leading-snug break-words">
                          {product.name}
                        </h3>
                        <p className="font-roboto font-normal text-xs sm:text-[14px] text-[#4e4e4e] leading-normal line-clamp-2">
                          {product.description}
                        </p>
                        {product.price && (
                          <span className="font-roboto text-xs sm:text-[14px] font-semibold text-[#00A23E]">
                            {product.price}
                          </span>
                        )}
                      </div>

                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(
                            product.affiliate_url || product.permalink,
                            '_blank'
                          );
                        }}
                        className="bg-[#00A23E] text-white px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm hover:bg-[#008f35] transition-colors flex-shrink-0 whitespace-nowrap"
                      >
                        Buy now
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI-Generated Alternatives - Only show when no WordPress products */}
            {recommendations.ai_alternatives.length > 0 &&
              recommendations.products.length === 0 && (
                <div>
                  <header className="font-family-roboto text-base sm:text-[18px] font-medium mb-3.5 flex items-center gap-2">
                    Healthier Eco-Friendly Recommendation
                    <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full">
                      <img src={aiIcon} alt="AI" className="w-4 h-4" />
                      <span className="text-xs font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        AI
                      </span>
                    </div>
                  </header>
                  <div className="flex flex-col gap-2.5">
                    {recommendations.ai_alternatives.map((alt, index) => (
                      <div
                        key={index}
                        onClick={() => setSelectedAIAlternative(alt)}
                        className="bg-white rounded-[13px] w-full shadow-[0px_1px_10px_0px_rgba(0,0,0,0.16)] p-2.5 flex flex-col sm:flex-row gap-2 sm:gap-3 items-start sm:items-center overflow-hidden cursor-pointer hover:shadow-[0px_2px_15px_0px_rgba(0,0,0,0.22)] transition-shadow"
                      >
                        <div className="w-14 h-14 sm:w-[60px] sm:h-[60px] bg-gradient-to-br from-[#00A23E] to-[#20799F] rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {alt.logo_url ? (
                            <img
                              src={alt.logo_url}
                              alt={`${alt.brand} logo`}
                              className="w-full h-full object-contain p-1"
                              onError={(e) => {
                                // Fallback to emoji if image fails to load
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML =
                                    '<span class="text-white font-bold text-lg sm:text-xl">🌱</span>';
                                }
                              }}
                            />
                          ) : (
                            <span className="text-white font-bold text-lg sm:text-xl">
                              🌱
                            </span>
                          )}
                        </div>

                        <div className="flex flex-col flex-1 gap-1 min-w-0">
                          <h3 className="font-roboto font-semibold text-sm sm:text-[16px] text-black leading-snug break-words">
                            {alt.name}
                          </h3>
                          <p className="font-roboto text-xs sm:text-[12px] font-medium text-[#00A23E]">
                            {alt.brand}
                          </p>
                          <p className="font-roboto font-normal text-xs sm:text-[13px] text-[#4e4e4e] leading-normal line-clamp-2">
                            {alt.description}
                          </p>
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
                <div className="w-32 h-32 bg-gradient-to-br from-[#00A23E] to-[#20799F] rounded-2xl flex items-center justify-center overflow-hidden shadow-lg">
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

      {/* AI Note - Only show if AI-generated recommendations are displayed */}
      {recommendations &&
        recommendations.ai_alternatives.length > 0 &&
        recommendations.products.length === 0 && (
          <section className="mt-6 sm:mt-8 mb-20 p-3 sm:p-4 text-white font-family-roboto leading-6 rounded-[10px] bg-[#20799F]">
            <header className="flex gap-2.5 font-medium text-base sm:text-[18px] items-center">
              <img
                src={aiIcon}
                alt=""
                className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0"
              />
              <span>AI Note</span>
            </header>

            <p className="mt-3.5 text-sm sm:text-base">
              These products have not been researched by Hippiekit yet, please
              research before purchasing.
            </p>
          </section>
        )}
    </section>
  );
};

export default BarcodeProductResults;
