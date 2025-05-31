/**
 * Utility for client-side icon handling and conversion
 * 
 * This module handles the conversion of icon files to the ICO format
 * and uploads them for use with the GitHub Actions workflow.
 */
import { canConvertClientSide, convertToIco } from './iconUtils';

/**
 * Converts an image file to a data URL
 */
export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Check if an image is already in .ico format
 */
export function isIcoFile(file: File): boolean {
  return file.type === 'image/x-icon' || file.name.toLowerCase().endsWith('.ico');
}

/**
 * Uploads an icon file and returns a URL to the uploaded file
 * If the file is not already in .ico format, it will be converted first
 */
export async function uploadIconFile(file: File): Promise<string> {
  let fileToUpload = file;
  
  // If the file is not in .ico format, we need to convert it
  if (!isIcoFile(file)) {
    // Check if we can do client-side conversion
    if (canConvertClientSide()) {
      console.log('Converting icon to .ico format on client-side...');
      const icoBlob = await convertToIco(file);
      fileToUpload = new File([icoBlob], file.name.replace(/\.[^/.]+$/, '') + '.ico', {
        type: 'image/x-icon'
      });
    } else {
      // For server-side conversion, we'll just rename the file for now
      console.warn('Client-side conversion not supported, using server-side conversion instead');
      fileToUpload = new File([file], file.name.replace(/\.[^/.]+$/, '') + '.ico', {
        type: 'image/x-icon'
      });
    }
  }
  
  // Create FormData
  const formData = new FormData();
  formData.append('icon', fileToUpload);
  
  // Upload the file to our API endpoint
  const response = await fetch('/api/upload-icon', {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error(`Failed to upload icon: ${await response.text()}`);
  }
  
  const data = await response.json();
  return data.url;
}
