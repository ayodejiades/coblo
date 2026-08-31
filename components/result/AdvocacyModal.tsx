"use client";

import React, { useState } from "react";
import { Metrics } from "@/types/metrics";
import { BrutButton } from "@/components/ui/BrutButton";
import { BrutCard } from "@/components/ui/BrutCard";
import { Mail, Copy, Check, X, FileText, Send } from "lucide-react";

interface AdvocacyModalProps {
  metrics: Metrics;
  sourceName?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AdvocacyModal({
  metrics,
  sourceName = "My Street",
  isOpen,
  onClose,
}: AdvocacyModalProps) {
  const [streetName, setStreetName] = useState(sourceName.replace(/\.[^/.]+$/, ""));
  const [city, setCity] = useState("Local Municipality");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const pavedPct = metrics.groundPercentages.PAVED || Math.round((metrics.ground.PAVED || 0) * 100);
  const canopyPct = metrics.groundPercentages.CANOPY || Math.round((metrics.ground.CANOPY || 0) * 100);
  const trees = metrics.treesNeeded || 6;
  const targetGrade = "B";

  const letterText = `Subject: Urgent Request for Street Tree Planting & Heat Mitigation: ${streetName}

To: City Council & Urban Forestry Commission, ${city}
From: Local Resident & Community Climate Advocate
Date: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}

Dear Council Members and Urban Foresters,

I am writing to submit empirical data regarding extreme surface heat vulnerability on our block: ${streetName}.

Using an on-device computer vision audit (coblo.vercel.app), our street was evaluated for ground surface composition and afternoon radiant heat uplift:

AUDIT FINDINGS FOR ${streetName.toUpperCase()}:
- Current Heat Grade: GRADE ${metrics.grade}
- Estimated Afternoon Radiant Heat Uplift: +${metrics.upliftC} °C above reference canopy
- Paved Impervious Ground Cover: ${pavedPct}%
- Existing Tree Canopy Cover: ${canopyPct}%
- Green View Index (GVI): ${(metrics.gvi * 100).toFixed(1)}%

CIVIC PROPOSAL & REQUISITION:
Our street suffers from severe solar radiation absorption due to unshaded asphalt and sidewalk surfaces. To bring our block into thermal resilience (Grade ${targetGrade}, <= 3.0°C uplift), we formally request the installation of approximately ${trees} mature-canopy street trees along exposed sidewalk margins.

PROJECTED ECOLOGICAL RETURN:
- Surface Temperature Reduction: -${Math.max(0, Math.round((metrics.upliftC - 3.0) * 10) / 10)} °C
- Annual Carbon Sequestration: +${metrics.carbonKgYear} kg CO2e/year
- Stormwater Runoff Interception: +${metrics.stormwaterLitersYear.toLocaleString()} Liters/year
- Building Cooling Energy Offset: ~${Math.round(trees * 145)} kWh/year

Extreme heat is an environmental health equity issue. Shading our sidewalk will protect pedestrians, elderly residents, and schoolchildren during summer heatwaves.

I look forward to your response and would be glad to participate in site planning for upcoming municipal tree planting cycles.

Sincerely,
A Concerned Resident of ${streetName}
Audit verified via coblo on-device urban heat engine`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(letterText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Clipboard copy failed:", err);
    }
  };

  const handleMailto = () => {
    const subject = encodeURIComponent(`Urgent Street Tree & Heat Mitigation Petition: ${streetName}`);
    const body = encodeURIComponent(letterText);
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl my-8">
        <BrutCard
          title="MUNICIPAL ADVOCACY PETITION DRAFTER"
          headerAccent="acid"
          borderHeavy
          shadow="xl"
        >
          <div className="flex flex-col gap-4 font-mono text-xs">
            {/* Header info */}
            <div className="flex items-center justify-between border-b-[2px] border-black pb-2">
              <span className="text-black/80 font-bold uppercase">
                FORMAL CITY COUNCIL &amp; URBAN FORESTRY PETITION
              </span>
              <button
                type="button"
                onClick={onClose}
                className="p-1 hover:bg-black hover:text-white border border-black transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Input customizers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#F5F2E8] p-3 border-[2px] border-black">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-black text-[10px] uppercase">STREET NAME / BLOCK:</label>
                <input
                  type="text"
                  value={streetName}
                  onChange={(e) => setStreetName(e.target.value)}
                  className="bg-white border-[2px] border-black px-2 py-1 text-black font-bold focus:outline-none focus:bg-[#CCFF00]"
                  placeholder="e.g. 5th Avenue &amp; Elm St"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-black text-[10px] uppercase">MUNICIPALITY / WARD:</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="bg-white border-[2px] border-black px-2 py-1 text-black font-bold focus:outline-none focus:bg-[#CCFF00]"
                  placeholder="e.g. Ward 4 / City of Chicago"
                />
              </div>
            </div>

            {/* Letter Preview Box */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-black/70 uppercase">GENERATED ADVOCACY TEXT:</span>
              <textarea
                readOnly
                value={letterText}
                rows={12}
                className="w-full bg-white border-[2px] border-black p-3 font-mono text-[11px] leading-relaxed text-black resize-none select-all focus:outline-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t-[2px] border-black pt-3">
              <BrutButton variant="ghost" size="sm" onClick={onClose}>
                CLOSE
              </BrutButton>

              <div className="flex items-center gap-2">
                <BrutButton variant="cyan" size="sm" onClick={handleCopy}>
                  {copied ? <Check className="w-4 h-4 mr-1 text-[#008f40]" /> : <Copy className="w-4 h-4 mr-1" />}
                  {copied ? "COPIED TO CLIPBOARD" : "COPY LETTER"}
                </BrutButton>

                <BrutButton variant="primary" size="sm" onClick={handleMailto}>
                  <Send className="w-4 h-4 mr-1" />
                  OPEN IN EMAIL CLIENT
                </BrutButton>
              </div>
            </div>
          </div>
        </BrutCard>
      </div>
    </div>
  );
}
