import favoritesIcon from '@/assets/favoritesIcon.svg';
import { SearchIcon } from '@/assets/homeIcons';
import { Categories } from '@/components/Categories';
import profileSampleImage from '@/assets/profileImgSample.jpg';
import productGridImage from '@/assets/productGridImage.png';
import { useState } from 'react';

import heartIcon from '@/assets/heartIcon.svg';
const Favorites = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const categories = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    name: `Category ${i + 1}`,
    price: '$29.99',
    image: profileSampleImage,
    items: '50',
  }));

  return (
    <header className="px-5 pt-6 pb-4">
      <div className="flex items-center justify-center mb-4">
        <div className="mt-10 flex p-2.5 items-center gap-[7px] ">
          <img src={favoritesIcon} alt="Logo" className="" />
          <span className="font-family-segoe text-primary text-[18px] font-bold">
            Favorites
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search Here For Specific Item"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-primary p-2.5 bg-[#FFF] shadow-[0_2px_4px_0_rgba(0,0,0,0.07)]"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <SearchIcon />
            </div>
          </div>
        </div>
      </div>

      {/* Scan Button */}
      <section className=" rounded-[7px] px-4 py-5 bg-[#FFF] shadow-[0_2px_4px_0_rgba(0,0,0,0.07)] flex flex-col gap-7.5 ">
        <div className="flex justify-between">
          <h2 className="text-primary font-family-segoe text-[18px] font-bold capitalize">
            Top Categories
          </h2>

          <button>see all</button>
        </div>
        <Categories topCat products={categories} />
      </section>

      <div className="mt-3.5 flex flex-col gap-2.5">
        {Array.from({ length: 8 }).map((_, index) => (
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
              </div>
              {/* Favorite Button */}
              <button className="w-[22px] h-[22px] bg-[rgba(255,255,255,0.3)] p-[5px] rounded-sm shadow-[0px_2px_16px_0px_rgba(6,51,54,0.1)]">
                <img src={heartIcon} alt="" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </header>
  );
};

export default Favorites;
