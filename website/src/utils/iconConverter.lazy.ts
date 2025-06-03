// Utility for lazy loading and using img-to-ico module

let initialized = false;
let initializing = false;

// This is a promisified version of the initialization
export async function initIconConverter(): Promise<void> {
    if (initialized) {
        return;
    }

    if (initializing) {
        // If already initializing, wait for it to complete
        while (initializing) {
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        return;
    }

    initializing = true;
    try {
        // Dynamically import the img-to-ico module
        const { default: init } = await import('img-to-ico');
        await init();
        initialized = true;
    } finally {
        initializing = false;
    }
}

// Convert image data to ICO format
export async function convertToIco(imageData: Uint8Array, mimeType: string): Promise<Uint8Array> {
    await initIconConverter();

    // Import convert_to_ico function only when needed
    const { convert_to_ico } = await import('img-to-ico');
    return convert_to_ico(imageData, mimeType);
}

// Create an ICO file from an image file
export async function createIcoFile(file: File): Promise<File> {
    // Read the file as ArrayBuffer
    const buffer = await file.arrayBuffer();
    // Convert to ICO format
    const icoBuffer = await convertToIco(new Uint8Array(buffer), file.type);
    // Create a Blob and then a File
    const icoBlob = new Blob([icoBuffer], { type: 'image/x-icon' });
    return new File([icoBlob], 'icon.ico', { type: 'image/x-icon' });
}
