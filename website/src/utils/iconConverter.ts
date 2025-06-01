/**
 * Utility for client-side icon handling
 * 
 * This module provides utility functions for working with icon files.
 */

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
