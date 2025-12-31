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
    <section className="relative pt-6 mx-7">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate('/')}
          className="rounded-[7px] p-2.5 bg-[#FFF] shadow-[0_2px_4px_0_rgba(0,0,0,0.07)]"
        >
          <img src={backButton} alt="Back" className="w-5 h-5" />
        </button>

        <div className="mt-10 flex p-2.5 items-center gap-[7px] ">
          <span className="font-family-segoe text-primary text-[18px] font-bold">
            Hippiekit Endorsed Products
          </span>
        </div>

        <div></div>
      </div>

      <section className="rounded-[7px] px-4 py-5 bg-[#FFF] shadow-[0_2px_4px_0_rgba(0,0,0,0.07)] flex gap-2 items-center justify-center">
        <img src={productResultsIcon} alt="" />
        <span className="font-family-segoe text-primary text-[18px] font-bold">
          Product Results
        </span>
      </section>

      {/* Top Match Product */}
      <div className="mt-2.5 py-5 px-3.5 bg-white rounded-[13px] shadow-[0px_1px_10px_0px_rgba(0,0,0,0.16)] flex flex-col gap-6">
        <div className="bg-white rounded-[13px] w-full shadow-[0px_1px_10px_0px_rgba(0,0,0,0.16)] p-2.5 flex gap-3">
          {/* Product Image */}
          <div className="relative w-[60px] h-[60px] rounded-lg overflow-hidden">
            <img
              src={topMatch.image_url || productGridImage}
              alt={topMatch.name}
              className="w-[60px] h-[60px] object-cover"
            />
          </div>

          {/* Product Info */}
          <div className="flex flex-col flex-1 gap-3.5">
            {/* Product Name & Description */}
            <div className="flex flex-col gap-2">
              <h3 className="font-roboto font-semibold text-[16px] text-black capitalize leading-normal">
                {topMatch.name}
              </h3>
              <p className="font-roboto font-normal text-[14px] text-[#4e4e4e] leading-normal">
                {topMatch.description?.substring(0, 50) ||
                  'No description available'}
              </p>
            </div>

            {/* Similarity Score */}
            <div className="inline-flex">
              <div className="bg-[#00A23E] rounded-[5px] px-[7px] py-[3px] flex items-center justify-center gap-[3px]">
                <span className="font-roboto font-normal text-[12px] text-white capitalize">
                  {Math.round(topMatch.similarity_score * 100)}% Match
                </span>
                <StarIcon />
              </div>
            </div>
          </div>
          {/* Favorite Button */}
          <button className="w-[22px] h-[22px] bg-[rgba(255,255,255,0.3)] p-[5px] rounded-sm shadow-[0px_2px_16px_0px_rgba(6,51,54,0.1)]">
            <img src={heartIcon} alt="Add to favorites" />
          </button>
        </div>

        {/* Price & Buy Button */}
        <div className="flex items-center justify-between">
          <span className="font-roboto font-semibold text-[18px] text-primary">
            {topMatch.price || 'Price not available'}
          </span>
          <Button
            onClick={() => window.open(topMatch.permalink, '_blank')}
            className="bg-[#00A23E] text-white px-6 py-2 rounded-md"
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
        <section className="mt-5">
          <header className="font-family-roboto text-[18px] font-medium">
            Similar Products ({alternatives.length})
          </header>
          <div className="mt-3.5 flex flex-col gap-2.5">
            {alternatives.map((product) => (
              <div key={product.id} className="flex flex-col gap-2.5">
                <div className="bg-white rounded-[13px] w-full shadow-[0px_1px_10px_0px_rgba(0,0,0,0.16)] p-2.5 flex gap-3">
                  {/* Product Image */}
                  <div className="relative w-[60px] h-[60px] rounded-lg overflow-hidden">
                    <img
                      src={product.image_url || productGridImage}
                      alt={product.name}
                      className="w-[60px] h-[60px] object-cover"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex flex-col flex-1 gap-3.5">
                    {/* Product Name & Description */}
                    <div className="flex flex-col gap-2">
                      <h3 className="font-roboto font-semibold text-[16px] text-black capitalize leading-normal">
                        {product.name}
                      </h3>
                      <p className="font-roboto font-normal text-[14px] text-[#4e4e4e] leading-normal">
                        {product.description?.substring(0, 50) ||
                          'No description'}
                      </p>
                    </div>

                    {/* Match Score */}
                    <div className="inline-flex">
                      <div className="bg-[#eaeaea] rounded-[5px] px-[7px] py-[3px] flex items-center justify-center gap-[3px]">
                        <span className="font-roboto font-normal text-[12px] text-black">
                          {Math.round(product.similarity_score * 100)}% Match
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* View Button */}
                  <Button
                    onClick={() => window.open(product.permalink, '_blank')}
                    className="bg-[#00A23E] p-[5px] text-white rounded-sm px-2.5 shadow-[0px_2px_16px_0px_rgba(6,51,54,0.1)]"
                  >
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* AI Note */}
      <section className="mt-10 mb-20 p-4 text-white font-family-roboto leading-6 rounded-[10px] bg-[#20799F]">
        <header className="flex gap-2.5 font-medium text-[18px]">
          <img src={aiIcon} alt="AI" />
          <span>AI Scan Results</span>
        </header>

        <p className="mt-3.5">
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
