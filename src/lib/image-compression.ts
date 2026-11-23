import imageCompression from 'browser-image-compression';

export interface CompressionResult {
  file: File;
  originalSizeKB: number;
  compressedSizeKB: number;
  reductionPercentage: number;
}

/**
 * Compresses an image file in the browser before uploading to Supabase Storage.
 * Keeps image sizes typically under 300KB - 400KB while preserving crisp editorial clarity.
 */
export async function compressProductImage(file: File): Promise<CompressionResult> {
  const originalSizeKB = Math.round(file.size / 1024);

  // If the file is already tiny (e.g. < 250KB), return as is
  if (originalSizeKB <= 250) {
    return {
      file,
      originalSizeKB,
      compressedSizeKB: originalSizeKB,
      reductionPercentage: 0,
    };
  }

  const options = {
    maxSizeMB: 0.35, // Target max ~350KB to preserve 1GB storage tier
    maxWidthOrHeight: 1600, // Sufficient for high-DPI smartphone & retina screens
    useWebWorker: true,
    fileType: 'image/webp',
    initialQuality: 0.85,
  };

  try {
    const compressedBlob = await imageCompression(file, options);
    const compressedFile = new File([compressedBlob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
      type: "image/webp",
      lastModified: Date.now(),
    });

    const compressedSizeKB = Math.round(compressedFile.size / 1024);
    const reductionPercentage = Math.round(((originalSizeKB - compressedSizeKB) / originalSizeKB) * 100);

    return {
      file: compressedFile,
      originalSizeKB,
      compressedSizeKB,
      reductionPercentage: Math.max(0, reductionPercentage),
    };
  } catch (error) {
    console.warn("Image compression fallback, proceeding with original file:", error);
    return {
      file,
      originalSizeKB,
      compressedSizeKB: originalSizeKB,
      reductionPercentage: 0,
    };
  }
}

