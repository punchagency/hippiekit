import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
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

// Format tag names: replace underscores with spaces and capitalize each word
const formatTagName = (tag: string): string => {
  return tag
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const ProductIdentificationResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { scannedImage } = location.state as {
    scannedImage: string;
  };

  // State for product data (starts with null, builds progressively)
  const [product, setProduct] = useState<any>(null); // Basic product info
  const [loadingBasicData, setLoadingBasicData] = useState(true);
  const [processingError, setProcessingError] = useState<string | null>(null);

  // Progressive loading states
  const [loadingIngredients, setLoadingIngredients] = useState(true);
  const [loadingDescriptions, setLoadingDescriptions] = useState(false);
  const [loadingPackaging, setLoadingPackaging] = useState(true);
  const [loadingPackagingDescriptions, setLoadingPackagingDescriptions] =
    useState(false);

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

  // State for recommendations
  const [recommendations, setRecommendations] =
    useState<ProductRecommendations | null>(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);

  // Progressive loading - Step by step like BarcodeProductResults
  useEffect(() => {
    if (!scannedImage) {
      setProcessingError('No image provided');
      setLoadingBasicData(false);
      setLoadingIngredients(false);
      setLoadingPackaging(false);
      setLoadingRecommendations(false);
      return;
    }

    const loadData = async () => {
      try {
        setLoadingBasicData(true);
        setLoadingIngredients(true);
        setLoadingPackaging(true);
        setLoadingRecommendations(true);

        // Step 1: Get basic product info FAST (1-2s)
        console.log('🔍 Fetching basic product info from image...');
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
          basicInfo.brand,
          basicInfo.category
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
                    descriptionsResult
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

        // Step 3A: Separate packaging FAST (1-2s) - Show names immediately
        separatePhotoPackaging(
          basicInfo.product_name,
          basicInfo.brand,
          basicInfo.category
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
              basicInfo.category
            )
              .then((descriptionsResult) => {
                console.log(
                  '📝 Packaging descriptions received:',
                  descriptionsResult
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
        setProcessingError(
          error instanceof Error
            ? error.message
            : 'Failed to identify product. Please try again.'
        );
        setLoadingBasicData(false);
        setLoadingIngredients(false);
        setLoadingPackaging(false);
        setLoadingRecommendations(false);
      }
    };

    loadData();
  }, [scannedImage]);

  // Fetch recommendations asynchronously using product name and brand
  useEffect(() => {
    const fetchRecommendations = async () => {
      // Don't fetch if still loading basic data or no product
      if (loadingBasicData || !product?.product_name) {
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
          scannedImage // Pass the scanned image for multimodal search
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
  ]);

  // Show error state
  if (processingError && !product) {
    return (
      <section className="relative px-5 pt-6 pb-4 md:mx-7">
        <PageHeader title="Product Analysis" />
        <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
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
    formatTagName(material)
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
          {/* Image Skeleton */}
          <div className="bg-gray-200 rounded-[13px] w-full h-64 animate-pulse"></div>

          {/* Product Info Skeleton */}
          <div className="bg-white rounded-[13px] w-full shadow-[0px_1px_10px_0px_rgba(0,0,0,0.16)] p-2.5 flex gap-2 sm:gap-3 items-start">
            <div className="flex flex-col flex-1 gap-2 min-w-0">
              <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
            </div>
            <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
          </div>

          {/* Loading Message */}
          <div className="flex items-center justify-center gap-2 py-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
            <p className="text-sm text-gray-600">Analyzing product...</p>
          </div>
        </div>
      ) : product ? (
        <div className="mt-2.5 py-4 sm:py-5 px-3 sm:px-3.5 bg-white rounded-[13px] shadow-[0px_1px_10px_0px_rgba(0,0,0,0.16)] flex flex-col gap-4 sm:gap-6 overflow-hidden">
          {/* Product Image */}
          {scannedImage && (
            <div className="bg-white rounded-[13px] w-full shadow-[0px_1px_10px_0px_rgba(0,0,0,0.16)] overflow-hidden">
              <img
                src={scannedImage}
                alt={product.product_name}
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          <div className="bg-white rounded-[13px] w-full shadow-[0px_1px_10px_0px_rgba(0,0,0,0.16)] p-2.5 flex gap-2 sm:gap-3 items-start">
            {/* Product Info */}
            <div className="flex flex-col flex-1 gap-1 sm:gap-2 min-w-0">
              {/* Product Name */}
              <h3 className="font-roboto font-semibold text-sm sm:text-[16px] text-black capitalize leading-snug break-words">
                {product.product_name}
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
            <div className="animate-fade-in-up mt-5">
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
            <div className="animate-fade-in-up">
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
        <section className="rounded-[7px] px-3 sm:px-4 py-4 sm:py-5 mt-5 bg-[#FFF] shadow-[0_2px_4px_0_rgba(0,0,0,0.07)] animate-fade-in-up overflow-hidden">
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
        <section className="rounded-[7px] px-3 sm:px-4 py-4 sm:py-5 mt-5 bg-[#FFF] shadow-[0_2px_4px_0_rgba(0,0,0,0.07)] flex gap-2 items-center justify-center overflow-hidden animate-fade-in-up">
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
        <section className="rounded-[7px] px-3 sm:px-4 py-4 sm:py-5 mt-5 bg-[#FFF] shadow-[0_2px_4px_0_rgba(0,0,0,0.07)] animate-fade-in-up overflow-hidden">
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
        <section className="rounded-[7px] px-3 sm:px-4 py-4 sm:py-5 mt-5 bg-[#FFF] shadow-[0_2px_4px_0_rgba(0,0,0,0.07)] flex gap-2 items-center justify-center overflow-hidden animate-fade-in-up">
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
          // Loading skeleton matching BarcodeProductResults
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
                      className="bg-white rounded-[13px] w-full shadow-[0px_1px_10px_0px_rgba(0,0,0,0.16)] p-2.5 flex flex-col sm:flex-row gap-2 sm:gap-3 items-start sm:items-center overflow-hidden"
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
                        onClick={() => window.open(product.permalink, '_blank')}
                        className="bg-[#00A23E] text-white px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm hover:bg-[#008f35] transition-colors flex-shrink-0 whitespace-nowrap"
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

      {/* AI Note - Only show if we have AI-generated recommendations */}
      {recommendations && recommendations.ai_alternatives.length > 0 && (
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

export default ProductIdentificationResults;
