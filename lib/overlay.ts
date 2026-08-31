import {
  INDEX_TO_CLASS,
  SEG_ALPHA,
  SEG_COLOR,
  CBClass,
} from "./classes";

/**
 * Renders an RGBA ImageData overlay representing the segmented classes.
 * Can take an optional overrideMap (for live simulator modifications)
 * and an optional set of hiddenClasses for isolated layer inspection.
 */
export function renderOverlay(
  labelMap: Uint8Array,
  width: number,
  height: number,
  overrideMap?: Uint8Array | null,
  hiddenClasses?: Set<CBClass>
): ImageData {
  const totalPixels = width * height;
  const imageData = new ImageData(width, height);
  const data = imageData.data; // Uint8ClampedArray: R, G, B, A

  const sourceMap = overrideMap || labelMap;

  // Precompute RGB and Alpha tables for faster lookup
  const rTable = new Uint8Array(9);
  const gTable = new Uint8Array(9);
  const bTable = new Uint8Array(9);
  const aTable = new Uint8Array(9);

  for (let i = 0; i < INDEX_TO_CLASS.length; i++) {
    const cls = INDEX_TO_CLASS[i] as CBClass;
    const rgb = SEG_COLOR[cls] || [120, 120, 120];
    const alpha = SEG_ALPHA[cls] !== undefined ? SEG_ALPHA[cls] : 0.4;
    const isHidden = hiddenClasses ? hiddenClasses.has(cls) : false;

    rTable[i] = rgb[0];
    gTable[i] = rgb[1];
    bTable[i] = rgb[2];
    aTable[i] = isHidden ? 0 : Math.round(alpha * 255);
  }

  for (let i = 0; i < totalPixels; i++) {
    const classIdx = sourceMap[i];
    const pixelOffset = i * 4;

    // Unknown is subtle or transparent
    if (classIdx >= 8) {
      data[pixelOffset] = 0;
      data[pixelOffset + 1] = 0;
      data[pixelOffset + 2] = 0;
      data[pixelOffset + 3] = 0;
    } else {
      data[pixelOffset] = rTable[classIdx];
      data[pixelOffset + 1] = gTable[classIdx];
      data[pixelOffset + 2] = bTable[classIdx];
      data[pixelOffset + 3] = aTable[classIdx];
    }
  }

  return imageData;
}
