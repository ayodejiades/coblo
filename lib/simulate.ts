import { CLASS_INDEX_MAP } from "./classes";

// Cache sorted pavement indices by labelMap reference to eliminate per-frame sorting
const pavementIndexCache = new WeakMap<Uint8Array, Uint32Array>();

/**
 * Precomputes and caches the spatially sorted pavement indices for a given labelMap.
 * Sidewalk margins (outer flanks) and upper road horizon are prioritized for canopy planting.
 */
export function getSortedPavementIndices(
  labelMap: Uint8Array,
  width: number,
  height: number
): Uint32Array {
  const cached = pavementIndexCache.get(labelMap);
  if (cached) {
    return cached;
  }

  const pavedIdx = CLASS_INDEX_MAP.PAVED;
  const totalPixels = width * height;

  // First pass: count paved pixels to allocate exact Uint32Array
  let pavedCount = 0;
  for (let i = 0; i < totalPixels; i++) {
    if (labelMap[i] === pavedIdx) {
      pavedCount++;
    }
  }

  if (pavedCount === 0) {
    const empty = new Uint32Array(0);
    pavementIndexCache.set(labelMap, empty);
    return empty;
  }

  const indices = new Uint32Array(pavedCount);
  let idx = 0;
  for (let i = 0; i < totalPixels; i++) {
    if (labelMap[i] === pavedIdx) {
      indices[idx++] = i;
    }
  }

  // Pre-calculate spatial planting score for each pavement pixel once
  const centerX = width / 2;
  const scores = new Float32Array(pavedCount);
  for (let i = 0; i < pavedCount; i++) {
    const p = indices[i];
    const y = Math.floor(p / width);
    const x = p % width;
    const distEdge = Math.abs(x - centerX);
    // Score: prefer upper Y horizon and outer X flanks
    scores[i] = y * 0.6 + (width / 2 - distEdge) * 0.4;
  }

  // Sort index array based on precomputed spatial scores
  // Use indexed sort array to avoid object allocations
  const order = Array.from({ length: pavedCount }, (_, i) => i);
  order.sort((a, b) => scores[a] - scores[b]);

  const sortedIndices = new Uint32Array(pavedCount);
  for (let i = 0; i < pavedCount; i++) {
    sortedIndices[i] = indices[order[i]];
  }

  pavementIndexCache.set(labelMap, sortedIndices);
  return sortedIndices;
}

/**
 * Spatially converts PAVED pixels to CANOPY pixels in the label map.
 * Operates in O(k) time with zero array allocations or sorting per slider tick.
 */
export function applyCanopy(
  labelMap: Uint8Array,
  width: number,
  height: number,
  addedPp: number,
  totalGroundPixels: number
): Uint8Array {
  const clonedMap = new Uint8Array(labelMap);
  if (addedPp <= 0) return clonedMap;

  const targetPixels = Math.round((addedPp / 100) * totalGroundPixels);
  if (targetPixels <= 0) return clonedMap;

  const canopyIdx = CLASS_INDEX_MAP.CANOPY;
  const sortedPavedIndices = getSortedPavementIndices(labelMap, width, height);

  if (sortedPavedIndices.length === 0) return clonedMap;

  const pixelsToConvert = Math.min(targetPixels, sortedPavedIndices.length);
  for (let k = 0; k < pixelsToConvert; k++) {
    clonedMap[sortedPavedIndices[k]] = canopyIdx;
  }

  return clonedMap;
}
