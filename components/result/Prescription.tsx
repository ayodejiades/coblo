"use client";

import React, { useEffect, useState } from "react";
import { Metrics } from "@/types/metrics";
import { fallbackPrescription, Prescription as PrescriptionType } from "@/lib/prescription";
import { BrutCard } from "@/components/ui/BrutCard";
import { BrutBadge } from "@/components/ui/BrutBadge";
import { BrutButton } from "@/components/ui/BrutButton";
import { Trees, DollarSign, CheckCircle2, RefreshCw } from "lucide-react";

export interface PrescriptionProps {
  metrics: Metrics;
  className?: string;
}

export const Prescription: React.FC<PrescriptionProps> = ({ metrics, className }) => {
  const [prescription, setPrescription] = useState<PrescriptionType>(() =>
    fallbackPrescription(metrics)
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [city, setCity] = useState<string>("");
  const [hasRequestedAi, setHasRequestedAi] = useState<boolean>(false);

  // Fetch AI prescription if available, or update fallback when metrics change
  useEffect(() => {
    let isMounted = true;

    async function fetchAiPrescription() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/prescribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ metrics, city: city || undefined }),
        });
        if (res.ok) {
          const data: PrescriptionType = await res.json();
          if (isMounted) {
            setPrescription(data);
          }
        }
      } catch {
        if (isMounted) {
          setPrescription(fallbackPrescription(metrics, city));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchAiPrescription();

    return () => {
      isMounted = false;
    };
  }, [metrics, hasRequestedAi]);

  const handleCustomLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setHasRequestedAi((prev) => !prev);
  };

  return (
    <BrutCard
      title="COOLING PRESCRIPTION & ADVOCACY PLAN"
      headerAccent="acid"
      subtitle={
        <div className="flex items-center gap-1.5 font-mono text-[0.65rem] sm:text-xs">
          <span>SOURCE:</span>
          <span className="font-extrabold uppercase bg-black text-[#CCFF00] px-1.5 py-0.5 border border-black">
            {prescription.source === "claude" ? "ANTHROPIC CLAUDE" : "DETERMINISTIC MODEL"}
          </span>
        </div>
      }
      className={className}
      borderHeavy
      shadow="lg"
    >
      <div className="flex flex-col gap-6">
        {/* Headline */}
        <div className="bg-[#F5F2E8] border-[3px] border-black p-4">
          <h3 className="t-h3 font-black text-black leading-tight">
            {prescription.headline}
          </h3>
        </div>

        {/* Action Steps */}
        <div className="flex flex-col gap-3">
          <span className="t-label text-black font-black">RECOMMENDED INTERVENTIONS</span>
          <div className="flex flex-col gap-2.5">
            {prescription.steps.map((step, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 bg-white border-[2px] border-black shadow-[3px_3px_0_0_#000]"
              >
                <div className="w-6 h-6 bg-[#CCFF00] border-[2px] border-black flex items-center justify-center font-mono font-black text-xs text-black shrink-0">
                  {idx + 1}
                </div>
                <span className="text-xs sm:text-sm font-mono text-black font-medium leading-snug">
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Species */}
        <div className="flex flex-col gap-3">
          <span className="t-label text-black font-black flex items-center gap-1.5">
            <Trees className="w-4 h-4 text-[#008f40]" />
            RESILIENT CANOPY SPECIES
          </span>
          <div className="flex flex-wrap gap-2">
            {prescription.species.map((spec, idx) => (
              <BrutBadge
                key={idx}
                variant="canopy"
                className="text-[0.7rem] sm:text-xs py-1 px-2.5 font-mono"
              >
                {spec}
              </BrutBadge>
            ))}
          </div>
        </div>

        {/* Budget & Target Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#FFFFFF] border-[3px] border-black p-3.5 shadow-[4px_4px_0_0_#000] flex flex-col justify-between">
            <span className="t-label text-black/70 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5" />
              ESTIMATED CAPITAL COST
            </span>
            <div className="text-sm sm:text-base font-mono font-black text-black mt-2">
              {prescription.costEstimate}
            </div>
          </div>

          <div className="bg-[#FFFFFF] border-[3px] border-black p-3.5 shadow-[4px_4px_0_0_#000] flex flex-col justify-between">
            <span className="t-label text-black/70 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#008f40]" />
              PROJECTED TARGET GRADE
            </span>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-lg font-mono font-black text-black">GRADE</span>
              <BrutBadge variant="canopy" className="text-base px-2.5 py-0.5">
                {prescription.projectedGrade}
              </BrutBadge>
            </div>
          </div>
        </div>

        {/* Optional City tailoring */}
        <form
          onSubmit={handleCustomLocationSubmit}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t-[2px] border-black/15"
        >
          <input
            type="text"
            placeholder="Enter municipality context (e.g. Chicago, London, Phoenix)..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="flex-1 bg-white border-[2px] border-black px-3 py-2 font-mono text-xs text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
          />
          <BrutButton
            type="submit"
            variant="cyan"
            size="sm"
            disabled={isLoading}
            className="shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isLoading ? "animate-spin" : ""}`} />
            TAILOR TO REGION
          </BrutButton>
        </form>

        {/* Caveat */}
        <div className="text-[0.65rem] sm:text-[0.7rem] font-mono text-black/60 border-t-[2px] border-black/10 pt-2 leading-tight">
          {prescription.caveat}
        </div>
      </div>
    </BrutCard>
  );
};
