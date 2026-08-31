import { CBClass } from "@/lib/classes";
import { GradeType } from "@/components/ui/GradeStamp";

export type CompositionFractions = Record<CBClass, number>;

export type Metrics = {
  rawFractions: Record<CBClass, number>; // over all pixels in image
  ground: Record<CBClass, number>; // over ground pixels only (excluding sky, transient, unknown)
  groundPercentages: Record<string, number>; // integer/1dp display percentages summing to 100%
  gvi: number; // 0 to 1, Green View Index (all pixels)
  skyFraction: number;
  transientFraction: number;
  unknownFraction: number;
  upliftC: number; // °C estimated surface heat uplift above fully shaded reference
  grade: GradeType;
  treesNeeded: number; // trees required to reach Grade B (uplift ≤ 3.0°C)
  canopyGapPp: number; // percentage points of canopy needed
  carbonKgYear: number; // estimated annual carbon sequestration in kg CO2e
  stormwaterLitersYear: number; // estimated annual stormwater runoff intercepted in liters
  confidence: "high" | "low";
  totalGroundPixels: number;
  totalPixels: number;
};
