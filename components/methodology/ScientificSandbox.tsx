"use client";

import React, { useState } from "react";
import { BrutCard } from "@/components/ui/BrutCard";
import { BrutBadge } from "@/components/ui/BrutBadge";
import { SlidersHorizontal, RefreshCw } from "lucide-react";

export function ScientificSandbox() {
  const [irradiance, setIrradiance] = useState(850); // W/m^2
  const [albedo, setAlbedo] = useState(0.12); // 0.05 to 0.45
  const [pavementPct, setPavementPct] = useState(60);
  const [canopyPct, setCanopyPct] = useState(10);
  const [crownDiameter, setCrownDiameter] = useState(8); // meters

  // Normalize remaining ground into built/low green
  const remainingGround = Math.max(0, 100 - pavementPct - canopyPct);
  const builtPct = Math.round(remainingGround * 0.7);
  const lowGreenPct = remainingGround - builtPct;

  // Crown area & tree count
  const crownRadius = crownDiameter / 2;
  const singleCrownArea = Math.PI * crownRadius * crownRadius; // m^2
  const corridorArea = 1500; // m^2
  const canopyAreaM2 = (canopyPct / 100) * corridorArea;
  const treesCount = singleCrownArea > 0 ? Math.round((canopyAreaM2 / singleCrownArea) * 10) / 10 : 0;

  // Thermal sensitivity model:
  // Albedo modification factor relative to standard weathered asphalt (0.12)
  const albedoFactor = Math.max(0.2, (1 - albedo) / (1 - 0.12));
  const irradianceFactor = irradiance / 850;

  const pavedCoeff = 8.5 * albedoFactor * irradianceFactor;
  const builtCoeff = 5.0 * irradianceFactor;
  const lowGreenCoeff = 1.5;
  const canopyCoeff = 0.0;

  const calculatedUplift =
    (pavementPct / 100) * pavedCoeff +
    (builtPct / 100) * builtCoeff +
    (lowGreenPct / 100) * lowGreenCoeff +
    (canopyPct / 100) * canopyCoeff;

  const roundedUplift = Math.round(calculatedUplift * 10) / 10;

  // Letter Grade
  let grade = "F";
  let gradeColor = "bg-[#FF2E93] text-black";
  if (roundedUplift <= 1.5) {
    grade = "A";
    gradeColor = "bg-[#CCFF00] text-black";
  } else if (roundedUplift <= 3.0) {
    grade = "B";
    gradeColor = "bg-[#00E676] text-black";
  } else if (roundedUplift <= 4.5) {
    grade = "C";
    gradeColor = "bg-[#FF6B1A] text-white";
  } else if (roundedUplift <= 6.0) {
    grade = "D";
    gradeColor = "bg-[#FF6B1A] text-white";
  }

  // Multi-Benefit Ecological calculations
  const carbonKgYear = Math.round(treesCount * 22.5 * 10) / 10;
  const stormwaterLiters = Math.round(treesCount * 3800);
  const coolingKwh = Math.round(treesCount * 145);

  const resetDefaults = () => {
    setIrradiance(850);
    setAlbedo(0.12);
    setPavementPct(60);
    setCanopyPct(10);
    setCrownDiameter(8);
  };

  return (
    <BrutCard title="INTERACTIVE SCIENTIFIC SANDBOX" headerAccent="acid" borderHeavy shadow="xl">
      <div className="flex flex-col gap-6 py-2">
        <div className="flex items-center justify-between gap-3 border-b-[2px] border-black pb-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-black stroke-[2.5]" />
            <span className="font-mono text-xs sm:text-sm font-bold text-black uppercase">
              EXPERIMENT WITH THERMAL &amp; BIOME COEFFICIENTS
            </span>
          </div>
          <button
            type="button"
            onClick={resetDefaults}
            className="flex items-center gap-1 font-mono text-xs font-bold bg-[#F5F2E8] border-[2px] border-black px-2 py-1 hover:bg-black hover:text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            RESET
          </button>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
          {/* Slider 1: Pavement Percentage */}
          <div className="flex flex-col gap-2 bg-[#F5F2E8] p-3 border-[2px] border-black">
            <div className="flex justify-between items-center font-bold">
              <span>PAVED SURFACE COVER:</span>
              <span className="bg-[#FF2E93] text-black px-2 py-0.5 border border-black">{pavementPct}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={pavementPct}
              onChange={(e) => {
                const val = Number(e.target.value);
                setPavementPct(val);
                if (val + canopyPct > 100) {
                  setCanopyPct(100 - val);
                }
              }}
              className="w-full accent-black cursor-pointer h-2 bg-white border border-black"
            />
            <span className="text-[10px] text-black/70">Impervious asphalt, road, and sidewalk fraction</span>
          </div>

          {/* Slider 2: Canopy Percentage */}
          <div className="flex flex-col gap-2 bg-[#F5F2E8] p-3 border-[2px] border-black">
            <div className="flex justify-between items-center font-bold">
              <span>TREE CANOPY COVER:</span>
              <span className="bg-[#00E676] text-black px-2 py-0.5 border border-black">{canopyPct}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="70"
              step="2"
              value={canopyPct}
              onChange={(e) => {
                const val = Number(e.target.value);
                setCanopyPct(val);
                if (val + pavementPct > 100) {
                  setPavementPct(100 - val);
                }
              }}
              className="w-full accent-black cursor-pointer h-2 bg-white border border-black"
            />
            <span className="text-[10px] text-black/70">Overhead mature tree crown projection</span>
          </div>

          {/* Slider 3: Pavement Albedo */}
          <div className="flex flex-col gap-2 bg-[#F5F2E8] p-3 border-[2px] border-black">
            <div className="flex justify-between items-center font-bold">
              <span>PAVEMENT ALBEDO (SOLAR REFLECTANCE):</span>
              <span className="bg-white text-black px-2 py-0.5 border border-black">α = {albedo.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.45"
              step="0.01"
              value={albedo}
              onChange={(e) => setAlbedo(Number(e.target.value))}
              className="w-full accent-black cursor-pointer h-2 bg-white border border-black"
            />
            <span className="text-[10px] text-black/70">0.08 = Fresh Asphalt · 0.15 = Weathered · 0.40 = Cool Pavement Seal</span>
          </div>

          {/* Slider 4: Solar Irradiance */}
          <div className="flex flex-col gap-2 bg-[#F5F2E8] p-3 border-[2px] border-black">
            <div className="flex justify-between items-center font-bold">
              <span>PEAK SOLAR IRRADIANCE:</span>
              <span className="bg-[#CCFF00] text-black px-2 py-0.5 border border-black">{irradiance} W/m²</span>
            </div>
            <input
              type="range"
              min="400"
              max="1100"
              step="25"
              value={irradiance}
              onChange={(e) => setIrradiance(Number(e.target.value))}
              className="w-full accent-black cursor-pointer h-2 bg-white border border-black"
            />
            <span className="text-[10px] text-black/70">500 W/m² = Overcast/Spring · 850 W/m² = Peak Summer Afternoon</span>
          </div>
        </div>

        {/* Live Empirical Results Display */}
        <div className="border-[3px] border-black bg-white p-4 sm:p-5 shadow-[4px_4px_0_0_#000] flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b-[2px] border-black pb-3">
            <div>
              <span className="font-mono text-xs text-black/70 font-bold uppercase">PREDICTED THERMAL RESPONSE</span>
              <div className="t-h2 font-black text-black">
                +{roundedUplift} °C <span className="text-sm font-mono font-normal text-black/70">SURFACE UPLIFT</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-black">EQUIVALENT GRADE:</span>
              <div className={`px-4 py-1.5 font-display text-2xl font-black border-[2px] border-black shadow-[2px_2px_0_0_#000] ${gradeColor}`}>
                {grade}
              </div>
            </div>
          </div>

          {/* Multi-Benefit Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div className="border-[2px] border-black p-2.5 bg-[#F5F2E8] flex flex-col">
              <span className="text-[10px] text-black/70 font-bold uppercase">CORRIDOR TREES</span>
              <span className="text-base font-black text-black">{treesCount}</span>
              <span className="text-[9px] text-black/60">~50m² mature crown</span>
            </div>

            <div className="border-[2px] border-black p-2.5 bg-[#F5F2E8] flex flex-col">
              <span className="text-[10px] text-black/70 font-bold uppercase">CARBON CAPTURE</span>
              <span className="text-base font-black text-black">+{carbonKgYear} kg/yr</span>
              <span className="text-[9px] text-black/60">CO2e sequestered</span>
            </div>

            <div className="border-[2px] border-black p-2.5 bg-[#F5F2E8] flex flex-col">
              <span className="text-[10px] text-black/70 font-bold uppercase">STORMWATER</span>
              <span className="text-base font-black text-black">+{stormwaterLiters.toLocaleString()} L/yr</span>
              <span className="text-[9px] text-black/60">Runoff diverted</span>
            </div>

            <div className="border-[2px] border-black p-2.5 bg-[#F5F2E8] flex flex-col">
              <span className="text-[10px] text-black/70 font-bold uppercase">COOLING ENERGY</span>
              <span className="text-base font-black text-black">~{coolingKwh} kWh/yr</span>
              <span className="text-[9px] text-black/60">Building load offset</span>
            </div>
          </div>
        </div>
      </div>
    </BrutCard>
  );
}
