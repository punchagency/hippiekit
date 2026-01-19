import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface PhotoScanData {
  product: any;
  recommendations: any;
  scannedImage: string;
  timestamp: number;
}

interface BarcodeScanData {
  product: any;
  recommendations: any;
  barcode: string;
  timestamp: number;
}

interface ScanCacheContextType {
  // Photo scans
  getLatestPhotoScan: () => PhotoScanData | null;
  setPhotoScan: (data: Omit<PhotoScanData, 'timestamp'>) => void;
  clearPhotoScans: () => void;

  // Barcode scans
  getBarcodeScan: (barcode: string) => BarcodeScanData | null;
  setBarcodeScan: (data: Omit<BarcodeScanData, 'timestamp'>) => void;
  clearBarcodeScans: () => void;

  // Clear all
  clearAllScans: () => void;
}

const ScanCacheContext = createContext<ScanCacheContextType | undefined>(
  undefined,
);

const MAX_PHOTO_SCANS = 5; // Keep last 5 photo scans
const MAX_BARCODE_SCANS = 10; // Keep last 10 barcode scans

export const ScanCacheProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [photoScans, setPhotoScans] = useState<PhotoScanData[]>([]);
  const [barcodeScans, setBarcodeScans] = useState<
    Map<string, BarcodeScanData>
  >(new Map());

  // Photo scan methods
  const getLatestPhotoScan = (): PhotoScanData | null => {
    if (photoScans.length === 0) return null;
    return photoScans[0]; // Most recent is first
  };

  const setPhotoScan = (data: Omit<PhotoScanData, 'timestamp'>) => {
    const scanData: PhotoScanData = {
      ...data,
      timestamp: Date.now(),
    };

    setPhotoScans((prev) => {
      const newScans = [scanData, ...prev];
      // Keep only the most recent scans
      return newScans.slice(0, MAX_PHOTO_SCANS);
    });

    console.log('📦 Photo scan cached in memory');
  };

  const clearPhotoScans = () => {
    setPhotoScans([]);
    console.log('🗑️ Photo scans cleared from cache');
  };

  // Barcode scan methods
  const getBarcodeScan = (barcode: string): BarcodeScanData | null => {
    return barcodeScans.get(barcode) || null;
  };

  const setBarcodeScan = (data: Omit<BarcodeScanData, 'timestamp'>) => {
    const scanData: BarcodeScanData = {
      ...data,
      timestamp: Date.now(),
    };

    setBarcodeScans((prev) => {
      const newScans = new Map(prev);
      newScans.set(data.barcode, scanData);

      // If we have too many, remove the oldest ones
      if (newScans.size > MAX_BARCODE_SCANS) {
        // Convert to array, sort by timestamp, keep newest
        const sorted = Array.from(newScans.entries())
          .sort((a, b) => b[1].timestamp - a[1].timestamp)
          .slice(0, MAX_BARCODE_SCANS);
        return new Map(sorted);
      }

      return newScans;
    });

    console.log(`📦 Barcode scan cached in memory: ${data.barcode}`);
  };

  const clearBarcodeScans = () => {
    setBarcodeScans(new Map());
    console.log('🗑️ Barcode scans cleared from cache');
  };

  // Clear all scans
  const clearAllScans = () => {
    clearPhotoScans();
    clearBarcodeScans();
    console.log('🗑️ All scans cleared from cache');
  };

  const value: ScanCacheContextType = {
    getLatestPhotoScan,
    setPhotoScan,
    clearPhotoScans,
    getBarcodeScan,
    setBarcodeScan,
    clearBarcodeScans,
    clearAllScans,
  };

  return (
    <ScanCacheContext.Provider value={value}>
      {children}
    </ScanCacheContext.Provider>
  );
};

export const useScanCache = (): ScanCacheContextType => {
  const context = useContext(ScanCacheContext);
  if (!context) {
    throw new Error('useScanCache must be used within a ScanCacheProvider');
  }
  return context;
};
