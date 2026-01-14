import lightningButton from '../assets/bolt.svg';
import scanPhoto from '../assets/scanPhoto.png';
import { Button } from '@/components/ui/button';
// import { ScanIcon } from '@/assets/homeIcons';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { takePicture } from '@/lib/cameraService';
// Removed unused identifyProduct import
import { barcodeService } from '@/services/barcodeService';
import { Barcode, Sparkles } from 'lucide-react';
import { toast } from '@/lib/toast.tsx';
import { PageHeader } from '@/components/PageHeader';

export const Scan = () => {
  const navigate = useNavigate();
  // Removed unused capturedPhoto state
  const [manualBarcode, setManualBarcode] = useState('');

  // Handle manual barcode entry (for testing)
  const handleManualBarcodeSubmit = async () => {
    if (!manualBarcode.trim()) {
      toast.warning('Please enter a barcode');
      return;
    }

    try {
      console.log('Manual barcode entered:', manualBarcode);

      // Navigate immediately to results page with loading state
      navigate('/barcode-product-results', {
        state: {
          product: null, // Will be loaded on results page
          barcode: manualBarcode.trim(),
          isBasicData: true,
        },
      });
    } catch (error) {
      console.error('Error with manual barcode:', error);
      toast.error('Failed to process barcode. Please try again.');
    }
  };

  // Handle barcode scanning
  const handleBarcodeScan = async () => {
    try {
      // Scan barcode using ML Kit
      const scanResult = await barcodeService.scanBarcode();

      if (!scanResult.success || !scanResult.barcode) {
        toast.error(scanResult.error || 'Failed to scan barcode');
        return;
      }

      console.log('Barcode scanned:', scanResult.barcode);

      // Navigate immediately to results page - data will load there
      navigate('/barcode-product-results', {
        state: {
          product: null, // Will be loaded on results page
          barcode: scanResult.barcode,
          isBasicData: true,
        },
      });
    } catch (error) {
      console.error('Error scanning barcode:', error);
      toast.error('Failed to scan barcode. Please try again.');
    }
  };

  // Handle product identification from front photo
  const handleProductIdentification = async () => {
    try {
      const photo = await takePicture();

      if (!photo?.webPath) {
        console.log('No photo captured');
        return;
      }

      console.log('Photo captured, navigating with:', photo.webPath);

      // Navigate immediately to results page - data will load there
      navigate('/product-identification-results', {
        state: {
          scannedImage: photo.webPath,
        },
      });
    } catch (e) {
      console.error('Product identification error:', e);
      if (e instanceof Error) {
        toast.error(e.message);
      } else {
        toast.error('Failed to take photo. Please try again.');
      }
    }
  };

  return (
    <header className="px-5 pt-6 pb-4">
      <PageHeader
        title="Scan Product"
        titleIconSrc={undefined}
        showBack={true}
        onBack={() => navigate('/')}
        rightSlot={
          <button className="rounded-[7px] p-2.5 bg-[#FFF] shadow-[0_2px_4px_0_rgba(0,0,0,0.07)]">
            <img src={lightningButton} alt="" />
          </button>
        }
      />

      <div className="h-[641px] flex flex-col gap-5 mt-4">
        <img src={scanPhoto} alt="" />

        <Button
          onClick={handleProductIdentification}
          className="bg-purple-600 text-white font-semibold font-family-poppins"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Identify Product (Take Photo)
          </div>
        </Button>

        <Button
          onClick={handleBarcodeScan}
          className="bg-secondary text-white font-semibold font-family-poppins mt-3"
        >
          <div className="flex items-center gap-2">
            <Barcode className="w-5 h-5" />
            Scan Barcode
          </div>
        </Button>

        {/* Manual Barcode Entry for Testing */}
        <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-sm font-semibold text-gray-600 mb-2">
            Test Mode: Enter Barcode Manually
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleManualBarcodeSubmit();
                }
              }}
              placeholder="Enter barcode (e.g., 6033000680051)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button
              onClick={handleManualBarcodeSubmit}
              className="bg-primary text-white font-semibold px-4 py-2"
              disabled={!manualBarcode.trim()}
            >
              Test
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Examples: 6033000680051, 8410100181523
          </p>
        </div>
      </div>
    </header>
  );
};

export default Scan;
