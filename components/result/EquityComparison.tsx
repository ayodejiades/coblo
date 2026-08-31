"use client";

import React, { useState } from "react";
import { Metrics } from "@/types/metrics";
import { BrutCard } from "@/components/ui/BrutCard";
import { BrutBadge } from "@/components/ui/BrutBadge";
import { Scale, ArrowRight, Trees, Sun } from "lucide-react";

interface EquityComparisonProps {
  metrics: Metrics;
  sourceName?: string;
}

export function EquityComparison({ metrics, sourceName = "Your Street" }: EquityComparisonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const yourUplift = metrics.upliftC;
  const yourCanopy = metrics.groundPercentages.CANOPY || Math.round((metrics.ground.CANOPY || 0) * 100);
  const yourPaved = metrics.groundPercentages.PAVED || Math.round((metrics.ground.PAVED || 0) * 100);

  // Reference shaded street (Grade A baseline)
  const refUplift = 1.2;
  const refCanopy = 46;
  const refPaved = 22;

  const tempGap = Math.max(0, Math.round((yourUplift - refUplift) * 10) / 10);
  const canopyGap = Math.max(0, refCanopy - yourCanopy);

  return (
    <div className="w-full">
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-full bg-[#F5F2E8] border-[3px] border-black p-3.5 shadow-[4px_4px_0_0_#000] hover:bg-[#CCFF00] transition-colors flex items-center justify-between font-mono text-xs font-bold text-black"
        >
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-black stroke-[2.5]" />
            <span className="uppercase">COMPARE NEIGHBORHOOD HEAT EQUITY (SIDE-BY-SIDE)</span>
          </div>
          <span className="text-[10px] bg-black text-white px-2 py-0.5 uppercase">
            OPEN EQUITY BENCHMARK ↗
          </span>
        </button>
      ) : (
        <BrutCard
          title="NEIGHBORHOOD HEAT &amp; CANOPY EQUITY GAP"
          headerAccent="orange"
          borderHeavy
          shadow="lg"
        >
          <div className="flex flex-col gap-4 font-mono text-xs py-1">
            <div className="flex items-center justify-between border-b-[2px] border-black pb-2">
              <span className="text-black/80 font-bold uppercase">
                YOUR STREET VS. SHADED CANOPY REFERENCE
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-[10px] font-bold underline hover:text-[#FF2E93]"
              >
                HIDE COMPARISON
              </button>
            </div>

            {/* Gap Summary Banner */}
            <div className="bg-[#FF2E93] text-black p-3 border-[2px] border-black flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-bold">
                <Sun className="w-4 h-4 shrink-0" />
                <span>THERMAL INEQUALITY GAP:</span>
              </div>
              <span className="font-black text-sm bg-white px-2 py-0.5 border border-black">
                +{tempGap} °C HOTTER · −{canopyGap}% LESS SHADE
              </span>
            </div>

            {/* Side-by-side cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Card 1: Audited Street */}
              <div className="border-[2px] border-black bg-[#F5F2E8] p-3 flex flex-col gap-2.5">
                <div className="flex items-center justify-between border-b border-black pb-1.5">
                  <span className="font-bold text-black uppercase">{sourceName.replace(/\.[^/.]+$/, "")}</span>
                  <BrutBadge variant={metrics.grade === "A" || metrics.grade === "B" ? "acid" : "hot"}>
                    GRADE {metrics.grade}
                  </BrutBadge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-black/70">HEAT UPLIFT:</span>
                  <span className="font-black text-black text-sm">+{yourUplift} °C</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-black/70">CANOPY SHADE:</span>
                  <span className="font-bold text-black">{yourCanopy}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-black/70">IMPERVIOUS PAVEMENT:</span>
                  <span className="font-bold text-black">{yourPaved}%</span>
                </div>
              </div>

              {/* Card 2: Reference Shaded Street */}
              <div className="border-[2px] border-black bg-white p-3 flex flex-col gap-2.5">
                <div className="flex items-center justify-between border-b border-black pb-1.5">
                  <span className="font-bold text-black uppercase">SHADED REFERENCE BLOCK</span>
                  <BrutBadge variant="acid">
                    GRADE A
                  </BrutBadge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-black/70">HEAT UPLIFT:</span>
                  <span className="font-black text-[#008f40] text-sm">+{refUplift} °C</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-black/70">CANOPY SHADE:</span>
                  <span className="font-bold text-[#008f40]">{refCanopy}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-black/70">IMPERVIOUS PAVEMENT:</span>
                  <span className="font-bold text-black">{refPaved}%</span>
                </div>
              </div>
            </div>

            <div className="bg-white border-[2px] border-black p-3 text-[11px] text-black/80 leading-relaxed">
              <strong>Environmental Justice Impact:</strong> High-pavement, low-canopy blocks experience prolonged afternoon surface heat, worsening heat-related illnesses and raising summer cooling utility bills for local residents.
            </div>
          </div>
        </BrutCard>
      )}
    </div>
  );
}
