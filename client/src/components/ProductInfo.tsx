import heartIcon from '@/assets/heartIcon.svg';
import productGridImage from '@/assets/productGridImage.png';

type Props = {
  name: string;
  description: string;
  img: string;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
};

export default function ProductInfo({
  name,
  description,
  img,
  isFavorite = false,
  onToggleFavorite,
}: Props) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="bg-white rounded-[13px] w-full h-[100px] shadow-[0px_1px_10px_0px_rgba(0,0,0,0.16)] p-2.5 flex gap-3">
        {/* Product Image */}
        <div className="relative w-[60px] h-[60px] shrink-0 rounded-lg overflow-hidden">
          <img
            src={img || productGridImage}
            alt="Product Name"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Product Info */}
        <div className="flex flex-col flex-1 min-w-0 justify-center gap-1">
          {/* Product Name & Description */}
          <div className="flex flex-col gap-1">
            <h3 className="font-roboto font-semibold text-[16px] text-black capitalize leading-tight line-clamp-1">
              {name}
            </h3>
            <p className="font-roboto font-normal text-[14px] text-[#4e4e4e] leading-tight line-clamp-2">
              {description}
            </p>
          </div>
        </div>
        {/* Favorite Button */}
        <button
          onClick={onToggleFavorite}
          className="w-[22px] h-[22px] shrink-0 self-start bg-[rgba(255,255,255,0.3)] p-[5px] rounded-sm shadow-[0px_2px_16px_0px_rgba(6,51,54,0.1)] transition-opacity hover:opacity-70"
        >
          <img
            src={heartIcon}
            alt="Favorite"
            className="transition-all"
            style={{
              filter: isFavorite ? 'none' : 'grayscale(100%) brightness(1.5)',
            }}
          />
        </button>
      </div>
    </div>
  );
}
