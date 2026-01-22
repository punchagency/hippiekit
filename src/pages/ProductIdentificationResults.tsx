import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import productResultsIcon from '@/assets/productResultsIcon.svg';
import heartIcon from '@/assets/heartIcon.svg';
import chemicalsIcon from '@/assets/chemicalsIcon.svg';
import cleanIngredientsIcon from '@/assets/cleanIngredientsIcon.svg';
import productContainerIngIcon from '@/assets/productContainerIngIcon.svg';
import aiIcon from '@/assets/aiIcon.svg';
import type { ProductRecommendations } from '@/services/scanService';
import {
  getProductRecommendations,
  identifyProductBasic,
  separatePhotoIngredients,
  describePhotoIngredients,
  separatePhotoPackaging,
  describePhotoPackaging,
} from '@/services/scanService';
import { ProductResultInfoCard } from '@/components/ProductResultInfoCard';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/PageHeader';
import { saveScanResult, getScanResults } from '@/services/scanResultService';
import { useUploadThing } from '@/lib/uploadthing';
import { useScanCache } from '@/context/ScanCacheContext';

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

const ProductIdentificationResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isProcessingRef = useRef(false);
  const { getLatestPhotoScan, setPhotoScan } = useScanCache();

  // Get scannedImage and savedScanData from location state
  const locationState = location.state as {
    scannedImage?: string;
    savedScanData?: any;
  } | null;

  const scannedImage = locationState?.scannedImage;
  const savedScanData = locationState?.savedScanData;

  // Capture these values on mount to prevent re-running useEffect
  const initialDataRef = useRef({
    scannedImage,
    savedScanData,
    captured: false,
  });

  // Capture values only once on mount
  if (!initialDataRef.current.captured) {
    initialDataRef.current = {
      scannedImage,
      savedScanData,
      captured: true,
    };
  }

  // State for product data (starts with null, builds progressively)
  const [product, setProduct] = useState<any>(null); // Basic product info
  const [loadingBasicData, setLoadingBasicData] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [isNetworkIssue, setIsNetworkIssue] = useState(false);

  // Progressive loading states
  const [loadingIngredients, setLoadingIngredients] = useState(false);
  const [loadingDescriptions, setLoadingDescriptions] = useState(false);
  const [loadingPackaging, setLoadingPackaging] = useState(false);
  const [loadingPackagingDescriptions, setLoadingPackagingDescriptions] =
    useState(false);

  // State for selected items
  const [selectedHarmful, setSelectedHarmful] = useState<string | null>(null);
  const [selectedSafe, setSelectedSafe] = useState<string | null>(null);
  const [selectedPackaging, setSelectedPackaging] = useState<string | null>(
    null,
  );
  const [selectedAIAlternative, setSelectedAIAlternative] = useState<{
    name: string;
    brand: string;
    description: string;
    logo_url?: string;
  } | null>(null);

  // State for recommendations
  const [recommendations, setRecommendations] =
    useState<ProductRecommendations | null>(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [scanSaved, setScanSaved] = useState(false);

  // UploadThing hook for image upload
  const { startUpload: uploadScannedImage } = useUploadThing('scannedImage');

  // Progressive loading - Step by step like BarcodeProductResults
  useEffect(() => {
    // Use captured values from mount to prevent re-running
    const { scannedImage, savedScanData } = initialDataRef.current;

    // Priority 1: Check context cache (fastest - instant restore)
    // Priority 2: Check savedScanData from location state (from notification)
    // Priority 3: Perform fresh scan with scannedImage
    // Priority 4: Fetch from MongoDB (last resort)

    // ALWAYS check cache first - even if we have scannedImage
    const cachedScan = getLatestPhotoScan();
    if (cachedScan && cachedScan.scannedImage === scannedImage) {
      console.log('📦 Restoring from context cache');
      setProduct(cachedScan.product);
      setRecommendations(cachedScan.recommendations);
      setLoadingBasicData(false);
      setLoadingIngredients(false);
      setLoadingPackaging(false);
      setLoadingRecommendations(false);
      setScanSaved(true);
      return;
    }

    // No cache match, check if we have savedScanData or need to scan
    if (!scannedImage && !savedScanData) {
      // No image and no saved data - try MongoDB as last resort
      const fetchLatestScan = async () => {
        try {
          setLoadingBasicData(true);
          console.log('📡 Fetching latest scan from MongoDB...');
          const response = await getScanResults(1, 1);

          if (response.data && response.data.length > 0) {
            const latestScan = response.data[0];

            if (latestScan.scanType === 'photo') {
              navigate('/product-identification-results', {
                state: { savedScanData: latestScan },
                replace: true,
              });
              return;
            }
          }

          setProcessingError(
            'No scan data available. Please scan a product first.',
          );
          setLoadingBasicData(false);
        } catch (error) {
          console.error('Error fetching latest scan:', error);
          setProcessingError('Failed to load scan data');
          setLoadingBasicData(false);
        }
      };

      fetchLatestScan();
      return;
    }

    // Prevent duplicate processing
    if (isProcessingRef.current) {
      console.log('Already processing, skipping duplicate call');
      return;
    }

    const loadData = async () => {
      // If we have savedScanData (from notification or MongoDB), use it directly
      if (savedScanData) {
        console.log(
          '📦 Loading from saved scan data (MongoDB):',
          savedScanData,
        );
        isProcessingRef.current = true;

        setLoadingBasicData(true);
        setLoadingIngredients(true);
        setLoadingPackaging(true);
        setLoadingRecommendations(true);

        // Convert MongoDB scan data to component format
        console.log('📦 Converting from MongoDB format');
        // Convert saved data back to the component's expected format
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

        // Populate all state from saved data with proper structure
        setProduct({
          product_name: savedScanData.productName,
          brand: savedScanData.productBrand,
          category: '',
          product_type: '',
          marketing_claims: [],
          certifications_visible: [],
          productImage: savedScanData.productImage,
          ingredients: {
            safe: Object.keys(safeDescriptions),
            harmful: Object.keys(harmfulDescriptions),
          },
          ingredient_descriptions: {
            safe: safeDescriptions,
            harmful: harmfulDescriptions,
          },
          packaging: savedScanData.packaging?.map((p: any) => p.name) || [],
          packaging_analysis: {
            materials: savedScanData.packaging?.map((p: any) => p.name) || [],
            analysis: packagingDetails,
            summary: savedScanData.packagingSummary || '',
            overall_safety: savedScanData.packagingSafety || 'unknown',
          },
          packaging_summary: savedScanData.packagingSummary || '',
          packaging_safety: savedScanData.packagingSafety || 'unknown',
        });

        // Handle recommendations - could be from notification (array) or sessionStorage (object)
        if (savedScanData.recommendations) {
          if (Array.isArray(savedScanData.recommendations)) {
            // From notification - recommendations is an array
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
                  (r: any) => r.source === 'ai',
                ) || [],
              message: 'Loaded from saved scan',
            });
          } else {
            // From sessionStorage - recommendations is already the full object
            setRecommendations(savedScanData.recommendations);
          }
        }

        // Mark all loading as complete
        setLoadingBasicData(false);
        setLoadingIngredients(false);
        setLoadingPackaging(false);
        setLoadingRecommendations(false);

        // Mark as already saved to prevent duplicate save
        setScanSaved(true);

        isProcessingRef.current = false;
        return;
      }

      // Original scanning flow when scannedImage is provided
      // Prevent page unload during processing (mobile browsers)
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = '';
      };

      try {
        isProcessingRef.current = true;
        setLoadingBasicData(true);
        setLoadingIngredients(true);
        setLoadingPackaging(true);
        setLoadingRecommendations(true);

        window.addEventListener('beforeunload', handleBeforeUnload);

        // Step 1: Get basic product info FAST (1-2s)
        console.log('🔍 Fetching basic product info from image...');

        if (!scannedImage) {
          throw new Error('No image provided for identification');
        }

        const basicInfo = await identifyProductBasic(scannedImage);
        console.log('✅ Basic info received:', basicInfo);

        if (!basicInfo || !basicInfo.product_name) {
          setProcessingError('Could not identify product from image');
          setLoadingBasicData(false);
          setLoadingIngredients(false);
          setLoadingPackaging(false);
          setLoadingRecommendations(false);
          return;
        }

        // Set basic product data immediately
        setProduct({
          product_name: basicInfo.product_name,
          brand: basicInfo.brand,
          category: basicInfo.category,
          product_type: basicInfo.product_type,
          marketing_claims: basicInfo.marketing_claims || [],
          certifications_visible: basicInfo.certifications_visible || [],
          container_info: basicInfo.container_info || {},
          ingredient_descriptions: { harmful: {}, safe: {} },
        });
        setLoadingBasicData(false);

        // Step 2 & 3: Load ingredients and packaging INDEPENDENTLY (parallel!)

        // Step 2A: Separate ingredients FAST (2-3s) - Show names immediately
        separatePhotoIngredients(
          basicInfo.product_name,
          basicInfo.brand || '',
          basicInfo.category || '',
        )
          .then((separationResult) => {
            console.log('🧪 Ingredient separation received:', separationResult);

            const harmful = separationResult.harmful || [];
            const safe = separationResult.safe || [];

            // Only call descriptions if we have ingredients
            if (harmful.length > 0 || safe.length > 0) {
              // IMMEDIATELY launch descriptions request (don't wait for state updates)
              setLoadingDescriptions(true);
              describePhotoIngredients(harmful, safe)
                .then((descriptionsResult) => {
                  console.log(
                    '📝 Ingredient descriptions received:',
                    descriptionsResult,
                  );
                  setProduct((prev: any) => {
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
            } else {
              console.log('No ingredients found, skipping descriptions');
              setLoadingDescriptions(false);
            }

            // Show ingredient names immediately with placeholder descriptions
            const harmfulPlaceholders: Record<string, string> = {};
            const safePlaceholders: Record<string, string> = {};

            harmful.forEach((name: string) => {
              harmfulPlaceholders[name] = '';
            });

            safe.forEach((name: string) => {
              safePlaceholders[name] = '';
            });

            setProduct((prev: any) => {
              if (!prev) return prev;
              return {
                ...prev,
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

        // Step 3A: Separate packaging FAST (<1s with vision data) - Show names immediately
        separatePhotoPackaging(
          basicInfo.product_name,
          basicInfo.brand || '',
          basicInfo.category || '',
          basicInfo.container_info?.material || '',
          basicInfo.container_info?.type || '',
        )
          .then((separationResult) => {
            console.log('📦 Packaging separation received:', separationResult);

            if (
              !separationResult.materials ||
              separationResult.materials.length === 0
            ) {
              console.log('No packaging materials found');
              setLoadingPackaging(false);
              return;
            }

            // IMMEDIATELY launch descriptions request
            setLoadingPackagingDescriptions(true);
            describePhotoPackaging(
              separationResult.packaging_text || '',
              separationResult.materials || [],
              basicInfo.brand,
              basicInfo.product_name,
              basicInfo.category,
            )
              .then((descriptionsResult) => {
                console.log(
                  '📝 Packaging descriptions received:',
                  descriptionsResult,
                );
                setProduct((prev: any) => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    packaging_analysis: descriptionsResult,
                  };
                });
                setLoadingPackagingDescriptions(false);
              })
              .catch((err) => {
                console.error('❌ Failed to load packaging descriptions:', err);
                setLoadingPackagingDescriptions(false);
              });

            // Show material names immediately
            setProduct((prev: any) => {
              if (!prev) return prev;
              return {
                ...prev,
                packaging_analysis: {
                  materials: separationResult.materials,
                  analysis: {},
                  overall_safety: 'unknown',
                  summary: 'Analyzing packaging materials...',
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
      } catch (error) {
        console.error('❌ Error loading product:', error);

        // Check if it's a network error
        const networkError = isNetworkError(error);
        setIsNetworkIssue(networkError);

        if (networkError) {
          setProcessingError('No internet connection detected');
        } else {
          setProcessingError(
            error instanceof Error
              ? error.message
              : 'Failed to identify product. Please try again.',
          );
        }

        setLoadingBasicData(false);
        setLoadingIngredients(false);
        setLoadingPackaging(false);
        setLoadingRecommendations(false);
      } finally {
        isProcessingRef.current = false;
        // Remove beforeunload listener
        window.removeEventListener('beforeunload', handleBeforeUnload);
      }
    };

    loadData();
  }, []); // Empty dependency - only run once on mount

  // Fetch recommendations asynchronously using product name and brand
  useEffect(() => {
    const fetchRecommendations = async () => {
      // Don't fetch if still loading basic data or no product
      if (loadingBasicData || !product?.product_name) {
        setLoadingRecommendations(false);
        return;
      }

      // Skip fetching if we already have recommendations (from cache or savedScanData)
      if (recommendations) {
        console.log('Already have recommendations, skipping fetch');
        setLoadingRecommendations(false);
        return;
      }

      console.log('Fetching recommendations for:', product.product_name);
      setLoadingRecommendations(true);
      try {
        const recs = await getProductRecommendations(
          product.product_name,
          product.brand || '',
          product.category,
          product.ingredients || [],
          product.marketing_claims?.join(', '),
          product.certifications_visible?.join(', '),
          product.product_type,
          scannedImage || undefined, // Pass the scanned image for multimodal search
        );
        console.log('Recommendations received:', recs);
        setRecommendations(recs);
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
        setRecommendations(null);
      } finally {
        setLoadingRecommendations(false);
      }
    };

    fetchRecommendations();
  }, [
    loadingBasicData,
    product?.product_name,
    product?.brand,
    product?.category,
    product?.ingredients,
    product?.marketing_claims,
    product?.certifications_visible,
    product?.product_type,
    scannedImage,
    recommendations, // Add this to detect when recommendations are set from cache
  ]);

  // Save scan result after all data is loaded
  useEffect(() => {
    const savePhotoScan = async () => {
      // Don't save if already saved or if still loading or no product
      if (
        scanSaved ||
        loadingBasicData ||
        loadingIngredients ||
        loadingPackaging ||
        loadingRecommendations ||
        !product?.product_name
      ) {
        return;
      }

      try {
        console.log('💾 Saving photo scan result...');

        // Upload scanned image to UploadThing if available
        let uploadedImageUrl: string | undefined;
        if (scannedImage && scannedImage.startsWith('blob:')) {
          try {
            console.log('📤 Uploading scanned image to UploadThing...');
            // Convert blob URL to File
            const response = await fetch(scannedImage);
            const blob = await response.blob();
            const file = new File([blob], 'scanned-product.jpg', {
              type: blob.type || 'image/jpeg',
            });

            const uploadResult = await uploadScannedImage([file]);
            if (uploadResult && uploadResult.length > 0) {
              uploadedImageUrl = uploadResult[0].url;
              console.log('✅ Image uploaded successfully:', uploadedImageUrl);
            }
          } catch (uploadError) {
            console.error('⚠️ Failed to upload image:', uploadError);
            // Continue with save even if upload fails
          }
        }

        // Extract harmful and safe ingredients
        const harmfulDescriptions =
          product?.ingredient_descriptions?.harmful || {};
        const safeDescriptions = product?.ingredient_descriptions?.safe || {};
        const harmfulTags = Object.keys(harmfulDescriptions);
        const safeTags = Object.keys(safeDescriptions);

        // Extract packaging data
        const packagingAnalysis = product?.packaging_analysis;
        const packagingMaterials = packagingAnalysis?.materials || [];
        const packagingDetails = packagingAnalysis?.analysis || {};

        await saveScanResult({
          scanType: 'photo',
          productName: product.product_name,
          productBrand: product.brand,
          productImage: product.productImage,
          scannedImage: uploadedImageUrl || scannedImage || undefined, // Use uploaded URL or fallback to original
          safeIngredients: safeTags.map((tag) => ({
            name: tag,
            description: safeDescriptions[tag] || 'Safe ingredient',
          })),
          harmfulIngredients: harmfulTags.map((tag) => ({
            name: tag,
            description:
              harmfulDescriptions[tag] || 'Potentially harmful ingredient',
          })),
          packaging: packagingMaterials.map((material: string) => ({
            name: material,
            description:
              packagingDetails[material]?.description || 'Packaging material',
          })),
          packagingSummary: packagingAnalysis?.summary,
          packagingSafety: packagingAnalysis?.overall_safety || 'unknown',
          recommendations:
            recommendations?.products.map((p) => ({
              id: p.id,
              name: p.name,
              brand: p.name.split(' ')[0] || 'Unknown', // Extract brand from product name or use Unknown
              description: p.description,
              image_url: p.image_url,
              price: p.price,
              permalink: p.permalink,
              source: 'wordpress' as const,
            })) || [],
          chemicalAnalysis: product.chemicalAnalysis,
        });

        setScanSaved(true);
        console.log('✅ Photo scan saved successfully');

        // Also save to context cache for fast access
        setPhotoScan({
          product,
          recommendations,
          scannedImage: scannedImage || '',
        });
      } catch (error) {
        console.error('❌ Failed to save photo scan:', error);
      }
    };

    savePhotoScan();
  }, [
    scanSaved,
    loadingBasicData,
    loadingIngredients,
    loadingPackaging,
    loadingRecommendations,
    product,
    scannedImage,
    recommendations,
  ]);

  // Show error state
  if (processingError && !product) {
    return (
      <section className="relative px-5 pt-6 pb-4 md:mx-7">
        <PageHeader title="Product Analysis" />
        <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
          {isNetworkIssue ? (
            <>
              <div className="text-6xl mb-4">📡</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                No Internet Connection
              </h2>
              <p className="text-gray-600 mb-6 text-center max-w-md">
                Please connect to Wi-Fi or mobile data and try again.
              </p>
              <button
                onClick={() => {
                  // Reset error state and reload the page to retry with same image
                  setProcessingError(null);
                  setIsNetworkIssue(false);
                  window.location.reload();
                }}
                className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
            </>
          ) : (
            <>
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {processingError ? 'Analysis Failed' : 'No Product Data'}
              </h2>
              <p className="text-gray-600 mb-6 text-center">
                {processingError || 'No product data available'}
              </p>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                Back to Home
              </button>
            </>
          )}
        </div>
      </section>
    );
  }

  // Extract harmful and safe ingredients (only if product exists)
  const harmfulDescriptions = product?.ingredient_descriptions?.harmful || {};
  const safeDescriptions = product?.ingredient_descriptions?.safe || {};

  // Prepare tags and descriptions
  const harmfulTags = Object.keys(harmfulDescriptions);
  const safeTags = Object.keys(safeDescriptions);

  // Create tag descriptions mappings
  const harmfulTagDescriptions: Record<string, string> = harmfulDescriptions;
  const safeTagDescriptions: Record<string, string> = safeDescriptions;

  // Extract packaging analysis (similar to BarcodeProductResults)
  const packagingAnalysis = product?.packaging_analysis;
  const packagingMaterials = packagingAnalysis?.materials || [];
  const packagingDetails = packagingAnalysis?.analysis || {};

  // Format packaging tags for display (replace underscores and capitalize)
  const packagingTags = packagingMaterials.map((material: string) =>
    formatTagName(material),
  );
  const packagingTagDescriptions: Record<string, string> = {};

  // Create descriptions map using formatted names as keys
  packagingMaterials.forEach((material: string) => {
    const formattedName = formatTagName(material);
    const details = packagingDetails[material];
    if (details) {
      packagingTagDescriptions[formattedName] = `${details.description}\n\n${details.health_concerns !== 'None identified'
          ? `Health Concerns: ${details.health_concerns}\n`
          : ''
        }Environmental Impact: ${details.environmental_impact}`;
    }
  });

  // Determine AI Note message based on data quality
  // const getAINote = () => {
  //   const hasIngredients = harmfulTags.length > 0 || safeTags.length > 0;
  //   const hasPackaging = packagingTags.length > 0;

  //   if (!hasIngredients && !hasPackaging) {
  //     return 'Limited product information available. This analysis is based on AI vision and available knowledge. Some details may be incomplete.';
  //   }

  //   const warnings = [];

  //   if (
  //     result.chemical_analysis &&
  //     result.chemical_analysis.safety_score < 40
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

  //   return 'Analysis based on AI vision and ingredient research.';
  // };

  return (
    <section className="relative px-5 pt-6 pb-4 md:mx-7">
      {/* Header */}
      <PageHeader title="Product Analysis" />

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
          {/* Image Skeleton */}
          <div className="bg-primary/10 rounded-2xl w-full h-64 animate-pulse"></div>

          {/* Product Info Skeleton */}
          <div className="bg-white rounded-2xl w-full shadow-sm border border-gray-100 p-3.5 flex gap-3 items-start">
            <div className="flex flex-col flex-1 gap-2 min-w-0 py-1">
              <div className="h-5 bg-primary/10 rounded-lg w-3/4 animate-pulse"></div>
              <div className="h-4 bg-primary/10 rounded-lg w-1/2 animate-pulse"></div>
            </div>
            <div className="w-8 h-8 bg-primary/10 rounded-xl animate-pulse"></div>
          </div>

          {/* Loading Message */}
          <div className="flex items-center justify-center gap-2.5 py-3 bg-primary/5 rounded-xl">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
            <p className="text-sm font-medium text-primary">Analyzing product...</p>
          </div>
        </div>
      ) : product ? (
        <div className="mt-3 py-5 px-4 bg-white rounded-2xl shadow-sm flex flex-col gap-5 overflow-hidden">
          {/* Product Image */}
          {scannedImage && (
            <div className="bg-white rounded-2xl w-full shadow-sm border border-gray-100 overflow-hidden">
              <img
                src={scannedImage}
                alt={product.product_name}
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          <div className="bg-white rounded-2xl w-full shadow-sm border border-gray-100 p-3.5 flex gap-3 items-start">
            {/* Product Info */}
            <div className="flex flex-col flex-1 gap-1.5 min-w-0 py-0.5">
              {/* Product Name */}
              <h3 className="font-family-segoe font-bold text-[15px] sm:text-base text-gray-900 capitalize leading-snug break-words">
                {product.product_name}
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
            <div className="animate-fade-in-up mt-5">
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
            <div className="animate-fade-in-up">
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
        <section className="rounded-2xl px-4 py-5 mt-5 bg-[#FFF] shadow-sm animate-fade-in-up overflow-hidden">
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
        <section className="rounded-2xl px-4 py-5 mt-5 bg-[#FFF] shadow-sm overflow-hidden animate-fade-in-up">
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
        <section className="rounded-2xl px-4 py-5 mt-5 bg-[#FFF] shadow-sm animate-fade-in-up overflow-hidden">
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
        <section className="rounded-2xl px-4 py-5 mt-5 bg-[#FFF] shadow-sm overflow-hidden animate-fade-in-up">
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
                      onClick={() => navigate(`/products/${product.id}`)}
                      className="bg-white rounded-2xl w-full shadow-sm p-3.5 flex flex-col sm:flex-row gap-3 items-start sm:items-center overflow-hidden hover:shadow-md active:scale-[0.99] transition-all cursor-pointer"
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
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(
                            product.affiliate_url || product.permalink,
                            '_blank',
                          );
                        }}
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

export default ProductIdentificationResults;
