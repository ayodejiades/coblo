import { UPLIFT_C, GRADE_BANDS, computeGrade, largestRemainderRound } from "../lib/metrics.js";
import { CLASS_INDEX_MAP, PRIORITY, mapAdeToCb } from "../lib/classes.js";

console.log("=== COBLO SCIENTIFIC METRICS VERIFICATION ===");

// 1. Check classes and index mappings
console.log("Checking class index mappings...");
if (CLASS_INDEX_MAP.PAVED !== 2 || CLASS_INDEX_MAP.CANOPY !== 0) {
  throw new Error("Class index mapping mismatch");
}

// 2. Check ADE20K mapping
console.log("Checking ADE20K mapping...");
if (mapAdeToCb("road") !== "PAVED" || mapAdeToCb("tree") !== "CANOPY" || mapAdeToCb("building, house") !== "BUILT") {
  throw new Error("ADE label mapping error");
}

// 3. Check Grade Computation
console.log("Checking Grade bands...");
if (computeGrade(0.0) !== "A") throw new Error("0.0°C should be Grade A");
if (computeGrade(1.4) !== "A") throw new Error("1.4°C should be Grade A");
if (computeGrade(2.1) !== "B") throw new Error("2.1°C should be Grade B");
if (computeGrade(3.0) !== "B") throw new Error("3.0°C should be Grade B");
if (computeGrade(4.2) !== "C") throw new Error("4.2°C should be Grade C");
if (computeGrade(5.8) !== "D") throw new Error("5.8°C should be Grade D");
if (computeGrade(7.4) !== "F") throw new Error("7.4°C should be Grade F");
if (computeGrade(8.5) !== "F") throw new Error("8.5°C should be Grade F");

// 4. Check largest remainder rounding
console.log("Checking display percentage rounding...");
const fractions = { PAVED: 0.612, BUILT: 0.236, CANOPY: 0.063, LOW_GREEN: 0.069, WATER: 0.02 };
const rounded = largestRemainderRound(fractions, 100);
const sum = Object.values(rounded).reduce((a, b) => a + b, 0);
if (sum !== 100) {
  throw new Error(`Percentages sum to ${sum}, expected 100`);
}

// 5. Check Thermal Uplift values
console.log("Checking Thermal Coefficients...");
if (UPLIFT_C.PAVED !== 8.5 || UPLIFT_C.CANOPY !== 0.0 || UPLIFT_C.BUILT !== 5.0) {
  throw new Error("Thermal coefficients do not match literature specifications");
}

console.log("✅ ALL SCIENTIFIC METRIC CHECKS PASSED PERFECTLY!");
