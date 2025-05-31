// Client-side utility for icon conversion
// This script is responsible for converting images to .ico format in the browser

/**
 * Convert an image to ICO format (browser-side)
 * This is a basic implementation - a real solution would use a proper ICO library
 * 
 * @param {File|Blob} imageFile - The image file to convert
 * @returns {Promise<Blob>} - A Blob representing the ICO file
 */
export async function convertToIco(imageFile) {
  // Create an image element to load the file
  const img = new Image();
  
  // Create a promise that resolves when the image is loaded
  const imageLoaded = new Promise((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Failed to load image'));
  });
  
  // Load the image from the file
  img.src = URL.createObjectURL(imageFile);
  await imageLoaded;
  
  // Create a canvas with 16x16, 32x32, and 48x48 sizes (common ICO sizes)
  const sizes = [16, 32, 48];
  const canvases = sizes.map(size => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, size, size);
    return canvas;
  });
  
  // Get image data from each canvas
  const imageDataArray = canvases.map(canvas => {
    return canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
  });
  
  // In a real implementation, you would properly encode these as ICO format
  // For simplicity, we'll just convert to PNG and pretend it's an ICO
  // Note: This doesn't create a real ICO file! It just simulates the conversion process
  
  // Convert the largest size to PNG for our mock ICO
  const pngBlob = await new Promise(resolve => {
    canvases[canvases.length - 1].toBlob(resolve, 'image/png');
  });
  
  // Return the PNG blob with the ICO mime type
  return new Blob([pngBlob], { type: 'image/x-icon' });
}

/**
 * Check if the browser can convert images client-side
 * @returns {boolean} - True if client-side conversion is supported
 */
export function canConvertClientSide() {
  return typeof document !== 'undefined' && 
         typeof Image !== 'undefined' && 
         typeof Blob !== 'undefined' &&
         typeof document.createElement === 'function';
}
