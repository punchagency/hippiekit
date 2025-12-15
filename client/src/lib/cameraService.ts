import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export interface CapturedPhoto {
  webPath: string;
  format: string;
  base64String?: string;
}

/**
 * Take a photo using the device camera
 */
export const takePicture = async (): Promise<CapturedPhoto | null> => {
  try {
    // Requet camera permissions
    const permissions = await Camera.checkPermissions();

    if (permissions.camera !== 'granted') {
      const requestResult = await Camera.requestPermissions({
        permissions: ['camera'],
      });
      if (requestResult.camera !== 'granted') {
        throw new Error('Camera permission denied');
      }
    }

    // Take photo
    const photo = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      correctOrientation: true,
    });

    return {
      webPath: photo.webPath!,
      format: photo.format,
      base64String: photo.base64String,
    };
  } catch (error) {
    console.error('Error taking picture:', error);
    return null;
  }
};

/**
 * Pick a photo from the device gallery
 */
export const pickFromGallery = async (): Promise<CapturedPhoto | null> => {
  try {
    // Request photo permissions
    const permissions = await Camera.checkPermissions();

    if (permissions.photos !== 'granted' && permissions.photos !== 'limited') {
      const requestResult = await Camera.requestPermissions({
        permissions: ['photos'],
      });
      if (
        requestResult.photos !== 'granted' &&
        requestResult.photos !== 'limited'
      ) {
        throw new Error('Photo library permission denied');
      }
    }

    // Pick photo from gallery
    const photo = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Photos,
    });

    return {
      webPath: photo.webPath!,
      format: photo.format,
      base64String: photo.base64String,
    };
  } catch (error) {
    console.error('Error picking photo from gallery:', error);
    return null;
  }
};
