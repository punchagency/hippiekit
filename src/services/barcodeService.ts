/**
 * Barcode Scanning Service
 * Handles barcode scanning using Capacitor ML Kit Barcode Scanner
 */

import {
  BarcodeScanner,
  BarcodeFormat,
} from '@capacitor-mlkit/barcode-scanning';
import { Capacitor } from '@capacitor/core';

export interface BarcodeResult {
  success: boolean;
  barcode?: string;
  format?: string;
  error?: string;
}

export interface ModuleInstallProgress {
  state: number;
  progress: number;
}

export type ModuleInstallCallback = (progress: ModuleInstallProgress) => void;

class BarcodeService {
  private installProgressCallback: ModuleInstallCallback | null = null;

  /**
   * Check if we're running on iOS
   */
  isIOS(): boolean {
    return Capacitor.getPlatform() === 'ios';
  }

  /**
   * Check if we're running on Android
   */
  isAndroid(): boolean {
    return Capacitor.getPlatform() === 'android';
  }

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
   * On iOS, always returns true since ML Kit is bundled with the app
   */
  async isModuleAvailable(): Promise<boolean> {
    // iOS has ML Kit bundled via CocoaPods - no module download needed
    if (this.isIOS()) {
      return true;
    }

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
   * Set callback for installation progress updates
   */
  setInstallProgressCallback(callback: ModuleInstallCallback | null): void {
    this.installProgressCallback = callback;
  }

  /**
   * Install Google Barcode Scanner module (Android only)
   * Returns a promise that resolves when installation is complete
   * Progress is reported via the callback set with setInstallProgressCallback
   */
  async installModule(): Promise<boolean> {
    // iOS doesn't need module installation
    if (this.isIOS()) {
      return true;
    }

    try {
      let currentProgress = 0;
      
      // Start listening for installation progress
      const listener = await BarcodeScanner.addListener(
        'googleBarcodeScannerModuleInstallProgress',
        (event) => {
          console.log('Module installation progress:', event);
          currentProgress = event.progress || 0;
          
          // Report progress through callback
          if (this.installProgressCallback) {
            this.installProgressCallback({
              state: event.state || 0,
              progress: currentProgress,
            });
          }
        }
      );

      // Start installation
      await BarcodeScanner.installGoogleBarcodeScannerModule();

      // Wait for installation to complete with simulated progress
      return new Promise((resolve) => {
        let simulatedProgress = 0;
        
        const progressInterval = setInterval(() => {
          // Simulate progress if no real progress events
          if (currentProgress === 0 && simulatedProgress < 90) {
            simulatedProgress += Math.random() * 10;
            if (this.installProgressCallback) {
              this.installProgressCallback({
                state: 1,
                progress: Math.min(simulatedProgress, 90),
              });
            }
          }
        }, 500);

        const checkInstallation = setInterval(async () => {
          const isAvailable = await this.isModuleAvailable();
          if (isAvailable) {
            clearInterval(checkInstallation);
            clearInterval(progressInterval);
            listener.remove();
            
            // Report 100% progress
            if (this.installProgressCallback) {
              this.installProgressCallback({
                state: 2, // Complete
                progress: 100,
              });
            }
            
            resolve(true);
          }
        }, 500);

        // Timeout after 60 seconds
        setTimeout(() => {
          clearInterval(checkInstallation);
          clearInterval(progressInterval);
          listener.remove();
          resolve(false);
        }, 60000);
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
   * Check if module installation is needed (Android only)
   * Returns object with needsInstall flag
   */
  async checkModuleStatus(): Promise<{ needsInstall: boolean; isSupported: boolean }> {
    const isSupported = await this.isSupported();
    if (!isSupported) {
      return { needsInstall: false, isSupported: false };
    }

    // iOS never needs module install
    if (this.isIOS()) {
      return { needsInstall: false, isSupported: true };
    }

    const moduleAvailable = await this.isModuleAvailable();
    return { needsInstall: !moduleAvailable, isSupported: true };
  }

  /**
   * Perform the actual barcode scan (assumes all prerequisites are met)
   */
  async performScan(): Promise<BarcodeResult> {
    try {
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
    } catch (error: unknown) {
      // Show background again in case of error
      document
        .querySelector('body')
        ?.classList.remove('barcode-scanner-active');

      console.error('Barcode scanning error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to scan barcode';
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Scan a barcode using the device camera
   * This is the main entry point - handles module check for Android
   * For better UX, use checkModuleStatus() + installModule() + performScan() separately
   * to show proper UI during installation
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

      // On iOS, skip module check entirely - ML Kit is bundled
      if (!this.isIOS()) {
        // Check if module is available (Android only)
        const moduleAvailable = await this.isModuleAvailable();
        if (!moduleAvailable) {
          return {
            success: false,
            error: 'MODULE_INSTALL_REQUIRED',
          };
        }
      }

      return await this.performScan();
    } catch (error: unknown) {
      // Show background again in case of error
      document
        .querySelector('body')
        ?.classList.remove('barcode-scanner-active');

      console.error('Barcode scanning error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to scan barcode';
      return {
        success: false,
        error: errorMessage,
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
