import React from "react";
import Link from "next/link";
import { BrutCard } from "@/components/ui/BrutCard";
import { BrutButton } from "@/components/ui/BrutButton";
import { ScientificSandbox } from "@/components/methodology/ScientificSandbox";
import { ArrowLeft, AlertTriangle } from "lucide-react";

export default function MethodologyPage() {
  return (
    <main className="w-full max-w-[1120px] mx-auto px-4 sm:px-8 py-8 sm:py-12 flex flex-col gap-10">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Link href="/">
            <BrutButton variant="ghost" size="sm">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              BACK TO HOME
            </BrutButton>
          </Link>
          <span className="t-label bg-black text-[#CCFF00] px-2 py-0.5 font-bold">
            SCIENTIFIC FOUNDATION
          </span>
        </div>
        <h1 className="t-h1 text-black font-black">METHODOLOGY &amp; LIMITATIONS</h1>
        <p className="font-mono text-sm sm:text-base text-black/80 max-w-3xl leading-relaxed font-medium">
          Coblo translates raw street photography into transparent, reproducible thermal resilience metrics.
          Below is our complete mathematical formulation, coefficient attribution, interactive sensitivity sandbox, and honest disclosure of model bounds.
        </p>
      </div>

      {/* Interactive Scientific Sandbox */}
      <ScientificSandbox />

      {/* Section 1: Semantic Class Mapping */}
      <BrutCard title="1. SEMANTIC CLASS MAPPING (ADE20K → COBLO)" headerAccent="acid" borderHeavy>
        <div className="flex flex-col gap-4 font-mono text-xs sm:text-sm">
          <p className="text-black/80">
            We utilize SegFormer-B0 trained on the 150-class ADE20K semantic segmentation dataset.
            Raw class predictions are aggregated into eight primary urban thermal categories:
          </p>

          <div className="overflow-x-auto border-[2px] border-black">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black text-[#CCFF00] border-b-[2px] border-black">
                  <th className="p-2.5 font-bold">COBLO CLASS</th>
                  <th className="p-2.5 font-bold">ADE20K LABELS</th>
                  <th className="p-2.5 font-bold">THERMAL ROLE</th>
                  <th className="p-2.5 font-bold">OVERLAY COLOR</th>
                </tr>
              </thead>
              <tbody className="divide-y-[2px] divide-black bg-white">
                <tr>
                  <td className="p-2.5 font-black text-black">CANOPY</td>
                  <td className="p-2.5 text-black/80">tree, palm, treehouse</td>
                  <td className="p-2.5">Solar radiation interception &amp; evapotranspiration</td>
                  <td className="p-2.5"><span className="inline-block w-4 h-4 bg-[#00E676] border border-black mr-2 align-middle"></span>#00E676</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-black text-black">LOW_GREEN</td>
                  <td className="p-2.5 text-black/80">grass, plant, flower, field, shrub, bush</td>
                  <td className="p-2.5">Permeable vegetated surface with modest transpiration</td>
                  <td className="p-2.5"><span className="inline-block w-4 h-4 bg-[#CCFF00] border border-black mr-2 align-middle"></span>#CCFF00</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-black text-black">PAVED</td>
                  <td className="p-2.5 text-black/80">road, sidewalk, pavement, path, runway, stairs, curb</td>
                  <td className="p-2.5">Impervious low-albedo thermal mass (primary heat sink)</td>
                  <td className="p-2.5"><span className="inline-block w-4 h-4 bg-[#FF2E93] border border-black mr-2 align-middle"></span>#FF2E93</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-black text-black">BUILT</td>
                  <td className="p-2.5 text-black/80">building, house, skyscraper, wall, fence, bridge, roof</td>
                  <td className="p-2.5">Vertical structural thermal mass and canyon reflection</td>
                  <td className="p-2.5"><span className="inline-block w-4 h-4 bg-[#B14EFF] border border-black mr-2 align-middle"></span>#B14EFF</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-black text-black">BARE</td>
                  <td className="p-2.5 text-black/80">earth, ground, sand, dirt, rock, gravel</td>
                  <td className="p-2.5">Unpaved exposed soil with intermediate thermal capacity</td>
                  <td className="p-2.5"><span className="inline-block w-4 h-4 bg-[#FF6B1A] border border-black mr-2 align-middle"></span>#FF6B1A</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-black text-black">WATER</td>
                  <td className="p-2.5 text-black/80">water, sea, river, lake, pool, fountain</td>
                  <td className="p-2.5">High heat capacity and evaporative cooling</td>
                  <td className="p-2.5"><span className="inline-block w-4 h-4 bg-[#0066FF] border border-black mr-2 align-middle"></span>#0066FF</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-black text-black">SKY</td>
                  <td className="p-2.5 text-black/80">sky</td>
                  <td className="p-2.5">Atmospheric corridor (excluded from ground denominator)</td>
                  <td className="p-2.5"><span className="inline-block w-4 h-4 bg-[#00D4FF] border border-black mr-2 align-middle"></span>#00D4FF</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-black text-black">TRANSIENT</td>
                  <td className="p-2.5 text-black/80">car, bus, truck, person, bicycle, pole, sign, bench</td>
                  <td className="p-2.5">Occluding objects (excluded from ground denominator)</td>
                  <td className="p-2.5"><span className="inline-block w-4 h-4 bg-[#D9D6CC] border border-black mr-2 align-middle"></span>#D9D6CC</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </BrutCard>

      {/* Section 2: Heat Uplift Model & Literature */}
      <BrutCard title="2. ESTIMATED SURFACE HEAT UPLIFT (°C)" headerAccent="hot" borderHeavy>
        <div className="flex flex-col gap-4 font-mono text-xs sm:text-sm">
          <p className="text-black/80">
            Surface heat uplift represents the estimated afternoon radiant surface heating above an
            idealized, fully tree-shaded baseline street. Ground fractions f_i are computed over
            analyzable ground pixels only (excluding sky and transient occlusions):
          </p>

          <div className="bg-black text-[#CCFF00] p-4 border-[2px] border-black text-center text-sm sm:text-base font-black">
            {"ΔT_surface = Σ ( f_i × C_i )"}
          </div>

          <div className="overflow-x-auto border-[2px] border-black mt-2">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FF2E93] text-black border-b-[2px] border-black">
                  <th className="p-2.5 font-bold">CLASS</th>
                  <th className="p-2.5 font-bold">COEFFICIENT (C_i)</th>
                  <th className="p-2.5 font-bold">SCIENTIFIC LITERATURE ANCHOR</th>
                </tr>
              </thead>
              <tbody className="divide-y-[2px] divide-black bg-white">
                <tr>
                  <td className="p-2.5 font-bold">PAVED</td>
                  <td className="p-2.5 font-black text-[#FF2E93]">+8.5 °C</td>
                  <td className="p-2.5">US EPA Compendium: Shaded pavements measure 11–25 °C cooler than unshaded peak asphalt.</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold">BUILT</td>
                  <td className="p-2.5 font-black">+5.0 °C</td>
                  <td className="p-2.5">Akbari et al.: Structural vertical facades absorb and re-radiate longwave radiation.</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold">BARE</td>
                  <td className="p-2.5 font-black">+4.0 °C</td>
                  <td className="p-2.5">Dry unpaved soil exhibits lower thermal inertia than asphalt but high daytime heating.</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold">LOW_GREEN</td>
                  <td className="p-2.5 font-black">+1.5 °C</td>
                  <td className="p-2.5">Turfgrass provides moderate evaporative cooling but lacks vertical overhead shading.</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold">CANOPY</td>
                  <td className="p-2.5 font-black text-[#008f40]">0.0 °C</td>
                  <td className="p-2.5">Ziter et al. (PNAS 2019): Dense tree canopy acts as our primary reference baseline.</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold">WATER</td>
                  <td className="p-2.5 font-black text-[#0066FF]">-1.0 °C</td>
                  <td className="p-2.5">Continuous latent heat absorption from active surface evaporation.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </BrutCard>

      {/* Section 3: Grade Bands & Arithmetic */}
      <BrutCard title="3. GRADE BANDS &amp; CANOPY ARITHMETIC" headerAccent="cyan" borderHeavy>
        <div className="flex flex-col gap-4 font-mono text-xs sm:text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border-[2px] border-black p-3 bg-white">
              <span className="font-black text-black uppercase block mb-2">GRADE SCALE</span>
              <ul className="flex flex-col gap-1.5">
                <li><strong className="text-[#008f40]">GRADE A:</strong> ≤ 1.5°C uplift</li>
                <li><strong className="text-[#008f40]">GRADE B:</strong> ≤ 3.0°C uplift</li>
                <li><strong className="text-[#FF6B1A]">GRADE C:</strong> ≤ 4.5°C uplift</li>
                <li><strong className="text-[#FF6B1A]">GRADE D:</strong> ≤ 6.0°C uplift</li>
                <li><strong className="text-[#FF2E93]">GRADE F:</strong> &gt; 6.0°C uplift</li>
              </ul>
            </div>

            <div className="border-[2px] border-black p-3 bg-white">
              <span className="font-black text-black uppercase block mb-2">TREE CANOPY ARITHMETIC</span>
              <p className="text-black/80 leading-relaxed">
                Standard street view corridor: ~100m long × 15m wide ≈ 1,500 m².
                A mature urban street tree crown covers ≈ 50 m².
                Therefore, <strong>1 installed street tree ≈ 3.33 percentage points</strong> of ground canopy cover.
              </p>
            </div>
          </div>
        </div>
      </BrutCard>

      {/* Section 4: What This Cannot Do (Honest Limitations) */}
      <BrutCard title="4. WHAT THIS CANNOT DO (HONEST LIMITATIONS)" headerAccent="orange" borderHeavy shadow="lg">
        <div className="flex flex-col gap-4 font-mono text-xs sm:text-sm">
          <div className="flex items-start gap-3 bg-[#F5F2E8] p-4 border-[2px] border-black">
            <AlertTriangle className="w-6 h-6 text-[#FF6B1A] shrink-0 mt-0.5" />
            <div className="flex flex-col gap-2">
              <span className="font-black text-black uppercase">TRANSPARENCY STATEMENT</span>
              <p className="text-black/80 leading-relaxed">
                We believe scientific rigor requires clearly defining boundaries. Coblo is an empowerment
                tool for grassroots community advocacy, not a microclimatic CFD simulation engine:
              </p>
            </div>
          </div>

          <ul className="flex flex-col gap-2.5 list-disc pl-5 text-black/80">
            <li>
              <strong>Surface-driven radiant uplift, not ambient air thermometer readings:</strong> We estimate radiant heat load from ground materials. Local air temperature is also influenced by regional wind vectors, humidity, and thermal advection.
            </li>
            <li>
              <strong>Single eye-level perspective:</strong> Treepedia captures 6 panoramic headings per coordinate. Coblo uses a single representative sidewalk vantage point.
            </li>
            <li>
              <strong>Uncalibrated to in-situ sensor telemetry:</strong> Our coefficients reflect published empirical literature rather than real-time IoT ground-truth calibration.
            </li>
            <li>
              <strong>Camera angle sensitivity:</strong> Pitching the camera upward increases the sky fraction, while aiming downward increases the pavement fraction. (Coblo removes sky from the ground denominator to mitigate this effect).
            </li>
          </ul>
        </div>
      </BrutCard>

      {/* Section 5: Prior Art Differentiation */}
      <BrutCard title="5. PRIOR ART &amp; NOVEL CONTRIBUTION" headerAccent="grey" borderHeavy>
        <div className="flex flex-col gap-4 font-mono text-xs sm:text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border-[2px] border-black p-3 bg-white">
              <span className="font-black text-black uppercase block mb-1">MIT TREEPEDIA</span>
              <p className="text-black/70 text-xs">
                City-scale canopy benchmark derived from Google Street View panoramas. Research-grade,
                static, non-interactive, and cannot be operated on demand by residents.
              </p>
            </div>

            <div className="border-[2px] border-black p-3 bg-white">
              <span className="font-black text-black uppercase block mb-1">AMERICAN FORESTS TREE EQUITY</span>
              <p className="text-black/70 text-xs">
                Census-tract-level equity index combining satellite NDVI with socioeconomic demographic data.
                Operates at neighbourhood resolution with no block-scale street imagery.
              </p>
            </div>
          </div>

          <div className="bg-[#CCFF00] p-4 border-[2px] border-black text-black font-bold">
            <strong>Coblo&apos;s Contribution:</strong> The first block-scale, resident-operated, 100% on-device heat audit tool with real-time interactive canopy simulation and exportable advocacy artifacts.
          </div>
        </div>
      </BrutCard>
    </main>
  );
}
