import { Button } from '@/components/ui/button';
import cancelButton from '../assets/cancel.svg';
import GalleryIcon from '../assets/galleryIcon.svg';

export const Gallery = () => {
  return (
    <div className="relative mx-[24.5px]">
      <header className="flex items-center justify-between">
        <div className="rounded-[7px] p-2.5 bg-[#FFF] shadow-[0_2px_4px_0_rgba(0,0,0,0.07)]">
          <img src={cancelButton} alt="" />
        </div>

        <div className="mt-10 flex flex-col items-center  ">
          <div className="mt-10 flex p-2.5 items-center gap-[7px] ">
            <img src={GalleryIcon} alt="" />
            <span className="font-family-segoe text-primary text-[18px] font-bold">
              Gallery
            </span>
          </div>
          <h2 className="text-[18px] text-center roboto font-medium ">
            Choose From Photos
          </h2>
        </div>

        <div></div>
      </header>

      <div className="mt-10 grid grid-cols-3">
        {[...Array(12)].map((_, index) => (
          <div key={index} className="p-1">
            <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">Image {index + 1}</span>
            </div>
          </div>
        ))}
      </div>

      <Button className="mt-20 w-full font-family-poppins rounded-[10px] p-2.5 text-white">
        Done
      </Button>
    </div>
  );
};
