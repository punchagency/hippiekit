import { StarIcon } from '@/assets/icons';

type Props = {
  data: {
    id: number;
    image: string;
    price: string;
    productName: string;
    description: string;
    rating: number;
  }[];
};

export const Products = ({ data }: Props) => {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      {data.map((product) => {
        const { id, image, productName, description, rating } = product;

        return (
          <div
            key={id}
            className="bg-white rounded-[13px] shadow-[0px_1px_10px_0px_rgba(0,0,0,0.16)] p-2 sm:p-2.5 flex flex-col gap-2 sm:gap-2.5"
          >
            {/* Product Image */}
            <div className="relative w-full h-[110px] sm:h-[127px] rounded-lg overflow-hidden">
              <img
                src={image}
                alt={productName}
                className="w-full h-full object-cover"
              />
              {/* Favorite Button */}
              <button className="absolute top-2 sm:top-2.5 right-2 sm:right-3 bg-[rgba(255,255,255,0.3)] p-[4px] sm:p-[5px] rounded-sm shadow-[0px_2px_16px_0px_rgba(6,51,54,0.1)]">
                <svg
                  width="11"
                  height="10"
                  viewBox="0 0 13 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="sm:w-[13px] sm:h-[12px]"
                >
                  <path
                    d="M6.5 0L7.95934 4.1459H12.3237L8.68216 6.7082L10.1415 10.8541L6.5 8.2918L2.85846 10.8541L4.31784 6.7082L0.676299 4.1459H5.04066L6.5 0Z"
                    fill="white"
                  />
                </svg>
              </button>
            </div>

            {/* Product Info */}
            <div className="flex flex-col gap-2 sm:gap-3.5">
              {/* Product Name & Description */}
              <div className="flex flex-col gap-1.5 sm:gap-2.5">
                <h3 className="font-roboto font-semibold text-[14px] sm:text-[16px] text-black capitalize leading-tight sm:leading-normal line-clamp-1">
                  {productName}
                </h3>
                <p className="font-roboto font-normal text-[12px] sm:text-[14px] text-[#4e4e4e] leading-tight sm:leading-normal line-clamp-2">
                  {description}
                </p>
              </div>

              {/* Rating */}
              <div className="inline-flex">
                <div className="bg-[#eaeaea] rounded-[5px] px-[6px] sm:px-[7px] py-[2px] sm:py-[3px] flex items-center justify-center gap-[3px]">
                  <span className="font-roboto font-normal text-[11px] sm:text-[12px] text-black capitalize">
                    {rating}
                  </span>
                  <StarIcon />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
