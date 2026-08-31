import { Metrics } from "@/types/metrics";

export type Prescription = {
  headline: string;
  steps: string[];
  species: string[];
  costEstimate: string;
  projectedGrade: string;
  caveat: string;
  source: "claude" | "template";
};

/**
 * Deterministic template cooling prescription.
 * Always reliable, works offline and when Anthropic API key is absent.
 */
export function fallbackPrescription(metrics: Metrics, city?: string): Prescription {
  const { grade, upliftC, treesNeeded, canopyGapPp, ground } = metrics;
  const pavedPct = Math.round((ground.PAVED || 0) * 100);
  const builtPct = Math.round((ground.BUILT || 0) * 100);

  if (grade === "A" || grade === "B") {
    return {
      headline: `Canopy Sanctuary: Street Exhibits Low Thermal Vulnerability (+${upliftC.toFixed(1)}°C)`,
      steps: [
        "Protect and monitor mature tree root zones during roadway maintenance.",
        "Install permeable paving beneath tree drip lines to maximize stormwater infiltration.",
        "Maintain periodic arboricultural pruning to ensure healthy overhead canopy arches.",
      ],
      species: [
        "London Planetree (Platanus acerifolia)",
        "Red Oak (Quercus rubra)",
        "Littleleaf Linden (Tilia cordata)",
      ],
      costEstimate: "$500 – $1,200 / year (Canopy Maintenance)",
      projectedGrade: grade,
      caveat: "Maintain existing crown volume to preserve cooling performance through peak summer afternoons.",
      source: "template",
    };
  }

  const costMin = Math.max(1200, treesNeeded * 400);
  const costMax = Math.max(2500, treesNeeded * 750);
  const formattedCost = `$${costMin.toLocaleString()} – $${costMax.toLocaleString()} (est. planting & 2-year establishment)`;

  const steps: string[] = [
    `Plant ~${treesNeeded} large-canopy street trees along exposed sidewalk margins to add +${canopyGapPp.toFixed(1)}% canopy shade.`,
  ];

  if (pavedPct > 45) {
    steps.push(
      `Depave redundant asphalt margins or apply high-albedo (>0.40) cool pavement coatings on ${pavedPct}% paved surface.`
    );
  }

  if (builtPct > 30) {
    steps.push(
      "Encourage building owners to install reflective cool roofing or vertical green trellis screens."
    );
  } else {
    steps.push(
      "Construct bioswales with deep root wells to sustain young tree saplings through high-heat drought intervals."
    );
  }

  const speciesList = [
    "Swamp White Oak (Quercus bicolor) — broad shade, flood & drought tolerant",
    "London Planetree (Platanus acerifolia) — vigorous urban particulate & heat resilience",
    "Ginkgo Biloba (male cultivar) — high albedo foliage, dense summer cooling",
    "Thornless Honeylocust (Gleditsia triacanthos) — filtered canopy, rapid growth",
  ];

  return {
    headline: `Urgent Cooling Action: Reduce +${upliftC.toFixed(1)}°C Heat Uplift to Grade B`,
    steps,
    species: speciesList,
    costEstimate: formattedCost,
    projectedGrade: "B",
    caveat: `Based on ~1500m² street corridor reference model. Canopy targets assume ~50m² mature crown per installed tree.`,
    source: "template",
  };
}
