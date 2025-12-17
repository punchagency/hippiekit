import { Button } from './ui/button';

import favoriteItemsMain from '../assets/favoriteItemsHero.png';
import heartIconReg from '@/assets/heartIconReg.svg';
import OptionIcon from '@/assets/optionsIcon.svg';

type Props = {
  img: string;
  prodName: string;
  brandName: string;
  description: string;
  btnText?: string;
  buy?: boolean;
};

export const ProductCarousel = ({
  img,
  prodName,
  brandName,
  description,
  btnText,
  buy = false,
}: Props) => {
  return (
    <div className="rounded-[14px] p-3.5 bg-white flex flex-col gap-4 shadow-[0_2px_4px_0_rgba(0,0,0,0.07)]">
      <div className="relative h-[202px] w-full ">
        <img
          src={img || favoriteItemsMain}
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
            {brandName}
          </h3>
          <h3 className="text-primary text-[18px] font-family-segoe font-bold capitalize">
            {prodName}
          </h3>
          <p className="text-[14px] font-family-roboto">{description}</p>
        </div>

        <button>
          <img src={OptionIcon} alt="" />
        </button>
      </div>

      {buy ? (
        <div className="flex justify-between gap-2.5 ">
          <Button className="flex-1 font-semibold text-[16px] text-white">
            {btnText || 'Add to Shopping'}
          </Button>
          <Button className=" flex-1 font-semibold text-[16px] bg-secondary text-white">
            {'Buy Now'}
          </Button>
        </div>
      ) : (
        <Button className="font-semibold text-[16px] text-white">
          {btnText || 'Add to Shopping'}
        </Button>
      )}
    </div>
  );
};
