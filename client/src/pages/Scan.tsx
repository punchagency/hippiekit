import cancelButton from '../assets/cancel.svg';
import lightningButton from '../assets/bolt.svg';
import galleryIcon from '../assets/galleryIcon.svg';
import scanPhoto from '../assets/scanPhoto.png';
import { Button } from '@/components/ui/button';
import { ScanIcon } from '@/assets/homeIcons';
export const Scan = () => {
  return (
    <div className="mx-[24.5px]">
      <div className="flex items-center justify-between mb-4 pb-4">
        <div className="rounded-[7px] p-2.5 bg-[#FFF] shadow-[0_2px_4px_0_rgba(0,0,0,0.07)]">
          <img src={cancelButton} alt="" />
        </div>

        <div className="mt-10 flex p-2.5 items-center gap-[15px] ">
          <ScanIcon className="w-[29px] height=[26px]" />
          <span className="font-family-segoe text-primary text-[18px] font-bold">
            Scan Product
          </span>
        </div>
        <div className="rounded-[7px] p-2.5 bg-[#FFF] shadow-[0_2px_4px_0_rgba(0,0,0,0.07)]">
          <div>
            <img src={lightningButton} alt="" />
          </div>
        </div>
      </div>

      <div className="h-[641px] flex flex-col justify-between">
        <img src={scanPhoto} alt="" />

        <Button className="text-white font-semibold font-family-poppins">
          Scan
        </Button>
        <Button className="bg-transparent border mt-[90px] max-w-[120px] border-primary">
          <div className="flex items-center gap-2  ">
            <img src={galleryIcon} alt="" /> Gallery
          </div>
        </Button>
      </div>
    </div>
  );
};

export default Scan;
