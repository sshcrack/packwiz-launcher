// Re-export functionality from zip.js to enable lazy loading
import { BlobReader, ZipReader, BlobWriter } from "@zip.js/zip.js";

export { BlobReader, ZipReader, BlobWriter };

/**
 * Extracts the first entry from a zip file blob
 * @param zipBlob The zip file as a Blob
 * @returns Promise with the extracted entry as ArrayBuffer
 */
export async function extractFirstEntryAsArrayBuffer(zipBlob: Blob): Promise<ArrayBuffer> {
  const zipFileReader = new BlobReader(zipBlob);
  const zipReader = new ZipReader(zipFileReader);
  
  try {
    const entries = await zipReader.getEntries();
    const firstEntry = entries.shift();

    if (!firstEntry || !firstEntry.getData) {
      throw new Error("No entries found in the zip file or invalid data");
    }

    const stream = new TransformStream();
    const streamPromise = new Response(stream.readable).arrayBuffer();

    await firstEntry.getData(stream.writable);
    return await streamPromise;
  } finally {
    await zipReader.close();
  }
}

/**
 * Extract a specific file from a zip by filename
 * @param zipBlob The zip file as a Blob
 * @param filename The name of the file to extract
 * @returns Promise with the extracted file as Blob
 */
export async function extractFileFromZip(zipBlob: Blob, filename: string): Promise<Blob | null> {
  const zipFileReader = new BlobReader(zipBlob);
  const zipReader = new ZipReader(zipFileReader);
  
  try {
    const entries = await zipReader.getEntries();
    const targetEntry = entries.find(entry => entry.filename === filename);

    if (!targetEntry || !targetEntry.getData) {
      return null;
    }

    const writer = new BlobWriter();
    return await targetEntry.getData(writer);
  } finally {
    await zipReader.close();
  }
}
