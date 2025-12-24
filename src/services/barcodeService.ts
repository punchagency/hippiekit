/**
 * Barcode Scanning Service
 * Handles barcode scanning using Capacitor ML Kit Barcode Scanner
 */

import {
  BarcodeScanner,
  BarcodeFormat,
} from '@capacitor-mlkit/barcode-scanning';

export interface BarcodeResult {
  success: boolean;
  barcode?: string;
  format?: string;
  error?: string;
}

class BarcodeService {
  /**
   * Check if barcode scanning is supported on this device
   */
  async isSupported(): Promise<boolean> {
    try {
      const result = await BarcodeScanner.isSupported();
      return result.supported;
    } catch (error) {
      console.error('Error checking barcode scanner support:', error);
      return false;
    }
  }

  /**
   * Check if Google Barcode Scanner module is available (Android only)
   */
  async isModuleAvailable(): Promise<boolean> {
    try {
      const result =
        await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable();
      return result.available;
    } catch (error) {
      console.error('Error checking module availability:', error);
      return false;
    }
  }

  /**
   * Install Google Barcode Scanner module (Android only)
   * Returns a promise that resolves when installation is complete
   */
  async installModule(): Promise<boolean> {
    try {
      // Start listening for installation progress
      const listener = await BarcodeScanner.addListener(
        'googleBarcodeScannerModuleInstallProgress',
        (event) => {
          console.log('Module installation progress:', event);
        }
      );

      // Start installation
      await BarcodeScanner.installGoogleBarcodeScannerModule();

      // Wait for installation to complete
      return new Promise((resolve) => {
        const checkInstallation = setInterval(async () => {
          const isAvailable = await this.isModuleAvailable();
          if (isAvailable) {
            clearInterval(checkInstallation);
            listener.remove();
            resolve(true);
          }
        }, 500); // Check every 500ms

        // Timeout after 30 seconds
        setTimeout(() => {
          clearInterval(checkInstallation);
          listener.remove();
          resolve(false);
        }, 30000);
      });
    } catch (error) {
      console.error('Error installing barcode scanner module:', error);
      return false;
    }
  }

  /**
   * Request camera permissions for barcode scanning
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { camera } = await BarcodeScanner.requestPermissions();
      return camera === 'granted' || camera === 'limited';
    } catch (error) {
      console.error('Error requesting barcode scanner permissions:', error);
      return false;
    }
  }

  /**
   * Check if camera permissions are granted
   */
  async checkPermissions(): Promise<boolean> {
    try {
      const { camera } = await BarcodeScanner.checkPermissions();
      return camera === 'granted' || camera === 'limited';
    } catch (error) {
      console.error('Error checking barcode scanner permissions:', error);
      return false;
    }
  }

  /**
   * Scan a barcode using the device camera
   * Opens a camera view with barcode detection overlay
   */
  async scanBarcode(): Promise<BarcodeResult> {
    try {
      // Check if supported
      const supported = await this.isSupported();
      if (!supported) {
        return {
          success: false,
          error: 'Barcode scanning is not supported on this device',
        };
      }

      // Check if module is available (Android only)
      const moduleAvailable = await this.isModuleAvailable();
      if (!moduleAvailable) {
        // Ask user if they want to install the module
        const shouldInstall = window.confirm(
          'The Google Barcode Scanner module needs to be installed. This is a one-time download. Do you want to continue?'
        );

        if (!shouldInstall) {
          return {
            success: false,
            error: 'Barcode scanner module installation cancelled',
          };
        }

        // Show loading message
        alert('Installing barcode scanner module... Please wait.');

        // Install the module
        const installed = await this.installModule();
        if (!installed) {
          return {
            success: false,
            error:
              'Failed to install barcode scanner module. Please try again later.',
          };
        }

        alert('Module installed successfully! Starting scanner...');
      }

      // Check/request permissions
      let hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        hasPermission = await this.requestPermissions();
        if (!hasPermission) {
          return {
            success: false,
            error: 'Camera permission is required for barcode scanning',
          };
        }
      }

      // Hide background to show camera
      document.querySelector('body')?.classList.add('barcode-scanner-active');

      // Start scanning
      const result = await BarcodeScanner.scan({
        formats: [
          BarcodeFormat.Ean13,
          BarcodeFormat.Ean8,
          BarcodeFormat.UpcA,
          BarcodeFormat.UpcE,
          BarcodeFormat.Code128,
          BarcodeFormat.Code39,
          BarcodeFormat.Code93,
          BarcodeFormat.QrCode,
        ],
      });

      // Show background again
      document
        .querySelector('body')
        ?.classList.remove('barcode-scanner-active');

      if (result.barcodes && result.barcodes.length > 0) {
        const firstBarcode = result.barcodes[0];
        return {
          success: true,
          barcode: firstBarcode.rawValue,
          format: firstBarcode.format,
        };
      }

      return {
        success: false,
        error: 'No barcode detected',
      };
    } catch (error: any) {
      // Show background again in case of error
      document
        .querySelector('body')
        ?.classList.remove('barcode-scanner-active');

      console.error('Barcode scanning error:', error);
      return {
        success: false,
        error: error?.message || 'Failed to scan barcode',
      };
    }
  }

  /**
   * Stop the barcode scanner
   */
  async stopScan(): Promise<void> {
    try {
      await BarcodeScanner.stopScan();
      document
        .querySelector('body')
        ?.classList.remove('barcode-scanner-active');
    } catch (error) {
      console.error('Error stopping barcode scanner:', error);
    }
  }
}

// Export singleton instance
export const barcodeService = new BarcodeService();
