import lightningButton from '../assets/bolt.svg';
import scanPhoto from '../assets/scanPhoto.png';
import { Button } from '@/components/ui/button';
// import { ScanIcon } from '@/assets/homeIcons';
import { useNavigate } from 'react-router-dom';
import { useState, useCallback } from 'react';
import { takePicture } from '@/lib/cameraService';
// Removed unused identifyProduct import
import { barcodeService } from '@/services/barcodeService';
import { Barcode, Sparkles, Loader2 } from 'lucide-react';
import { toast } from '@/lib/toast.tsx';
import { PageHeader } from '@/components/PageHeader';
import { ModuleInstallModal, type ModuleInstallState } from '@/components/ModuleInstallModal';
import BottomNav from '@/components/BottomNav';

export const Scan = () => {
  const navigate = useNavigate();
  // Removed unused capturedPhoto state
  const [manualBarcode, setManualBarcode] = useState('');
  
  // Module install modal state
  const [moduleModalOpen, setModuleModalOpen] = useState(false);
  const [moduleModalState, setModuleModalState] = useState<ModuleInstallState>('idle');
  const [moduleInstallProgress, setModuleInstallProgress] = useState(0);
  const [moduleInstallError, setModuleInstallError] = useState<string | undefined>();

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

  // Handle the actual scan after module is ready
  const performBarcodeScan = useCallback(async () => {
    try {
      const scanResult = await barcodeService.performScan();

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
  }, [navigate]);

  // Handle module installation
  const handleModuleInstall = useCallback(async () => {
    setModuleModalState('installing');
    setModuleInstallProgress(0);
    setModuleInstallError(undefined);

    // Set up progress callback
    barcodeService.setInstallProgressCallback((progress) => {
      setModuleInstallProgress(progress.progress);
    });

    try {
      const installed = await barcodeService.installModule();

      // Clear callback
      barcodeService.setInstallProgressCallback(null);

      if (installed) {
        setModuleInstallProgress(100);
        setModuleModalState('success');
      } else {
        setModuleModalState('error');
        setModuleInstallError('Installation timed out. Please try again.');
      }
    } catch (error) {
      barcodeService.setInstallProgressCallback(null);
      setModuleModalState('error');
      setModuleInstallError(error instanceof Error ? error.message : 'Unknown error');
    }
  }, []);

  // Handle barcode scanning
  const handleBarcodeScan = async () => {
    try {
      // First check if module installation is needed
      const { needsInstall, isSupported } = await barcodeService.checkModuleStatus();

      if (!isSupported) {
        toast.error('Barcode scanning is not supported on this device');
        return;
      }

      // If module needs to be installed (Android only), show the modal
      if (needsInstall) {
        setModuleModalOpen(true);
        setModuleModalState('confirm');
        return;
      }

      // Module is ready, perform the scan
      await performBarcodeScan();
    } catch (error) {
      console.error('Error scanning barcode:', error);
      toast.error('Failed to scan barcode. Please try again.');
    }
  };

  // Handle modal confirm (start install or retry)
  const handleModuleConfirm = () => {
    if (moduleModalState === 'confirm' || moduleModalState === 'error') {
      handleModuleInstall();
    }
  };

  // Handle modal cancel
  const handleModuleCancel = () => {
    setModuleModalOpen(false);
    setModuleModalState('idle');
    setModuleInstallProgress(0);
    setModuleInstallError(undefined);
  };

  // Handle modal close (after success - start scanning)
  const handleModuleClose = async () => {
    setModuleModalOpen(false);
    setModuleModalState('idle');
    setModuleInstallProgress(0);
    
    // If success, proceed to scan
    await performBarcodeScan();
  };

  // Loading state for buttons
  const [isIdentifying, setIsIdentifying] = useState(false);

  // Handle product identification from front photo
  const handleProductIdentification = async () => {
    if (isIdentifying) return; // Prevent double-clicks
    
    console.log('[handleProductIdentification] Button clicked');
    setIsIdentifying(true);
    
    try {
      console.log('[handleProductIdentification] Calling takePicture...');
      const photo = await takePicture();
      console.log('[handleProductIdentification] takePicture result:', photo);

      if (!photo?.webPath) {
        console.log('[handleProductIdentification] No photo captured (user cancelled or error)');
        return;
      }

      console.log('[handleProductIdentification] Photo captured, navigating with:', photo.webPath);

      // Navigate immediately to results page - data will load there
      navigate('/product-identification-results', {
        state: {
          scannedImage: photo.webPath,
        },
      });
    } catch (e) {
      console.error('[handleProductIdentification] Error:', e);
      if (e instanceof Error) {
        toast.error(e.message);
      } else {
        toast.error('Failed to take photo. Please try again.');
      }
    } finally {
      setIsIdentifying(false);
    }
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Module Install Modal for Android */}
      <ModuleInstallModal
        isOpen={moduleModalOpen}
        state={moduleModalState}
        progress={moduleInstallProgress}
        errorMessage={moduleInstallError}
        onConfirm={handleModuleConfirm}
        onCancel={handleModuleCancel}
        onClose={handleModuleClose}
      />

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

        <div className="flex flex-col gap-5 mt-4">
          <img src={scanPhoto} alt="" className="w-full max-h-[400px] object-contain" />

        <Button
          onClick={handleProductIdentification}
          disabled={isIdentifying}
          className="bg-purple-600 text-white font-semibold font-family-poppins"
        >
          <div className="flex items-center gap-2">
            {isIdentifying ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
            {isIdentifying ? 'Opening Camera...' : 'Identify Product (Take Photo)'}
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
              placeholder="Enter barcode (e.g., 3017620422003)"
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
            Examples: 3017620422003 (Nutella), 5449000000996 (Coca-Cola)
          </p>
        </div>
      </div>
    </header>
    
    {/* Bottom Navigation */}
    <BottomNav />
    </div>
  );
};

export default Scan;
