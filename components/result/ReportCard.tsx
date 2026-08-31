"use client";

import React, { useState, useMemo } from "react";
import { ScanInput } from "@/types/scan";
import { SegResult } from "@/types/seg";
import { Metrics } from "@/types/metrics";
import { ScanCanvas } from "./ScanCanvas";
import { GradeStamp } from "@/components/ui/GradeStamp";
import { StatReadout } from "@/components/ui/StatReadout";
import { CompositionBar } from "@/components/ui/CompositionBar";
import { SegLegend, SegLegendItem } from "@/components/ui/SegLegend";
import { CanopySimulator } from "./CanopySimulator";
import { Prescription } from "./Prescription";
import { ShareCardCanvas } from "./ShareCardCanvas";
import { TelemetryHUD } from "@/components/ui/TelemetryHUD";
import { EquityComparison } from "./EquityComparison";
import { AdvocacyModal } from "./AdvocacyModal";
import { BrutButton } from "@/components/ui/BrutButton";
import { BrutCard } from "@/components/ui/BrutCard";
import { applyCanopy } from "@/lib/simulate";
import { SEG_HEX } from "@/lib/classes";
import { RotateCcw, AlertTriangle, Cpu, Mail, Trees, CloudRain, Zap } from "lucide-react";

export interface ReportCardProps {
  input: ScanInput;
  segResult: SegResult;
  labelMap: Uint8Array;
  metrics: Metrics;
  onReset: () => void;
}

export const ReportCard: React.FC<ReportCardProps> = ({
  input,
  segResult,
  labelMap,
  metrics: initialMetrics,
  onReset,
}) => {
  const [currentMetrics, setCurrentMetrics] = useState<Metrics>(initialMetrics);
  const [overrideLabelMap, setOverrideLabelMap] = useState<Uint8Array | null>(null);
  const [isAdvocacyOpen, setIsAdvocacyOpen] = useState<boolean>(false);

  const handleCanopyChange = (addedPp: number, simulatedMetrics: Metrics) => {
    setCurrentMetrics(simulatedMetrics);

    if (addedPp === 0) {
      setOverrideLabelMap(null);
    } else {
      const nextOverride = applyCanopy(
        labelMap,
        input.width,
        input.height,
        addedPp,
        initialMetrics.totalGroundPixels
      );
      setOverrideLabelMap(nextOverride);
    }
  };

  // Build legend items
  const legendItems: SegLegendItem[] = useMemo(() => {
    return Object.entries(currentMetrics.groundPercentages).map(([cls, pct]) => ({
      label: cls.replace("_", " "),
      percentage: pct,
      color: SEG_HEX[cls as keyof typeof SEG_HEX] || "#8C887E",
    }));
  }, [currentMetrics.groundPercentages]);

  const isLowConfidence = initialMetrics.confidence === "low";

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white border-[3px] border-black p-3 sm:p-4 shadow-[4px_4px_0_0_#000]">
        <div className="flex items-center gap-2 font-mono text-xs sm:text-sm font-bold min-w-0">
          <span className="bg-black text-[#CCFF00] px-2 py-0.5 uppercase tracking-wider">
            REPORT CARD
          </span>
          <span className="text-black font-extrabold truncate">{input.sourceName}</span>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs text-black/70 shrink-0">
          <span className="flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5 text-black" />
            {segResult.device.toUpperCase()} ({segResult.ms}ms)
          </span>
          <BrutButton variant="ghost" size="sm" onClick={onReset}>
            <RotateCcw className="w-3.5 h-3.5 mr-1 stroke-[3]" />
            NEW SCAN
          </BrutButton>
        </div>
      </div>

      {/* Low Confidence Warning Card (if applicable) */}
      {isLowConfidence && (
        <BrutCard
          title="LOW CONFIDENCE SCAN"
          headerAccent="orange"
          borderHeavy
          shadow="lg"
        >
          <div className="flex items-start gap-3 text-black">
            <AlertTriangle className="w-6 h-6 text-[#FF6B1A] shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1 font-mono text-xs sm:text-sm">
              <span className="font-black uppercase">
                UNCERTAIN SCENE CLASSIFICATION
              </span>
              <p>
                We could not clearly identify enough street pavement, canopy, or ground features
                in this photo. This can happen with indoor photos, extreme close-ups, or heavily
                obstructed angles. Results below are rough approximations.
              </p>
            </div>
          </div>
        </BrutCard>
      )}

      {/* Main Grid: Canvas (7 cols) + Key Stats (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Scan Canvas (7 cols) */}
        <div className="lg:col-span-7">
          <ScanCanvas
            baseBitmap={input.bitmap}
            labelMap={labelMap}
            overrideLabelMap={overrideLabelMap}
            width={input.width}
            height={input.height}
          />
        </div>

        {/* Right: Grade Stamp & Key Readouts (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Grade Card */}
          <BrutCard
            title="HEAT VULNERABILITY GRADE"
            headerAccent="cyan"
            className="flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="py-2">
              <GradeStamp grade={currentMetrics.grade} size="lg" />
            </div>
            <div className="font-mono text-xs text-black/70 mt-3 max-w-xs text-center">
              {currentMetrics.grade === "A" && "Excellent canopy coverage with minimal thermal uplift."}
              {currentMetrics.grade === "B" && "Moderate shade protection against severe afternoon heat."}
              {currentMetrics.grade === "C" && "Elevated surface heating. Needs strategic street canopy."}
              {currentMetrics.grade === "D" && "Severe thermal exposure due to unshaded pavement."}
              {currentMetrics.grade === "F" && "Critical urban heat sink. Urgent tree planting required."}
            </div>
          </BrutCard>

          {/* Key Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatReadout
              label="EST. SURFACE UPLIFT"
              value={`+${currentMetrics.upliftC.toFixed(1)}`}
              unit="°C"
              subline="vs shaded reference block"
              headerAccent="hot"
            />
            <StatReadout
              label="GREEN VIEW INDEX"
              value={`${(currentMetrics.gvi * 100).toFixed(1)}`}
              unit="%"
              subline="Treepedia frame greenery"
              headerAccent="acid"
            />
          </div>
        </div>
      </div>

      {/* Ground Composition Strip */}
      <BrutCard
        title="GROUND COVER COMPOSITION BREAKDOWN"
        headerAccent="acid"
        subtitle="GROUND PIXELS ONLY (EXCL. SKY/TRANSIENTS)"
      >
        <div className="flex flex-col gap-4">
          <CompositionBar composition={currentMetrics.groundPercentages} />
          <SegLegend items={legendItems} />
        </div>
      </BrutCard>

      {/* Ecological Multi-Benefits Section */}
      <BrutCard
        title="PROJECTED ECOLOGICAL MULTI-BENEFITS"
        headerAccent="acid"
        subtitle="USFS URBAN FOREST &amp; EPA CALCULATOR BENCHMARKS"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
          <div className="border-[2px] border-black p-3.5 bg-white shadow-[2px_2px_0_0_#000] flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 font-bold text-black text-[11px]">
              <Trees className="w-4 h-4 text-[#008f40]" />
              <span>CARBON SEQUESTRATION</span>
            </div>
            <div className="text-xl font-black text-black">
              {currentMetrics.carbonKgYear} <span className="text-xs font-normal text-black/70">kg CO₂e/yr</span>
            </div>
            <span className="text-[10px] text-black/60">Annual atmospheric carbon storage in mature wood</span>
          </div>

          <div className="border-[2px] border-black p-3.5 bg-white shadow-[2px_2px_0_0_#000] flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 font-bold text-black text-[11px]">
              <CloudRain className="w-4 h-4 text-[#0066FF]" />
              <span>STORMWATER RUNOFF</span>
            </div>
            <div className="text-xl font-black text-black">
              {currentMetrics.stormwaterLitersYear.toLocaleString()} <span className="text-xs font-normal text-black/70">Liters/yr</span>
            </div>
            <span className="text-[10px] text-black/60">Rainwater intercepted by foliage &amp; root absorption</span>
          </div>

          <div className="border-[2px] border-black p-3.5 bg-white shadow-[2px_2px_0_0_#000] flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 font-bold text-black text-[11px]">
              <Zap className="w-4 h-4 text-[#FF6B1A]" />
              <span>COOLING ENERGY OFFSET</span>
            </div>
            <div className="text-xl font-black text-black">
              ~{Math.round((currentMetrics.groundPercentages.CANOPY || (currentMetrics.ground.CANOPY * 100)) * 43.5)}{" "}
              <span className="text-xs font-normal text-black/70">kWh/yr</span>
            </div>
            <span className="text-[10px] text-black/60">Reduced air conditioning load on adjacent buildings</span>
          </div>
        </div>
      </BrutCard>

      {/* Neighborhood Equity Comparison Benchmark */}
      <EquityComparison metrics={currentMetrics} sourceName={input.sourceName} />

      {/* Interactive Canopy Simulator (The Money Shot) */}
      <CanopySimulator
        baseMetrics={initialMetrics}
        onCanopyChange={handleCanopyChange}
      />

      {/* Cooling Prescription */}
      <Prescription metrics={currentMetrics} />

      {/* Hardware & Inference Telemetry HUD */}
      <TelemetryHUD segResult={segResult} metrics={currentMetrics} />

      {/* Bottom Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 bg-white border-[3px] border-black shadow-[4px_4px_0_0_#000]">
        <div className="flex flex-wrap items-center gap-3">
          <ShareCardCanvas
            metrics={currentMetrics}
            baseBitmap={input.bitmap}
            labelMap={overrideLabelMap || labelMap}
            sourceName={input.sourceName}
          />

          <BrutButton
            variant="cyan"
            size="md"
            onClick={() => setIsAdvocacyOpen(true)}
          >
            <Mail className="w-4 h-4 mr-1.5" />
            DRAFT CITY COUNCIL PETITION
          </BrutButton>
        </div>

        <BrutButton variant="ghost" size="md" onClick={onReset} className="w-full sm:w-auto">
          <RotateCcw className="w-4 h-4 mr-1 stroke-[3]" />
          SCAN ANOTHER STREET
        </BrutButton>
      </div>

      {/* Advocacy Petition Modal */}
      <AdvocacyModal
        metrics={currentMetrics}
        sourceName={input.sourceName}
        isOpen={isAdvocacyOpen}
        onClose={() => setIsAdvocacyOpen(false)}
      />
    </div>
  );
};
