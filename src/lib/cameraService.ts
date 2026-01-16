import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

export interface CapturedPhoto {
  webPath: string;
  format: string;
  base64String?: string;
}

/**
 * Check if we're on a native platform (iOS/Android)
 */
const isNative = (): boolean => Capacitor.isNativePlatform();

/**
 * Take a photo using the device camera
 */
export const takePicture = async (): Promise<CapturedPhoto | null> => {
  console.log('[takePicture] Starting...');
  
  try {
    // On iOS, check if permission was explicitly denied
    if (isNative()) {
      try {
        const permissions = await Camera.checkPermissions();
        console.log('[takePicture] Camera permissions:', JSON.stringify(permissions));
        
        // Only block if explicitly denied
        if (permissions.camera === 'denied') {
          throw new Error('Camera access was denied. Please enable it in Settings.');
        }
      } catch (permError) {
        console.log('[takePicture] Permission check error (continuing anyway):', permError);
        // Continue anyway - let getPhoto handle the permission
      }
    }

    console.log('[takePicture] Calling Camera.getPhoto...');
    
    // Take photo - iOS will automatically prompt for permission if needed
    const photo = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      correctOrientation: true,
      saveToGallery: false, // Don't save to gallery to avoid needing NSPhotoLibraryAddUsageDescription
    });

    console.log('[takePicture] Photo result:', photo ? 'success' : 'null', photo?.webPath);

    if (!photo.webPath) {
      throw new Error('No photo was captured');
    }

    return {
      webPath: photo.webPath,
      format: photo.format,
      base64String: photo.base64String,
    };
  } catch (error: unknown) {
    console.error('[takePicture] Error:', error);
    
    // Re-throw with user-friendly message
    if (error instanceof Error) {
      const msg = error.message.toLowerCase();
      // User cancelled - check various cancellation messages
      if (msg.includes('cancel') || msg.includes('user') || msg.includes('dismiss')) {
        console.log('[takePicture] User cancelled');
        return null; // Silent return for user cancellation
      }
      // Permission denied
      if (msg.includes('denied') || msg.includes('permission') || msg.includes('access')) {
        throw new Error('Camera access denied. Please enable camera access in your device Settings.');
      }
      // Re-throw original error
      throw error;
    }
    throw new Error('Failed to take photo. Please try again.');
  }
};

/**
 * Pick a photo from the device gallery
 */
export const pickFromGallery = async (): Promise<CapturedPhoto | null> => {
  try {
    // On iOS, we should check if permission was explicitly denied
    // If it's 'prompt', iOS will show the permission dialog when we call getPhoto()
    if (isNative()) {
      const permissions = await Camera.checkPermissions();
      console.log('Photo library permissions:', permissions);
      
      // Only block if explicitly denied (not 'prompt', 'granted', or 'limited')
      if (permissions.photos === 'denied') {
        throw new Error('Photo library access was denied. Please enable it in Settings.');
      }
    }

    // Pick photo - iOS will automatically prompt for permission if needed
    const photo = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Photos,
    });

    if (!photo.webPath) {
      throw new Error('No photo was selected');
    }

    return {
      webPath: photo.webPath,
      format: photo.format,
      base64String: photo.base64String,
    };
  } catch (error: unknown) {
    console.error('Error picking photo from gallery:', error);
    
    // Re-throw with user-friendly message
    if (error instanceof Error) {
      // User cancelled
      if (error.message.includes('cancelled') || error.message.includes('canceled')) {
        return null; // Silent return for user cancellation
      }
      // Permission denied
      if (error.message.includes('denied') || error.message.includes('permission')) {
        throw new Error('Photo library access denied. Please enable access in your device Settings.');
      }
      throw error;
    }
    throw new Error('Failed to select photo. Please try again.');
  }
};
