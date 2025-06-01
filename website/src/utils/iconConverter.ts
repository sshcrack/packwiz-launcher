/**
 * Utility for client-side icon handling
 * 
 * This module handles the validation and upload of ICO format icon files
 * for use with the GitHub Actions workflow.
 */

import { API_BASE_URL } from './github';

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
 * Only .ico files are accepted
 */
export async function uploadIconFile(file: File): Promise<string> {
  // Validate that the file is in .ico format
  if (!isIcoFile(file)) {
    throw new Error('Only .ico files are supported. Please convert your image to .ico format before uploading.');
  }

  // Create FormData
  const formData = new FormData();
  formData.append('icon', file);

  // Upload the file to our Express server endpoint
  const response = await fetch(`${API_BASE_URL}/api/upload-icon`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to upload icon: ${await response.text()}`);
  }

  const data = await response.json();
  return data.url;
}
