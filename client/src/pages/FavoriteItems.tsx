import { Button } from '@/components/ui/button';
import backButton from '../assets/backButton.svg';
import logo from '@/assets/profileImgSample.jpg';
import favoriteItemsMain from '../assets/favoriteItemsHero.png';
import heartIconReg from '@/assets/heartIconReg.svg';

import OptionIcon from '@/assets/optionsIcon.svg';
import { Products } from '@/components/Products';

const FavoriteItems = () => {
  const productsGridData = [
    {
      id: 1,
      image: logo,
      price: '$29.99',
      productName: 'Product 1',
      description: 'High quality product with excellent features',
      rating: 4.5,
    },
    {
      id: 2,
      image: logo,
      price: '$39.99',
      productName: 'Product 2',
      description: 'Premium quality product',
      rating: 4.8,
    },
    {
      id: 3,
      image: logo,
      price: '$24.99',
      productName: 'Product 3',
      description: 'Affordable and reliable product',
      rating: 4.2,
    },
    {
      id: 4,
      image: logo,
      price: '$49.99',
      productName: 'Product 4',
      description: 'Top-rated product in its category',
      rating: 4.9,
    },
    {
      id: 5,
      image: logo,
      price: '$19.99',
      productName: 'Product 5',
      description: 'Best value for money',
      rating: 4.3,
    },
    {
      id: 6,
      image: logo,
      price: '$34.99',
      productName: 'Product 6',
      description: 'Popular choice among customers',
      rating: 4.6,
    },
  ];
  return (
    <section className="relative">
      <div className="mx-[24.5px] mb-4 relative flex items-center justify-center">
        <button className="absolute left-0 rounded-[7px] p-2.5 bg-[#FFF] shadow-[0_2px_4px_0_rgba(0,0,0,0.07)]">
          <img src={backButton} alt="Go back" />
        </button>

        <div className="mt-10 flex p-2.5 items-center gap-[7px]">
          <span className="font-family-segoe text-primary text-[18px] font-bold">
            Pet Items
          </span>
        </div>
      </div>

      <div className="w-full h-[408px] rounded-[14px] bg-white p-3.5 gap-4 flex flex-col">
        <div className="rounded-[14px] p-3.5 flex flex-col gap-4 shadow-[0_2px_4px_0_rgba(0,0,0,0.07)]">
          <div className="relative h-[202px] w-[379px] ">
            <img
              src={favoriteItemsMain}
              alt=""
              className="w-full h-full object-cover"
            />

            <button className="absolute top-2.5 right-3 bg-[rgba(255,255,255,0.3)] p-[5px] rounded-sm shadow-[0px_2px_16px_0px_rgba(6,51,54,0.1)]">
              <img src={heartIconReg} alt="" />
            </button>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-primary text-[18px] font-family-segoe font-bold capitalize">
                brand Name
              </h3>
              <h3 className="text-primary text-[18px] font-family-segoe font-bold capitalize">
                product Name
              </h3>
              <p className="text-[14px] font-family-roboto">
                Description Lorem ipsum dolor sit amet consectetur...
              </p>
            </div>

            <button>
              <img src={OptionIcon} alt="" />
            </button>
          </div>

          <Button className="font-semibold text-[16px] text-white">
            Add to Shopping
          </Button>
        </div>
      </div>

      <div className="mx-4">
        <Products data={productsGridData} />
      </div>
    </section>
  );
};

export default FavoriteItems;
