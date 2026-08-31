"use client";

import React, { useState, useRef } from "react";
import { Metrics } from "@/types/metrics";
import { simulateCanopy, PP_PER_TREE } from "@/lib/metrics";
import { BrutCard } from "@/components/ui/BrutCard";
import { BrutSlider } from "@/components/ui/BrutSlider";
import { BrutBadge } from "@/components/ui/BrutBadge";
import { Trees, ArrowRight, TrendingDown } from "lucide-react";

export interface CanopySimulatorProps {
  baseMetrics: Metrics;
  onCanopyChange: (addedPp: number, simulatedMetrics: Metrics) => void;
  className?: string;
}

export const CanopySimulator: React.FC<CanopySimulatorProps> = ({
  baseMetrics,
  onCanopyChange,
  className,
}) => {
  const [addedCanopy, setAddedCanopy] = useState<number>(0);
  const [simMetrics, setSimMetrics] = useState<Metrics>(baseMetrics);
  const rafRef = useRef<number | null>(null);

  const handleSliderChange = (value: number) => {
    setAddedCanopy(value);

    // Throttle metric recalculations to animation frame (60fps)
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      const nextSim = simulateCanopy(baseMetrics, value);
      setSimMetrics(nextSim);
      onCanopyChange(value, nextSim);
    });
  };

  const gradeBadgeVariant = {
    A: "acid",
    B: "canopy",
    C: "orange",
    D: "orange",
    F: "hot",
  } as const;

  const maxPavedPp = Math.round((baseMetrics.ground.PAVED || 0) * 100);
  // Match sliderMax exactly to available convertible pavement without artificial flooring
  const sliderMax = Math.min(40, maxPavedPp);

  const treesPlanted = Math.round(addedCanopy / PP_PER_TREE);
  const tempReduction = Math.max(0, Math.round((baseMetrics.upliftC - simMetrics.upliftC) * 10) / 10);

  return (
    <BrutCard
      title="INTERACTIVE CANOPY SIMULATOR"
      headerAccent="hot"
      className={className}
      borderHeavy
      shadow="lg"
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#F5F2E8] p-4 border-[3px] border-black">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#00E676] border-[2px] border-black shadow-[2px_2px_0_0_#000] flex items-center justify-center text-black shrink-0">
              <Trees className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="t-label text-black font-black">
                HEAT REDUCTION SIMULATION
              </div>
              <p className="text-xs font-mono text-black/70">
                {sliderMax > 0
                  ? `Repave unshaded asphalt (${maxPavedPp}% available) into mature tree canopy.`
                  : "Street is already well-shaded with minimal exposed pavement."}
              </p>
            </div>
          </div>

          {/* Live comparison readout */}
          <div className="flex items-center gap-2 bg-white border-[2px] border-black p-2 shadow-[2px_2px_0_0_#000] self-stretch sm:self-auto justify-center">
            <div className="flex flex-col items-center">
              <span className="text-[0.65rem] font-mono text-black/60 uppercase">CURRENT</span>
              <span className="text-sm font-mono font-black tabular-nums text-black">
                +{baseMetrics.upliftC.toFixed(1)}°C
              </span>
            </div>

            <ArrowRight className="w-4 h-4 text-black stroke-[3]" />

            <div className="flex flex-col items-center">
              <span className="text-[0.65rem] font-mono text-black/60 uppercase">PROJECTED</span>
              <span className="text-sm font-mono font-black tabular-nums text-[#008f40]">
                +{simMetrics.upliftC.toFixed(1)}°C
              </span>
            </div>

            <BrutBadge
              variant={gradeBadgeVariant[simMetrics.grade]}
              className="text-xs ml-1 px-2 py-1"
            >
              {simMetrics.grade}
            </BrutBadge>
          </div>
        </div>

        {/* Range slider */}
        {sliderMax > 0 ? (
          <div className="w-full flex flex-col gap-2">
            <BrutSlider
              label={`ADD CANOPY SHADE (+${addedCanopy}% GROUND COVER)`}
              min={0}
              max={sliderMax}
              step={1}
              value={addedCanopy}
              onChange={handleSliderChange}
              unit="%"
              fillColor="acid"
            />
            <div className="flex justify-between items-center text-[0.7rem] font-mono text-black/70 px-1">
              <span>0% (AS-IS)</span>
              <span className="font-bold text-black">
                {treesPlanted > 0 ? `~${treesPlanted} TREES (PLANNED)` : "DRAG SLIDER TO ADD TREES"}
              </span>
              <span>+{sliderMax}% (MAX CONVERTIBLE)</span>
            </div>
          </div>
        ) : (
          <div className="bg-white border-[2px] border-black p-3 font-mono text-xs text-black/80">
            <strong>Optimal Canopy Cover:</strong> This street has negligible unshaded pavement (&lt; 1%). Additional canopy simulation is not required.
          </div>
        )}

        {/* Live Delta Summary Callout */}
        {addedCanopy > 0 && (
          <div className="flex items-center justify-between bg-[#CCFF00] border-[2px] border-black px-3 py-2 font-mono text-xs font-bold text-black animate-fadeIn">
            <div className="flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4 text-black stroke-[3]" />
              <span>PROJECTED AFTERNOON COOLING:</span>
            </div>
            <span className="text-black bg-white px-2 py-0.5 border border-black">
              −{tempReduction.toFixed(1)}°C COOLER · +{treesPlanted} TREES
            </span>
          </div>
        )}
      </div>
    </BrutCard>
  );
};
