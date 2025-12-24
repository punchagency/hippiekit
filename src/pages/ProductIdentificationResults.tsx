import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import backButton from '@/assets/backButton.svg';
import productResultsIcon from '@/assets/productResultsIcon.svg';
import heartIcon from '@/assets/heartIcon.svg';
import chemicalsIcon from '@/assets/chemicalsIcon.svg';
import cleanIngredientsIcon from '@/assets/cleanIngredientsIcon.svg';
import productContainerIngIcon from '@/assets/productContainerIngIcon.svg';
import aiIcon from '@/assets/aiIcon.svg';
import type { ProductIdentificationResponse } from '@/services/scanService';
import { ProductResultInfoCard } from '@/components/ProductResultInfoCard';

const ProductIdentificationResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { result, scannedImage } = location.state as {
    result: ProductIdentificationResponse;
    scannedImage: string;
  };

  // State for selected items
  const [selectedHarmful, setSelectedHarmful] = useState<string | null>(null);
  const [selectedSafe, setSelectedSafe] = useState<string | null>(null);
  const [selectedPackaging, setSelectedPackaging] = useState<string | null>(
    null
  );

  if (!result) {
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

  // Extract harmful and safe ingredients
  const harmfulDescriptions = result.ingredient_descriptions?.harmful || {};
  const safeDescriptions = result.ingredient_descriptions?.safe || {};

  // Prepare tags and descriptions
  const harmfulTags = Object.keys(harmfulDescriptions);
  const safeTags = Object.keys(safeDescriptions);

  // Create tag descriptions mappings
  const harmfulTagDescriptions: Record<string, string> = harmfulDescriptions;
  const safeTagDescriptions: Record<string, string> = safeDescriptions;

  // Extract packaging analysis (similar to BarcodeProductResults)
  const packagingAnalysis = result.packaging_analysis;
  const packagingMaterials = packagingAnalysis?.materials || [];
  const packagingDetails = packagingAnalysis?.analysis || {};

  const packagingTags = packagingMaterials;
  const packagingTagDescriptions: Record<string, string> = {};

  packagingMaterials.forEach((material) => {
    const details = packagingDetails[material];
    if (details) {
      packagingTagDescriptions[material] = `${details.description}\n\n${
        details.health_concerns !== 'None identified'
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
    <section className="relative pt-6 mx-7 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate('/scan')}
          className="rounded-[7px] p-2.5 bg-[#FFF] shadow-[0_2px_4px_0_rgba(0,0,0,0.07)]"
        >
          <img src={backButton} alt="Back" />
        </button>

        <div className="mt-10 flex p-2.5 items-center gap-[7px]">
          <span className="font-family-segoe text-primary text-[18px] font-bold">
            Product Analysis
          </span>
        </div>

        <div></div>
      </div>

      {/* Product Results Section Header */}
      <section className="rounded-[7px] px-4 py-5 bg-[#FFF] shadow-[0_2px_4px_0_rgba(0,0,0,0.07)] flex gap-2 items-center justify-center">
        <img src={productResultsIcon} alt="" />
        <span className="font-family-segoe text-primary text-[18px] font-bold">
          Product Results
        </span>
      </section>

      {/* Main Product Card */}
      <div className="mt-2.5 py-5 px-3.5 bg-white rounded-[13px] shadow-[0px_1px_10px_0px_rgba(0,0,0,0.16)] flex flex-col gap-6">
        {/* Product Image */}
        {scannedImage && (
          <div className="bg-white rounded-[13px] w-full shadow-[0px_1px_10px_0px_rgba(0,0,0,0.16)] overflow-hidden">
            <img
              src={scannedImage}
              alt={result.product_name}
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        <div className="bg-white rounded-[13px] w-full shadow-[0px_1px_10px_0px_rgba(0,0,0,0.16)] p-2.5 flex gap-3">
          {/* Product Info */}
          <div className="flex flex-col flex-1 gap-2">
            {/* Product Name */}
            <h3 className="font-roboto font-semibold text-[16px] text-black capitalize leading-normal">
              {result.product_name}
            </h3>
            {/* Brand */}
            {result.brand && (
              <p className="font-roboto font-normal text-[14px] text-[#4e4e4e] leading-normal">
                {result.brand}
              </p>
            )}
          </div>

          {/* Favorite Button */}
          <button className="w-[22px] h-[22px] bg-[rgba(255,255,255,0.3)] p-[5px] rounded-sm shadow-[0px_2px_16px_0px_rgba(6,51,54,0.1)]">
            <img src={heartIcon} alt="Favorite" />
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
        <section className="rounded-[7px] px-4 py-5 mt-5 bg-[#FFF] shadow-[0_2px_4px_0_rgba(0,0,0,0.07)] flex gap-2 items-center justify-center">
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
        <section className="rounded-[7px] px-4 py-5 mt-5 bg-[#FFF] shadow-[0_2px_4px_0_rgba(0,0,0,0.07)] flex gap-2 items-center justify-center">
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

      {/* AI Note */}
      <section className="mt-8 mb-20 p-4 text-white font-family-roboto leading-6 rounded-[10px] bg-[#20799F]">
        <header className="flex gap-2.5 font-medium text-[18px]">
          <img src={aiIcon} alt="" />
          <span>AI Note</span>
        </header>

        <p className="mt-3.5">
          These products have not been researched by Hippiekit yet, please
          research before purchasing.
        </p>

        {/* Additional notes if available */}
        {result.ingredients_note && (
          <p className="mt-2 text-sm opacity-90">
            Note: {result.ingredients_note}
          </p>
        )}
      </section>
    </section>
  );
};

export default ProductIdentificationResults;
