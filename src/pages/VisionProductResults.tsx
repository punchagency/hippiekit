import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import productResultsIcon from '@/assets/productResultsIcon.svg';
import heartIcon from '@/assets/heartIcon.svg';
import chemicalsIcon from '@/assets/chemicalsIcon.svg';
import cleanIngredientsIcon from '@/assets/cleanIngredientsIcon.svg';
import productContainerIngIcon from '@/assets/productContainerIngIcon.svg';
import aiIcon from '@/assets/aiIcon.svg';
import type { VisionAnalysis } from '@/services/scanService';
import { ProductResultInfoCard } from '@/components/ProductResultInfoCard';
import { PageHeader } from '@/components/PageHeader';

export default function VisionProductResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const { analysis, scannedImage } = (location.state || {}) as {
    analysis: VisionAnalysis;
    scannedImage?: string;
  };

  // State for selected items
  const [selectedHarmful, setSelectedHarmful] = useState<string | null>(null);
  const [selectedQuestionable, setSelectedQuestionable] = useState<string | null>(null);
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
  const [recommendations, setRecommendations] = useState<ProductRecommendations | null>(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  if (!analysis) {
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

  // Extract harmful, questionable, and safe ingredients from chemical_analysis
  const chemicalFlags = analysis.chemical_analysis?.flags || [];
  
  // Separate harmful (critical, high, moderate) from questionable
  const harmfulFlags = chemicalFlags.filter((flag) => 
    ['CRITICAL', 'HIGH', 'MODERATE', 'critical', 'high', 'moderate'].includes(flag.severity)
  );
  const questionableFlags = chemicalFlags.filter((flag) => 
    ['QUESTIONABLE', 'questionable'].includes(flag.severity)
  );
  
  const harmfulTags = harmfulFlags.map((flag) => flag.chemical);
  const questionableTags = questionableFlags.map((flag) => flag.chemical);
  
  const harmfulTagDescriptions: Record<string, string> = {};
  harmfulFlags.forEach((flag) => {
    harmfulTagDescriptions[flag.chemical] = flag.why_flagged;
  });
  
  const questionableTagDescriptions: Record<string, string> = {};
  questionableFlags.forEach((flag) => {
    questionableTagDescriptions[flag.chemical] = flag.why_flagged || 
      "These are common synthetic additives found in processed products. They're approved for use but not ideal for daily consumption if you're aiming for natural, plant-based products.";
  });

  // Determine if this is a "clean" scan (no harmful ingredients AND no plastic packaging)
  // A "clean" scan means: no harmful chemicals AND packaging is not plastic/harmful
  const hasPlasticPackaging = packagingMaterial.toLowerCase().includes('plastic') || 
    packagingType.toLowerCase().includes('plastic');
  const isCleanScan = harmfulTags.length === 0 && !hasPlasticPackaging;

  // For safe ingredients, we'll parse from the ingredients string
  const ingredientsText = analysis.ingredients || '';
  const allIngredients = ingredientsText
    .split(',')
    .map((ing) => ing.trim())
    .filter((ing) => ing);
  
  // Filter out both harmful AND questionable from safe ingredients
  const safeTags = allIngredients.filter(
    (ing) => 
      !harmfulTags.some((h) => h.toLowerCase() === ing.toLowerCase()) &&
      !questionableTags.some((q) => q.toLowerCase() === ing.toLowerCase())
  );
  const safeTagDescriptions: Record<string, string> = {};
  safeTags.forEach((ing) => {
    safeTagDescriptions[ing] =
      'Common ingredient used in food and personal care products.';
  });

  // Extract packaging information
  const packagingMaterial = analysis.packaging?.material || '';
  const packagingType = analysis.packaging?.type || '';
  const packagingRecyclable = analysis.packaging?.recyclable || '';

  const packagingTags = packagingMaterial
    ? [packagingMaterial]
    : packagingType
    ? [packagingType]
    : [];

  const packagingTagDescriptions: Record<string, string> = {};
  if (packagingMaterial) {
    packagingTagDescriptions[
      packagingMaterial
    ] = `Type: ${packagingType}\nRecyclable: ${packagingRecyclable}`;
  }

  // Fetch recommendations based on product info
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!analysis?.product_info?.name) return;

      setLoadingRecommendations(true);
      try {
        const recs = await getProductRecommendations(
          analysis.product_info.name,
          analysis.product_info.brand || '',
          analysis.product_info.category || '',
          allIngredients,
          undefined, // marketing_claims
          undefined, // certifications
          undefined, // product_type
          scannedImage // Pass the scanned image for multimodal search
        );
        setRecommendations(recs);
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
        setRecommendations(null);
      } finally {
        setLoadingRecommendations(false);
      }
    };

    fetchRecommendations();
  }, [analysis?.product_info?.name, analysis?.product_info?.brand, analysis?.product_info?.category]);

  return (
    <section className="relative px-5 pt-6 pb-4 md:mx-7">
      {/* Header */}
      <PageHeader title="AI OCR Results" />

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
      <div className="mt-2.5 py-4 sm:py-5 px-3 sm:px-3.5 bg-white rounded-[13px] shadow-[0px_1px_10px_0px_rgba(0,0,0,0.16)] flex flex-col gap-4 sm:gap-6 overflow-hidden">
        {/* Scanned Image */}
        {scannedImage && (
          <div className="bg-white rounded-[13px] w-full shadow-[0px_1px_10px_0px_rgba(0,0,0,0.16)] overflow-hidden">
            <img
              src={scannedImage}
              alt="Scanned Product"
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        <div className="bg-white rounded-[13px] w-full shadow-[0px_1px_10px_0px_rgba(0,0,0,0.16)] p-2.5 flex gap-2 sm:gap-3 items-start">
          {/* Product Info */}
          <div className="flex flex-col flex-1 gap-1 sm:gap-2 min-w-0">
            {/* Product Name */}
            <h3 className="font-roboto font-semibold text-sm sm:text-[16px] text-black capitalize leading-snug break-words">
              {analysis.product_info?.name || 'Unknown Product'}
            </h3>
            {/* Brand */}
            {analysis.product_info?.brand && (
              <p className="font-roboto font-normal text-xs sm:text-[14px] text-[#4e4e4e] leading-normal truncate">
                {analysis.product_info.brand}
              </p>
            )}
            {/* Category */}
            {analysis.product_info?.category && (
              <p className="font-roboto font-normal text-xs sm:text-[13px] text-[#888] leading-normal">
                {analysis.product_info.category}
              </p>
            )}
          </div>

          {/* Favorite Button */}
          <button className="w-5 h-5 sm:w-[22px] sm:h-[22px] bg-[rgba(255,255,255,0.3)] p-1 sm:p-[5px] rounded-sm shadow-[0px_2px_16px_0px_rgba(6,51,54,0.1)] flex-shrink-0">
            <img src={heartIcon} alt="Favorite" className="w-full h-full" />
          </button>
        </div>

        {/* Safety Score Badge */}
        {analysis.chemical_analysis?.safety_score !== null &&
          analysis.chemical_analysis?.safety_score !== undefined && (
            <div className="flex items-center justify-center gap-3">
              <div
                className={`px-4 py-2 rounded-lg font-bold text-base sm:text-lg ${
                  analysis.chemical_analysis.safety_score >= 70
                    ? 'bg-green-100 text-green-800'
                    : analysis.chemical_analysis.safety_score >= 40
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                Safety Score: {analysis.chemical_analysis.safety_score}/100
              </div>
            </div>
          )}

        {/* Harmful Chemicals Section */}
        {harmfulTags.length > 0 && (
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
              selectedHarmful && harmfulTagDescriptions[selectedHarmful]
                ? String(harmfulTagDescriptions[selectedHarmful])
                : 'Click on a chemical above to see why it may be harmful'
            }
          />
        )}
      </div>

      {/* Questionable Ingredients Section */}
      {questionableTags.length > 0 && (
        <section className="rounded-[7px] px-3 sm:px-4 py-4 sm:py-5 mt-5 bg-[#FFF] shadow-[0_2px_4px_0_rgba(0,0,0,0.07)] flex gap-2 items-center justify-center overflow-hidden">
          <ProductResultInfoCard
            icon={chemicalsIcon}
            title="Questionable Ingredients"
            titleType="warning"
            tags={questionableTags}
            tagColor="yellow"
            tagDescriptions={questionableTagDescriptions}
            onTagClick={(tag) => setSelectedQuestionable(tag)}
            descTitle={selectedQuestionable || 'Questionable Ingredients'}
            description={
              selectedQuestionable && questionableTagDescriptions[selectedQuestionable]
                ? String(questionableTagDescriptions[selectedQuestionable])
                : "These are common synthetic additives found in processed waters and foods. They're approved for use but not ideal for daily consumption if you're aiming for natural, plant-based products."
            }
          />
        </section>
      )}

      {/* Clean Ingredients Section */}
      {safeTags.length > 0 && (
        <section className="rounded-[7px] px-3 sm:px-4 py-4 sm:py-5 mt-5 bg-[#FFF] shadow-[0_2px_4px_0_rgba(0,0,0,0.07)] flex gap-2 items-center justify-center overflow-hidden">
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
              selectedSafe && safeTagDescriptions[selectedSafe]
                ? String(safeTagDescriptions[selectedSafe])
                : 'Click on an ingredient above to learn more about it'
            }
          />
        </section>
      )}

      {/* Packaging Material Section */}
      {packagingTags.length > 0 && (
        <section className="rounded-[7px] px-3 sm:px-4 py-4 sm:py-5 mt-5 bg-[#FFF] shadow-[0_2px_4px_0_rgba(0,0,0,0.07)] flex gap-2 items-center justify-center overflow-hidden">
          <ProductResultInfoCard
            icon={productContainerIngIcon}
            title="product container & packaging"
            titleType="normal"
            tags={packagingTags}
            tagDescriptions={packagingTagDescriptions}
            onTagClick={(tag) => setSelectedPackaging(tag)}
            descTitle={selectedPackaging || 'Packaging Overview'}
            description={
              selectedPackaging && packagingTagDescriptions[selectedPackaging]
                ? String(packagingTagDescriptions[selectedPackaging])
                : 'Click on a material above to see details'
            }
          />
        </section>
      )}

      {/* Hippiekit Product Recommendations */}
      <section className="mt-5">
        {loadingRecommendations ? (
          // Loading skeleton
          <div className="animate-pulse">
            <div className="text-center py-4 mb-3.5">
              <div className="inline-flex items-center gap-2 text-primary">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="font-family-roboto text-base sm:text-[18px] font-medium">
                  Finding Similar Alternatives
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
                  {isCleanScan ? 'Similar Products' : 'Hippiekit Vetted Swaps'}
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
                            '_blank',
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

      {/* AI Note */}
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
          This analysis is based on AI vision OCR and may not be 100% accurate.
          Please verify ingredient information before making purchasing
          decisions.
        </p>
      </section>
    </section>
  );
}
