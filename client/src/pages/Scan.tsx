import cancelButton from '../assets/cancel.svg';
import lightningButton from '../assets/bolt.svg';
import galleryIcon from '../assets/galleryIcon.svg';
import scanPhoto from '../assets/scanPhoto.png';
import { Button } from '@/components/ui/button';
import { ScanIcon } from '@/assets/homeIcons';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { takePicture, pickFromGallery } from '@/lib/cameraService';
import { scanImage } from '@/services/scanService';
import { ScanningLoader } from '@/components/ScanningLoader';

export const Scan = () => {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  // Handle taking a picture with camera
  const handleTakePicture = async () => {
    const photo = await takePicture();
    if (photo) {
      setCapturedPhoto(photo.webPath);
      await handleScanImage(photo.webPath);
    }
  };

  // Handle picking from gallery
  const handleBrowsePhoto = async () => {
    const photo = await pickFromGallery();
    if (photo) {
      setCapturedPhoto(photo.webPath);
      await handleScanImage(photo.webPath);
    }
  };

  // Handle scanning the image
  const handleScanImage = async (imageUri: string) => {
    try {
      setIsScanning(true);
      const result = await scanImage(imageUri);

      console.log('Scan result:', result);

      if (result.success && result.products.length > 0) {
        // Navigate to product results with scan results
        navigate('/product-results', {
          state: {
            scanResults: result.products,
            scannedImage: imageUri,
          },
        });
      } else {
        // Show no results message
        alert(
          result.message || 'No matching products found. Try a different image.'
        );
      }
    } catch (error) {
      console.error('Error scanning image:', error);
      alert(
        'Failed to scan image. Please make sure the AI service is running.'
      );
    } finally {
      setIsScanning(false);
      setCapturedPhoto(null);
    }
  };

  // Show scanning loader while processing
  if (isScanning) {
    return <ScanningLoader isVisible={isScanning} />;
  }
  return (
    <div className="mx-[24.5px]">
      <div className="flex items-center justify-between mb-4 pb-4">
        <button
          onClick={() => navigate('/')}
          className="rounded-[7px] p-2.5 bg-[#FFF] shadow-[0_2px_4px_0_rgba(0,0,0,0.07)]"
        >
          <img src={cancelButton} alt="" />
        </button>

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
        <img src={capturedPhoto || scanPhoto} alt="" />

        <Button
          onClick={handleTakePicture}
          className="text-white font-semibold font-family-poppins"
        >
          Scan
        </Button>
        <Button
          onClick={handleBrowsePhoto}
          className="bg-transparent border mt-[90px] max-w-[120px] border-primary"
        >
          <div className="flex items-center gap-2  ">
            <img src={galleryIcon} alt="" /> Gallery
          </div>
        </Button>
      </div>
    </div>
  );
};

export default Scan;
