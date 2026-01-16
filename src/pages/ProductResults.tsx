import { useLocation, useNavigate } from 'react-router-dom';
import backButton from '@/assets/backButton.svg';
import productResultsIcon from '@/assets/productResultsIcon.svg';
import productGridImage from '@/assets/productGridImage.png';
import heartIcon from '@/assets/heartIcon.svg';
// import chemicalsIcon from '@/assets/chemicalsIcon.svg';
// import cleanIngredientsIcon from '@/assets/cleanIngredientsIcon.svg';
// import productContainerIngIcon from '@/assets/productContainerIngIcon.svg';
import aiIcon from '@/assets/aiIcon.svg';
import { StarIcon } from '@/assets/icons';

// import { ProductResultInfoCard } from '@/components/ProductResultInfoCard';
import { Button } from '@/components/ui/button';

interface ScanResult {
  id: string;
  name: string;
  price: string;
  image_url: string;
  permalink: string;
  description: string;
  similarity_score: number;
}

const ProductResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { scanResults } =
    (location.state as {
      scanResults?: ScanResult[];
      scannedImage?: string;
    }) || {};

  // If no scan results, redirect back
  if (!scanResults || scanResults.length === 0) {
    return (
      <section className="relative pt-6 mx-7">
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-gray-500 mb-4">No scan results found</p>
          <Button
            onClick={() => navigate('/')}
            className="bg-primary text-white"
          >
            Go Back Home
          </Button>
        </div>
      </section>
    );
  }

  const topMatch = scanResults[0];
  const alternatives = scanResults.slice(1);
  return (
    <section className="relative px-5 pt-6 pb-4 md:mx-7">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => navigate('/')}
          className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all"
        >
          <img src={backButton} alt="Back" className="w-5 h-5" />
        </button>

        <span className="font-family-segoe text-primary text-base sm:text-[17px] font-bold">
          Hippiekit Endorsed Products
        </span>

        <div className="w-10"></div>
      </div>

      {/* Product Results Section Header */}
      <section className="rounded-2xl px-4 py-4 bg-white shadow-sm flex gap-2.5 items-center justify-center">
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
          <img src={productResultsIcon} alt="" className="w-4 h-4" />
        </div>
        <span className="font-family-segoe text-primary text-base sm:text-[17px] font-bold">
          Product Results
        </span>
      </section>

      {/* Top Match Product */}
      <div className="mt-3 py-5 px-4 bg-white rounded-2xl shadow-sm flex flex-col gap-5">
        <div className="bg-white rounded-2xl w-full shadow-sm border border-gray-100 p-3.5 flex gap-3">
          {/* Product Image */}
          <div className="relative w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-xl overflow-hidden flex-shrink-0">
            <img
              src={topMatch.image_url || productGridImage}
              alt={topMatch.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Product Info */}
          <div className="flex flex-col flex-1 gap-2.5 min-w-0">
            {/* Product Name & Description */}
            <div className="flex flex-col gap-1">
              <h3 className="font-family-segoe font-bold text-[15px] sm:text-base text-gray-900 capitalize leading-snug break-words">
                {topMatch.name}
              </h3>
              <p className="font-roboto font-normal text-xs sm:text-[13px] text-gray-500 leading-relaxed line-clamp-2">
                {topMatch.description?.substring(0, 50) ||
                  'No description available'}
              </p>
            </div>

            {/* Similarity Score */}
            <div className="inline-flex">
              <div className="bg-[#00A23E] rounded-lg px-2.5 py-1 flex items-center justify-center gap-1.5 shadow-sm">
                <span className="font-roboto font-semibold text-[11px] sm:text-xs text-white">
                  {Math.round(topMatch.similarity_score * 100)}% Match
                </span>
                <StarIcon />
              </div>
            </div>
          </div>
          {/* Favorite Button */}
          <button className="w-8 h-8 sm:w-9 sm:h-9 bg-primary/8 rounded-xl flex items-center justify-center hover:bg-primary/15 active:scale-95 transition-all flex-shrink-0">
            <img src={heartIcon} alt="Add to favorites" className="w-4 h-4" />
          </button>
        </div>

        {/* Price & Buy Button */}
        <div className="flex items-center justify-between gap-4">
          <span className="font-family-segoe font-bold text-base sm:text-lg text-primary">
            {topMatch.price || 'Price not available'}
          </span>
          <Button
            onClick={() => window.open(topMatch.permalink, '_blank')}
            className="bg-[#00A23E] text-white px-5 py-2.5 text-sm font-semibold rounded-xl hover:bg-[#008f35] active:scale-95 transition-all shadow-sm"
          >
            View Product
          </Button>
        </div>
      </div>

      {/* COMMENTED OUT - Future ingredient analysis sections */}
      {/* 
      <ProductResultInfoCard
        icon={chemicalsIcon}
        title={'chemicals and additives'}
        titleType="negative"
        tags={['Fragrance', 'Fragrance', 'Fragrance', 'Fragrance']}
        descTitle={'Toxic Warning'}
        description={
          'This product may contain hidden plastic elements — like a plastic dripper or interior tube — even if not visible. We still support this brand for their progress but want you to know what touches your product.'
        }
      />

      <section className="rounded-[7px] px-4 py-5 mt-5 bg-[#FFF] shadow-[0_2px_4px_0_rgba(0,0,0,0.07)] flex gap-2 items-center justify-center">
        <ProductResultInfoCard
          icon={cleanIngredientsIcon}
          title="The clean, plant-based ingredients"
          titleType="positive"
          tags={['Fragrance', 'Sodium Lauryl Sulfate', 'Phthalates']}
          descTitle="fragrance"
          description="description text here..."
        />
      </section>

      <section className="rounded-[7px] px-4 py-5 mt-5 bg-[#FFF] shadow-[0_2px_4px_0_rgba(0,0,0,0.07)] flex gap-2 items-center justify-center">
        <ProductResultInfoCard
          icon={productContainerIngIcon}
          title="product container ingredients"
          titleType="normal"
          tags={['Fragrance', 'Sodium Lauryl Sulfate', 'Phthalates']}
          descTitle="fragrance"
          description="description text here..."
        />
      </section>
      */}

      {/* Alternative Products */}
      {alternatives.length > 0 && (
        <section className="mt-6">
          <header className="font-family-segoe text-[15px] sm:text-base font-bold text-gray-800 mb-3.5 flex items-center gap-2">
            <div className="w-1.5 h-5 bg-primary rounded-full"></div>
            Similar Products ({alternatives.length})
          </header>
          <div className="flex flex-col gap-3">
            {alternatives.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl w-full shadow-sm p-3.5 flex gap-3 items-center hover:shadow-md active:scale-[0.99] transition-all"
              >
                {/* Product Image */}
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden flex-shrink-0">
                  <img
                    src={product.image_url || productGridImage}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Product Info */}
                <div className="flex flex-col flex-1 gap-1.5 min-w-0">
                  {/* Product Name & Description */}
                  <h3 className="font-family-segoe font-bold text-[14px] sm:text-[15px] text-gray-900 capitalize leading-snug break-words">
                    {product.name}
                  </h3>
                  <p className="font-roboto font-normal text-xs sm:text-[12px] text-gray-500 leading-relaxed line-clamp-2">
                    {product.description?.substring(0, 50) ||
                      'No description'}
                  </p>

                  {/* Match Score */}
                  <div className="inline-flex">
                    <div className="bg-gray-100 rounded-lg px-2 py-0.5 flex items-center justify-center">
                      <span className="font-roboto font-medium text-[10px] sm:text-[11px] text-gray-600">
                        {Math.round(product.similarity_score * 100)}% Match
                      </span>
                    </div>
                  </div>
                </div>
                {/* View Button */}
                <Button
                  onClick={() => window.open(product.permalink, '_blank')}
                  className="bg-[#00A23E] text-white text-xs sm:text-sm font-semibold px-3 py-2 rounded-xl hover:bg-[#008f35] active:scale-95 transition-all shadow-sm flex-shrink-0"
                >
                  View
                </Button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* AI Note */}
      <section className="mt-8 mb-24 p-4 sm:p-5 text-white font-family-roboto leading-relaxed rounded-2xl bg-gradient-to-br from-[#20799F] to-[#1a6585] shadow-lg">
        <header className="flex gap-2.5 font-semibold text-[15px] sm:text-base items-center">
          <div className="w-8 h-8 bg-white/15 rounded-xl flex items-center justify-center">
            <img src={aiIcon} alt="AI" className="w-4 h-4" />
          </div>
          <span>AI Scan Results</span>
        </header>

        <p className="mt-3.5 text-[13px] sm:text-sm text-white/90">
          These products were matched using AI image recognition with a
          similarity score of {Math.round(topMatch.similarity_score * 100)}%.
          Results are based on visual similarity and may not reflect exact
          product specifications.
        </p>
      </section>
    </section>
  );
};

export default ProductResults;
