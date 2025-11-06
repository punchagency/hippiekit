import backButton from '@/assets/backButton.svg';
import productResultsIcon from '@/assets/productResultsIcon.svg';
import productGridImage from '@/assets/productGridImage.png';
import heartIcon from '@/assets/heartIcon.svg';
import chemicalsIcon from '@/assets/chemicalsIcon.svg';
import cleanIngredientsIcon from '@/assets/cleanIngredientsIcon.svg';
import productContainerIngIcon from '@/assets/productContainerIngIcon.svg';
import aiIcon from '@/assets/aiIcon.svg';
import { StarIcon } from '@/assets/icons';

import { ProductResultInfoCard } from '@/components/ProductResultInfoCard';
import { Button } from '@/components/ui/button';

const ProductResults = () => {
  return (
    <section className="relative pt-6 mx-7">
      <div className="flex items-center justify-between mb-4">
        <div className="rounded-[7px] p-2.5 bg-[#FFF] shadow-[0_2px_4px_0_rgba(0,0,0,0.07)]">
          <img src={backButton} alt="" />
        </div>

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

      <div className="mt-2.5 py-5 px-3.5 bg-white rounded-[13px] shadow-[0px_1px_10px_0px_rgba(0,0,0,0.16)] flex flex-col gap-6">
        <div className="bg-white rounded-[13px] w-full shadow-[0px_1px_10px_0px_rgba(0,0,0,0.16)] p-2.5 flex gap-3">
          {/* Product Image */}
          <div className="relative w-[60px] h-[60px] rounded-lg overflow-hidden">
            <img
              src={productGridImage}
              alt="Product Name"
              className="w-[60px] h-[60px] object-cover"
            />
          </div>

          {/* Product Info */}
          <div className="flex flex-col flex-1 gap-3.5">
            {/* Product Name & Description */}
            <div className="flex flex-col gap-2">
              <h3 className="font-roboto font-semibold text-[16px] text-black capitalize leading-normal">
                product Name
              </h3>
              <p className="font-roboto font-normal text-[14px] text-[#4e4e4e] leading-normal">
                Lorem Ipsum Lorem Ipsum
              </p>
            </div>

            {/* Rating */}
            <div className="inline-flex">
              <div className="bg-[#eaeaea] rounded-[5px] px-[7px] py-[3px] flex items-center justify-center gap-[3px]">
                <span className="font-roboto font-normal text-[12px] text-black capitalize">
                  4.5
                </span>
                <StarIcon />
              </div>
            </div>
          </div>
          {/* Favorite Button */}
          <button className="w-[22px] h-[22px] bg-[rgba(255,255,255,0.3)] p-[5px] rounded-sm shadow-[0px_2px_16px_0px_rgba(6,51,54,0.1)]">
            <img src={heartIcon} alt="" />
          </button>
        </div>

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
      </div>

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

      <section className="mt-5">
        <header className="font-family-roboto text-[18px] font-medium">
          Hippiekit Vetted Plant-Based Swaps
        </header>
        <div className="mt-3.5 flex flex-col gap-2.5">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="flex flex-col gap-2.5 ">
              <div className="bg-white rounded-[13px] w-full shadow-[0px_1px_10px_0px_rgba(0,0,0,0.16)] p-2.5 flex gap-3">
                {/* Product Image */}
                <div className="relative w-[60px] h-[60px] rounded-lg overflow-hidden">
                  <img
                    src={productGridImage}
                    alt="Product Name"
                    className="w-[60px] h-[60px] object-cover"
                  />
                </div>

                {/* Product Info */}
                <div className="flex flex-col flex-1 gap-3.5">
                  {/* Product Name & Description */}
                  <div className="flex flex-col gap-2">
                    <h3 className="font-roboto font-semibold text-[16px] text-black capitalize leading-normal">
                      product Name
                    </h3>
                    <p className="font-roboto font-normal text-[14px] text-[#4e4e4e] leading-normal">
                      Lorem Ipsum Lorem Ipsum
                    </p>
                  </div>

                  {/* Rating */}
                  <div className="inline-flex">
                    Review
                    <div className=" px-[7px] py-[3px] flex items-center justify-center gap-[3px]">
                      {Array.from({ length: 5 }, (_, i) => (
                        <StarIcon key={i} />
                      ))}
                    </div>
                  </div>
                </div>
                {/* Favorite Button */}
                <Button className=" bg-[#00A23E] p-[5px] text-white rounded-sm px-2.5 shadow-[0px_2px_16px_0px_rgba(6,51,54,0.1)]">
                  Buy now
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-32 mb-20 p-4 text-white font-family-roboto leading-6 rounded-[10px] bg-[#20799F]">
        <header className="flex gap-2.5 font-medium   text-[18px]">
          <img src={aiIcon} alt="" />
          <span>AI Note</span>
        </header>

        <p className="mt-3.5">
          These products have not been researched by Hippiekit yet, please
          research before purchasing.
        </p>
      </section>
    </section>
  );
};

export default ProductResults;
