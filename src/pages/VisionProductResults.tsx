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
  const [selectedSafe, setSelectedSafe] = useState<string | null>(null);
  const [selectedPackaging, setSelectedPackaging] = useState<string | null>(
    null
  );

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

  // Extract harmful and safe ingredients from chemical_analysis
  const chemicalFlags = analysis.chemical_analysis?.flags || [];
  const harmfulTags = chemicalFlags.map((flag) => flag.chemical);
  const harmfulTagDescriptions: Record<string, string> = {};
  chemicalFlags.forEach((flag) => {
    harmfulTagDescriptions[flag.chemical] = flag.why_flagged;
  });

  // For safe ingredients, we'll parse from the ingredients string
  const ingredientsText = analysis.ingredients || '';
  const allIngredients = ingredientsText
    .split(',')
    .map((ing) => ing.trim())
    .filter((ing) => ing);
  const safeTags = allIngredients.filter(
    (ing) => !harmfulTags.some((h) => h.toLowerCase() === ing.toLowerCase())
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
