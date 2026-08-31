import { ScanInput } from "@/types/scan";

/**
 * Normalises an image file or blob:
 * - Automatically corrects EXIF orientation via createImageBitmap({ imageOrientation: "from-image" })
 * - Downscales to maxEdge (default 1024px) to preserve mobile memory
 * - Validates aspect ratio to prevent extreme panoramas
 * - Generates an object URL and clean ImageBitmap
 */
export async function normaliseImage(
  file: File | Blob,
  sourceName = "street-photo.jpg",
  maxEdge = 1024
): Promise<ScanInput> {
  // Validate file size
  if (file.size === 0) {
    throw new Error("File is empty (0 bytes). Please upload a valid image.");
  }

  // Create temporary ImageBitmap with EXIF orientation correction
  let initialBitmap: ImageBitmap;
  try {
    initialBitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.toLowerCase().includes("heic") || (file.type && file.type.includes("heic"))) {
      throw new Error(
        "HEIC format is not supported by your browser. Please upload a JPG or PNG."
      );
    }
    throw new Error("Could not decode image. Please ensure it is a valid JPG, PNG, or WebP.");
  }

  const { width: origW, height: origH } = initialBitmap;

  // Aspect ratio check: prevent extreme panoramas (> 3:1)
  const aspect = Math.max(origW / origH, origH / origW);
  if (aspect > 3.2) {
    initialBitmap.close();
    throw new Error(
      "Image aspect ratio is too extreme (> 3:1). Please shoot a standard photo down the street."
    );
  }

  // Calculate target dimensions
  let targetW = origW;
  let targetH = origH;
  if (origW > maxEdge || origH > maxEdge) {
    if (origW >= origH) {
      targetW = maxEdge;
      targetH = Math.round((origH / origW) * maxEdge);
    } else {
      targetH = maxEdge;
      targetW = Math.round((origW / origH) * maxEdge);
    }
  }

  // Draw to canvas for normalisation and compression
  let blob: Blob;
  if (typeof OffscreenCanvas !== "undefined") {
    const canvas = new OffscreenCanvas(targetW, targetH);
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      initialBitmap.close();
      throw new Error("Failed to get 2D context from OffscreenCanvas.");
    }
    ctx.drawImage(initialBitmap, 0, 0, targetW, targetH);
    blob = await canvas.convertToBlob({ type: "image/jpeg", quality: 0.9 });
  } else {
    // Safari < 16.4 fallback
    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      initialBitmap.close();
      throw new Error("Failed to get 2D context from canvas.");
    }
    ctx.drawImage(initialBitmap, 0, 0, targetW, targetH);
    blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Canvas conversion to blob failed"))),
        "image/jpeg",
        0.9
      );
    });
  }

  // Release initial memory
  initialBitmap.close();

  // Create final normalized bitmap from resized blob
  const normalisedBitmap = await createImageBitmap(blob);
  const previewUrl = URL.createObjectURL(blob);

  return {
    bitmap: normalisedBitmap,
    previewUrl,
    width: targetW,
    height: targetH,
    sourceName,
    blob,
  };
}
