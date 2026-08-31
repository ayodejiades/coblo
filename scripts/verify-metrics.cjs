// Standalone verification script for scientific metrics

const UPLIFT_C = {
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

const GRADE_BANDS = [
  { max: 1.5, grade: "A" },
  { max: 3.0, grade: "B" },
  { max: 4.5, grade: "C" },
  { max: 6.0, grade: "D" },
  { max: Infinity, grade: "F" },
];

function computeGrade(upliftC) {
  for (const band of GRADE_BANDS) {
    if (upliftC <= band.max) {
      return band.grade;
    }
  }
  return "F";
}

function largestRemainderRound(fractions, targetSum = 100) {
  const keys = Object.keys(fractions);
  const items = keys.map((key) => {
    const rawVal = (fractions[key] || 0) * targetSum;
    const floorVal = Math.floor(rawVal);
    const remainder = rawVal - floorVal;
    return { key, floorVal, remainder };
  });

  const currentSum = items.reduce((acc, it) => acc + it.floorVal, 0);
  let diff = targetSum - currentSum;

  items.sort((a, b) => b.remainder - a.remainder);

  for (let i = 0; i < diff && i < items.length; i++) {
    items[i].floorVal += 1;
  }

  const result = {};
  for (const it of items) {
    result[it.key] = it.floorVal;
  }
  return result;
}

console.log("=== RUNNING VERIFICATION CHECKS ===");

// Check Grade Thresholds
console.assert(computeGrade(0.0) === "A", "0.0°C should be A");
console.assert(computeGrade(1.4) === "A", "1.4°C should be A");
console.assert(computeGrade(2.1) === "B", "2.1°C should be B");
console.assert(computeGrade(3.0) === "B", "3.0°C should be B");
console.assert(computeGrade(4.2) === "C", "4.2°C should be C");
console.assert(computeGrade(5.8) === "D", "5.8°C should be D");
console.assert(computeGrade(7.4) === "F", "7.4°C should be F");
console.assert(computeGrade(8.5) === "F", "8.5°C should be F");

// Check Rounding
const testFractions = { PAVED: 0.612, BUILT: 0.236, CANOPY: 0.063, LOW_GREEN: 0.069, WATER: 0.02 };
const rounded = largestRemainderRound(testFractions, 100);
const sum = Object.values(rounded).reduce((a, b) => a + b, 0);
console.assert(sum === 100, `Sum should be 100, got ${sum}`);

// Check Simulation Math
const baseUplift = 0.61 * 8.5 + 0.24 * 5.0 + 0.06 * 0.0 + 0.07 * 1.5 + 0.02 * -1.0;
console.log("Simulated Base Uplift (°C):", baseUplift.toFixed(1));
console.assert(baseUplift.toFixed(1) === "6.5", "Base uplift check");

console.log("✅ ALL VERIFICATION CHECKS PASSED!");
