import { CBClass, CB_CLASSES, CLASS_INDEX_MAP, INDEX_TO_CLASS } from "./classes";
import { Metrics } from "@/types/metrics";
import { GradeType } from "@/components/ui/GradeStamp";

/**
 * Afternoon surface-temperature uplift, °C, relative to a fully tree-shaded
 * reference block. Anchored on published urban heat literature:
 *  - US EPA, "Reducing Urban Heat Islands: Compendium of Strategies" (shaded vs peak pavement: 11–25 °C cooler)
 *  - Ziter et al., PNAS 2019 (canopy non-linear cooling above 40% cover)
 *  - Akbari et al. (albedo and evapotranspiration models)
 * Labelled explicitly as an ESTIMATE of radiant surface heat uplift.
 */
export const UPLIFT_C: Record<CBClass, number> = {
  PAVED: 8.5,
  BUILT: 5.0,
  BARE: 4.0,
  LOW_GREEN: 1.5,
  CANOPY: 0.0,
  WATER: -1.0,
  SKY: 0.0,
  TRANSIENT: 0.0,
  UNKNOWN: 0.0,
};

export const GRADE_BANDS = [
  { max: 1.5, grade: "A" as const },
  { max: 3.0, grade: "B" as const },
  { max: 4.5, grade: "C" as const },
  { max: 6.0, grade: "D" as const },
  { max: Infinity, grade: "F" as const },
] as const;

// 1 tree crown (approx 50 m²) on a ~1500 m² street view corridor ≈ 3.33 percentage points of canopy
export const PP_PER_TREE = 3.33;

// USFS & EPA Urban Forest benchmark coefficients per mature street tree
export const CO2_KG_PER_TREE_YEAR = 22.5;
export const STORMWATER_L_PER_TREE_YEAR = 3800;

/**
 * Computes largest-remainder rounded percentages that sum to exactly 100.
 */
export function largestRemainderRound(
  fractions: Record<string, number>,
  targetSum = 100
): Record<string, number> {
  const keys = Object.keys(fractions);
  const items = keys.map((key) => {
    const rawVal = (fractions[key] || 0) * targetSum;
    const floorVal = Math.floor(rawVal);
    const remainder = rawVal - floorVal;
    return { key, floorVal, remainder };
  });

  const currentSum = items.reduce((acc, it) => acc + it.floorVal, 0);
  let diff = targetSum - currentSum;

  // Sort by remainder descending
  items.sort((a, b) => b.remainder - a.remainder);

  for (let i = 0; i < diff && i < items.length; i++) {
    items[i].floorVal += 1;
  }

  const result: Record<string, number> = {};
  for (const it of items) {
    result[it.key] = it.floorVal;
  }
  return result;
}

export function computeGrade(upliftC: number): GradeType {
  for (const band of GRADE_BANDS) {
    if (upliftC <= band.max) {
      return band.grade;
    }
  }
  return "F";
}

export type StreetValidationResult =
  | { isValid: true }
  | { isValid: false; reason: string; detail: string };

/**
 * Validates that an audited image is a genuine outdoor street/sidewalk scene.
 * Rejects indoor objects, abstract graphics, screenshots, or pure sky images.
 */
export function validateStreetMetrics(
  metrics: Metrics,
  detectedIndoorFraction = 0
): StreetValidationResult {
  const { rawFractions, totalGroundPixels, totalPixels, skyFraction, transientFraction, unknownFraction } = metrics;

  // 1. Explicit Indoor Scene
  if (detectedIndoorFraction > 0.18) {
    return {
      isValid: false,
      reason: "INDOOR SCENE REJECTED",
      detail:
        "Coblo is engineered exclusively for outdoor street, sidewalk, and parking heat audits. Interior rooms, household furniture, or office spaces cannot be graded.",
    };
  }

  // 2. High Unknown / Non-Environmental Content (e.g. document, screenshot, abstract image)
  if (unknownFraction > 0.40) {
    return {
      isValid: false,
      reason: "NON-STREET IMAGE REJECTED",
      detail:
        "The uploaded image contains too many unmapped or abstract elements. Please capture a clear outdoor photo looking down a sidewalk or street corridor.",
    };
  }

  // 3. Insufficient ground / street surface (< 10% ground in frame)
  const streetFeaturesFraction =
    (rawFractions.PAVED || 0) +
    (rawFractions.BUILT || 0) +
    (rawFractions.CANOPY || 0) +
    (rawFractions.LOW_GREEN || 0) +
    (rawFractions.BARE || 0);

  if (streetFeaturesFraction < 0.10 && totalGroundPixels < totalPixels * 0.08) {
    return {
      isValid: false,
      reason: "NO STREET GROUND DETECTED",
      detail:
        "No outdoor street features (pavement, buildings, or tree canopy) were detected. Please angle the camera down the sidewalk to capture the ground and streetscape.",
    };
  }

  // 4. Dominated entirely by sky (> 85% sky with < 8% ground)
  if (skyFraction > 0.85 && streetFeaturesFraction < 0.08) {
    return {
      isValid: false,
      reason: "EXCESSIVE SKY ANGLE",
      detail:
        "The photo is almost entirely sky with insufficient ground corridor. Please lower your camera angle to frame both the sidewalk and the street.",
    };
  }

  // 5. Extreme Foreground Occlusion (> 80% transient vehicle/person with almost no ground)
  if (transientFraction > 0.80 && (rawFractions.PAVED || 0) < 0.04) {
    return {
      isValid: false,
      reason: "CLOSE-UP OCCLUSION REJECTED",
      detail:
        "The camera view is blocked by a close-up vehicle or foreground object. Please step back to capture the broader street corridor.",
    };
  }

  return { isValid: true };
}

/**
 * Evaluates semantic metrics from the raw label map.
 */
export function computeMetrics(
  labelMap: Uint8Array,
  width: number,
  height: number
): Metrics {
  const totalPixels = width * height;
  const counts = new Uint32Array(INDEX_TO_CLASS.length);

  // Single pass histogram
  for (let i = 0; i < totalPixels; i++) {
    const classIdx = labelMap[i];
    if (classIdx < counts.length) {
      counts[classIdx]++;
    }
  }

  const rawFractions = {} as Record<CBClass, number>;
  for (let i = 0; i < INDEX_TO_CLASS.length; i++) {
    const cls = INDEX_TO_CLASS[i];
    rawFractions[cls] = totalPixels > 0 ? counts[i] / totalPixels : 0;
  }

  // Green View Index: (CANOPY + LOW_GREEN) over ALL pixels (Treepedia metric)
  const gvi = (counts[CLASS_INDEX_MAP.CANOPY] + counts[CLASS_INDEX_MAP.LOW_GREEN]) / (totalPixels || 1);

  // Ground pixels: exclude SKY, TRANSIENT, and UNKNOWN
  const nonGroundPixels =
    counts[CLASS_INDEX_MAP.SKY] +
    counts[CLASS_INDEX_MAP.TRANSIENT] +
    counts[CLASS_INDEX_MAP.UNKNOWN];

  const totalGroundPixels = Math.max(0, totalPixels - nonGroundPixels);

  const ground = {} as Record<CBClass, number>;
  for (const cls of CB_CLASSES) {
    ground[cls] = 0;
  }

  if (totalGroundPixels > 0) {
    for (let i = 0; i < INDEX_TO_CLASS.length; i++) {
      const cls = INDEX_TO_CLASS[i];
      if (cls !== "SKY" && cls !== "TRANSIENT" && cls !== "UNKNOWN") {
        ground[cls] = counts[i] / totalGroundPixels;
      }
    }
  }

  // Calculate estimated surface heat uplift
  let rawUplift = 0;
  if (totalGroundPixels > 0) {
    for (const cls of CB_CLASSES) {
      if (cls !== "SKY" && cls !== "TRANSIENT" && cls !== "UNKNOWN") {
        rawUplift += ground[cls] * UPLIFT_C[cls];
      }
    }
  } else {
    rawUplift = 0;
  }

  const upliftC = Math.max(0, Math.round(rawUplift * 10) / 10);
  const grade = computeGrade(upliftC);

  // Calculate canopy gap to reach Grade B (uplift <= 3.0°C)
  // Converting PAVED to CANOPY reduces uplift by (UPLIFT_C.PAVED - UPLIFT_C.CANOPY) = 8.5°C per unit fraction
  let canopyGapPp = 0;
  if (upliftC > 3.0) {
    const excessUplift = upliftC - 3.0;
    const coolingDeltaPerFraction = UPLIFT_C.PAVED - UPLIFT_C.CANOPY; // 8.5
    const neededFraction = excessUplift / coolingDeltaPerFraction;
    const maxAvailable = ground.PAVED || 0;
    const clampedFraction = Math.min(neededFraction, maxAvailable);
    canopyGapPp = Math.round(clampedFraction * 100 * 10) / 10;
  }

  const treesNeeded = canopyGapPp > 0 ? Math.ceil(canopyGapPp / PP_PER_TREE) : 0;

  // Ecological multi-benefits:
  const canopyPp = (ground.CANOPY || 0) * 100;
  const existingTreesEq = canopyPp / PP_PER_TREE;
  const carbonKgYear = Math.round(existingTreesEq * CO2_KG_PER_TREE_YEAR * 10) / 10;
  const stormwaterLitersYear = Math.round(existingTreesEq * STORMWATER_L_PER_TREE_YEAR);

  // Confidence check
  const skyFraction = rawFractions.SKY;
  const transientFraction = rawFractions.TRANSIENT;
  const unknownFraction = rawFractions.UNKNOWN;
  const groundFractionOfFrame = totalPixels > 0 ? totalGroundPixels / totalPixels : 0;

  const isLowConfidence =
    unknownFraction > 0.18 || groundFractionOfFrame < 0.20 || totalGroundPixels === 0;

  // Ground display percentages
  const groundForDisplay: Record<string, number> = {};
  for (const cls of CB_CLASSES) {
    if (cls !== "SKY" && cls !== "TRANSIENT" && cls !== "UNKNOWN" && ground[cls] > 0) {
      groundForDisplay[cls] = ground[cls];
    }
  }
  const groundPercentages = totalGroundPixels > 0 ? largestRemainderRound(groundForDisplay, 100) : {};

  return {
    rawFractions,
    ground,
    groundPercentages,
    gvi: Math.round(gvi * 1000) / 1000,
    skyFraction: Math.round(skyFraction * 1000) / 1000,
    transientFraction: Math.round(transientFraction * 1000) / 1000,
    unknownFraction: Math.round(unknownFraction * 1000) / 1000,
    upliftC,
    grade,
    treesNeeded,
    canopyGapPp,
    carbonKgYear,
    stormwaterLitersYear,
    confidence: isLowConfidence ? "low" : "high",
    totalGroundPixels,
    totalPixels,
  };
}

/**
 * Pure simulation function: recomputes metrics when addedPp of ground is converted from PAVED to CANOPY.
 */
export function simulateCanopy(baseMetrics: Metrics, addedPp: number): Metrics {
  if (addedPp <= 0 || baseMetrics.totalGroundPixels === 0) {
    return baseMetrics;
  }

  const addedFraction = addedPp / 100;
  const maxConvertible = baseMetrics.ground.PAVED || 0;
  const actualAdded = Math.min(addedFraction, maxConvertible);

  const simulatedGround = Object.assign({}, baseMetrics.ground) as Record<CBClass, number>;
  simulatedGround.PAVED = Math.max(0, (baseMetrics.ground.PAVED || 0) - actualAdded);
  simulatedGround.CANOPY = (baseMetrics.ground.CANOPY || 0) + actualAdded;

  let simulatedUplift = 0;
  for (const cls of CB_CLASSES) {
    if (cls !== "SKY" && cls !== "TRANSIENT" && cls !== "UNKNOWN") {
      simulatedUplift += simulatedGround[cls] * UPLIFT_C[cls];
    }
  }

  const upliftC = Math.max(0, Math.round(simulatedUplift * 10) / 10);
  const grade = computeGrade(upliftC);

  // Recalculate display percentages
  const groundForDisplay: Record<string, number> = {};
  for (const cls of CB_CLASSES) {
    if (cls !== "SKY" && cls !== "TRANSIENT" && cls !== "UNKNOWN" && simulatedGround[cls] > 0) {
      groundForDisplay[cls] = simulatedGround[cls];
    }
  }
  const groundPercentages = largestRemainderRound(groundForDisplay, 100);

  // Recalculate GVI (frame-wide)
  const groundPixelRatio = baseMetrics.totalGroundPixels / (baseMetrics.totalPixels || 1);
  const simulatedGvi = Math.min(
    1,
    baseMetrics.gvi + actualAdded * groundPixelRatio
  );

  // Recalculate ecological multi-benefits
  const simulatedCanopyPp = (simulatedGround.CANOPY || 0) * 100;
  const simulatedTreesEq = simulatedCanopyPp / PP_PER_TREE;
  const carbonKgYear = Math.round(simulatedTreesEq * CO2_KG_PER_TREE_YEAR * 10) / 10;
  const stormwaterLitersYear = Math.round(simulatedTreesEq * STORMWATER_L_PER_TREE_YEAR);

  return {
    ...baseMetrics,
    ground: simulatedGround,
    groundPercentages,
    upliftC,
    grade,
    gvi: Math.round(simulatedGvi * 1000) / 1000,
    carbonKgYear,
    stormwaterLitersYear,
  };
}
