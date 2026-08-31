import { RawMask } from "@/types/seg";
import {
  CBClass,
  CLASS_INDEX_MAP,
  PRIORITY,
  mapAdeToCb,
  isIndoorLabel,
} from "./classes";

export interface LabelMapResult {
  labelMap: Uint8Array;
  indoorFraction: number;
}

/**
 * Collapses multiple raw class masks into a single 1D Uint8Array label map.
 * Dimension: targetW * targetH.
 * Value at each pixel: uint8 class index from CLASS_INDEX_MAP.
 * Handles nearest-neighbor resampling if mask dimensions differ from target dimensions.
 * Also calculates indoorFraction to reject non-outdoor scenes.
 */
export function buildLabelMap(
  masks: RawMask[],
  targetW: number,
  targetH: number
): Uint8Array {
  return buildLabelMapWithMeta(masks, targetW, targetH).labelMap;
}

export function buildLabelMapWithMeta(
  masks: RawMask[],
  targetW: number,
  targetH: number
): LabelMapResult {
  const totalPixels = targetW * targetH;
  const unknownIdx = CLASS_INDEX_MAP.UNKNOWN;
  const labelMap = new Uint8Array(totalPixels);
  labelMap.fill(unknownIdx);

  let indoorPixelCount = 0;

  // Group and sort masks according to priority ascending
  // Lower priority drawn first, higher priority overwrites later
  const mappedMasks = masks.map((m) => {
    const cbClass: CBClass = mapAdeToCb(m.label);
    const priorityIdx = PRIORITY.indexOf(cbClass);
    const isIndoor = isIndoorLabel(m.label);

    return {
      mask: m,
      cbClass,
      classIdx: CLASS_INDEX_MAP[cbClass],
      priorityIdx: priorityIdx >= 0 ? priorityIdx : 0,
      isIndoor,
    };
  });

  // Calculate approximate indoor pixels
  for (const item of mappedMasks) {
    if (item.isIndoor) {
      const maskData = item.mask.data;
      let count = 0;
      for (let i = 0; i < maskData.length; i++) {
        if (maskData[i] > 127) count++;
      }
      const scale = (targetW * targetH) / (item.mask.width * item.mask.height);
      indoorPixelCount += Math.round(count * scale);
    }
  }

  mappedMasks.sort((a, b) => a.priorityIdx - b.priorityIdx);

  for (const item of mappedMasks) {
    const { mask, classIdx } = item;
    const maskW = mask.width;
    const maskH = mask.height;
    const maskData = mask.data;

    // Fast path: dimensions match exactly
    if (maskW === targetW && maskH === targetH) {
      for (let i = 0; i < totalPixels; i++) {
        if (maskData[i] > 127) {
          labelMap[i] = classIdx;
        }
      }
    } else {
      // Nearest-neighbor resampling
      const scaleX = maskW / targetW;
      const scaleY = maskH / targetH;

      for (let y = 0; y < targetH; y++) {
        const srcY = Math.min(maskH - 1, Math.floor(y * scaleY));
        const srcRowOffset = srcY * maskW;
        const dstRowOffset = y * targetW;

        for (let x = 0; x < targetW; x++) {
          const srcX = Math.min(maskW - 1, Math.floor(x * scaleX));
          const srcIdx = srcRowOffset + srcX;

          if (maskData[srcIdx] > 127) {
            labelMap[dstRowOffset + x] = classIdx;
          }
        }
      }
    }
  }

  const indoorFraction = totalPixels > 0 ? Math.min(1, indoorPixelCount / totalPixels) : 0;

  return {
    labelMap,
    indoorFraction: Math.round(indoorFraction * 1000) / 1000,
  };
}
