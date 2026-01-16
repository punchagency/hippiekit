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
      <div className="mt-3 py-5 px-4 bg-white rounded-2xl shadow-sm flex flex-col gap-5 overflow-hidden">
        {/* Scanned Image */}
        {scannedImage && (
          <div className="bg-white rounded-2xl w-full shadow-sm overflow-hidden border border-gray-100">
            <img
              src={scannedImage}
              alt="Scanned Product"
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        <div className="bg-white rounded-2xl w-full shadow-sm border border-gray-100 p-3.5 flex gap-3 items-start">
          {/* Product Info */}
          <div className="flex flex-col flex-1 gap-1.5 min-w-0 py-0.5">
            {/* Product Name */}
            <h3 className="font-family-segoe font-bold text-[15px] sm:text-base text-gray-900 capitalize leading-snug break-words">
              {analysis.product_info?.name || 'Unknown Product'}
            </h3>
            {/* Brand */}
            {analysis.product_info?.brand && (
              <p className="font-roboto font-normal text-xs sm:text-[13px] text-gray-500 leading-normal truncate">
                {analysis.product_info.brand}
              </p>
            )}
            {/* Category */}
            {analysis.product_info?.category && (
              <p className="font-roboto font-normal text-[11px] sm:text-xs text-gray-400 leading-normal">
                {analysis.product_info.category}
              </p>
            )}
          </div>

          {/* Favorite Button */}
          <button className="w-8 h-8 sm:w-9 sm:h-9 bg-primary/8 rounded-xl flex items-center justify-center hover:bg-primary/15 active:scale-95 transition-all flex-shrink-0">
            <img src={heartIcon} alt="Favorite" className="w-4 h-4" />
          </button>
        </div>

        {/* Safety Score Badge */}
        {analysis.chemical_analysis?.safety_score !== null &&
          analysis.chemical_analysis?.safety_score !== undefined && (
            <div className="flex items-center justify-center">
              <div
                className={`px-5 py-2.5 rounded-xl font-bold text-sm sm:text-base shadow-sm ${analysis.chemical_analysis.safety_score >= 70
                  ? 'bg-[#F0F7EC] text-[#4E6C34] border border-[#4E6C34]/20'
                  : analysis.chemical_analysis.safety_score >= 40
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-[#FFF0F0] text-[#F35959] border border-[#F35959]/20'
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
            selectedTag={selectedHarmful}
            descTitle={selectedHarmful || 'Harmful Chemicals'}
            description={
              selectedHarmful && harmfulTagDescriptions[selectedHarmful]
                ? String(harmfulTagDescriptions[selectedHarmful])
                : 'Tap on a chemical above to see why it may be harmful'
            }
          />
        )}
      </div>

      {/* Clean Ingredients Section */}
      {safeTags.length > 0 && (
        <section className="rounded-2xl px-4 py-5 mt-5 bg-white shadow-sm overflow-hidden">
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
              selectedSafe && safeTagDescriptions[selectedSafe]
                ? String(safeTagDescriptions[selectedSafe])
                : 'Tap on an ingredient above to learn more about it'
            }
          />
        </section>
      )}

      {/* Packaging Material Section */}
      {packagingTags.length > 0 && (
        <section className="rounded-2xl px-4 py-5 mt-5 bg-white shadow-sm overflow-hidden">
          <ProductResultInfoCard
            icon={productContainerIngIcon}
            title="product container & packaging"
            titleType="normal"
            tags={packagingTags}
            tagDescriptions={packagingTagDescriptions}
            onTagClick={(tag) => setSelectedPackaging(tag)}
            selectedTag={selectedPackaging}
            descTitle={selectedPackaging || 'Packaging Overview'}
            description={
              selectedPackaging && packagingTagDescriptions[selectedPackaging]
                ? String(packagingTagDescriptions[selectedPackaging])
                : 'Tap on a material above to see details'
            }
          />
        </section>
      )}

      {/* AI Note */}
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
          This analysis is based on AI vision OCR and may not be 100% accurate.
          Please verify ingredient information before making purchasing
          decisions.
        </p>
      </section>
    </section>
  );
}
