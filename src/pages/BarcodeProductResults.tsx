import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import backButton from '@/assets/backButton.svg';
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
import { ProductResultInfoCard } from '@/components/ProductResultInfoCard';
import { Button } from '@/components/ui/button';

const BarcodeProductResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { product, barcode } = location.state as {
    product: BarcodeProduct;
    barcode: string;
  };

  // State for selected items
  const [selectedHarmful, setSelectedHarmful] = useState<string | null>(null);
  const [selectedSafe, setSelectedSafe] = useState<string | null>(null);
  const [selectedPackaging, setSelectedPackaging] = useState<string | null>(
    null
  );

  // State for recommendations
  const [recommendations, setRecommendations] =
    useState<ProductRecommendations | null>(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);

  // Fetch recommendations asynchronously
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!barcode) return;

      setLoadingRecommendations(true);
      try {
        const recs = await getBarcodeRecommendations(barcode);
        setRecommendations(recs);
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
        setRecommendations(null);
      } finally {
        setLoadingRecommendations(false);
      }
    };

    fetchRecommendations();
  }, [barcode]);

  if (!product) {
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
  console.log('Ingredient descriptions:', product.ingredient_descriptions);
  console.log('Packaging analysis:', product.packaging_analysis);
  console.log('Chemical analysis:', product.chemical_analysis);
  console.log('Raw ingredients:', product.ingredients);
  console.log('Raw packaging:', product.packaging);

  // Extract harmful and safe ingredients
  const harmfulDescriptions = product.ingredient_descriptions?.harmful || {};
  const safeDescriptions = product.ingredient_descriptions?.safe || {};

  // Extract packaging analysis
  const packagingAnalysis = product.packaging_analysis;
  const packagingMaterials = packagingAnalysis?.materials || [];
  const packagingDetails = packagingAnalysis?.analysis || {};

  // Prepare tags and descriptions
  const harmfulTags = Object.keys(harmfulDescriptions);
  const safeTags = Object.keys(safeDescriptions);
  const packagingTags = packagingMaterials;

  // Create tag descriptions mappings
  const harmfulTagDescriptions: Record<string, string> = harmfulDescriptions;
  const safeTagDescriptions: Record<string, string> = safeDescriptions;
  const packagingTagDescriptions: Record<string, string> = {};

  // Debug logging for packaging
  console.log('=== PACKAGING DEBUG ===');
  console.log('packagingMaterials:', packagingMaterials);
  console.log('packagingDetails keys:', Object.keys(packagingDetails));
  console.log('packagingDetails:', packagingDetails);

  packagingMaterials.forEach((material) => {
    const details = packagingDetails[material];
    console.log(`Looking for material: "${material}"`);
    console.log(`Found details:`, details);

    if (details) {
      packagingTagDescriptions[material] = `${details.description}\n\n${
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
    <section className="relative pt-6 px-3 sm:px-5 md:mx-7 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 gap-2">
        <button
          onClick={() => navigate('/scan')}
          className="rounded-[7px] p-2.5 bg-[#FFF] shadow-[0_2px_4px_0_rgba(0,0,0,0.07)] flex-shrink-0"
        >
          <img src={backButton} alt="Back" className="w-5 h-5" />
        </button>

        <div className="mt-10 flex p-2.5 items-center gap-[7px]">
          <span className="font-family-segoe text-primary text-sm sm:text-[18px] font-bold whitespace-nowrap">
            Barcode Product
          </span>
        </div>

        <div className="flex-shrink-0 w-9"></div>
      </div>

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
        <div className="bg-white rounded-[13px] w-full shadow-[0px_1px_10px_0px_rgba(0,0,0,0.16)] p-2.5 flex gap-2 sm:gap-3 items-start">
          {/* Product Image */}
          <div className="relative w-14 h-14 sm:w-[60px] sm:h-[60px] rounded-lg overflow-hidden flex-shrink-0">
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
              selectedPackaging && packagingTagDescriptions[selectedPackaging]
                ? String(packagingTagDescriptions[selectedPackaging])
                : packagingAnalysis?.summary
                ? String(packagingAnalysis.summary)
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
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-3.5"></div>
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
            <header className="font-family-roboto text-base sm:text-[18px] font-medium mb-3.5"></header>

            {/* WordPress Products */}
            {recommendations.products.length > 0 && (
              <div className="flex flex-col gap-2.5 mb-3.5">
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
            )}

            {/* AI-Generated Alternatives Note */}
            {recommendations.ai_alternatives.length > 0 && (
              <div className="mb-3.5">
                <div className="bg-[#FFF4E5] border-l-4 border-[#FFA500] p-3 rounded">
                  <p className="font-roboto text-[14px] text-[#666]">
                    ⓘ The following products are not available in the Hippiekit
                    database. These are AI-recommended healthier alternatives
                    based on the scanned product.
                  </p>
                </div>
              </div>
            )}

            {/* AI-Generated Alternatives */}
            {recommendations.ai_alternatives.length > 0 && (
              <div className="flex flex-col gap-2.5">
                {recommendations.ai_alternatives.map((alt, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-[13px] w-full shadow-[0px_1px_10px_0px_rgba(0,0,0,0.16)] p-2.5 flex flex-col sm:flex-row gap-2 sm:gap-3 items-start sm:items-center overflow-hidden"
                  >
                    <div className="w-14 h-14 sm:w-[60px] sm:h-[60px] bg-gradient-to-br from-[#00A23E] to-[#20799F] rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-lg sm:text-xl">
                        🌱
                      </span>
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
            )}
          </div>
        ) : null}
      </section>

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
          These products have not been researched by Hippiekit yet, please
          research before purchasing.
        </p>
      </section>
    </section>
  );
};

export default BarcodeProductResults;
