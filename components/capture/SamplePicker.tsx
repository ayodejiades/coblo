"use client";

import React, { useState } from "react";
import { normaliseImage } from "@/lib/image";
import { ScanInput, SampleStreet } from "@/types/scan";
import { BrutBadge } from "@/components/ui/BrutBadge";

export const SAMPLE_STREETS: SampleStreet[] = [
  {
    id: "bare-street",
    name: "BARE URBAN BOULEVARD",
    description: "Wide treeless asphalt avenue with high sun exposure",
    expectedGrade: "F",
    url: "/samples/bare-street.jpg",
    attribution: "Unsplash / CC0",
  },
  {
    id: "leafy-street",
    name: "SHADED RESIDENTIAL OAK",
    description: "Mature tree arch canopy shading road and sidewalks",
    expectedGrade: "A",
    url: "/samples/leafy-street.jpg",
    attribution: "Unsplash / CC0",
  },
  {
    id: "parking-lot",
    name: "COMMERCIAL PLAZA LOT",
    description: "Expansive unshaded asphalt heat trap with zero canopy",
    expectedGrade: "F",
    url: "/samples/parking-lot.jpg",
    attribution: "Unsplash / CC0",
  },
];

export interface SamplePickerProps {
  onSelect: (input: ScanInput) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

export const SamplePicker: React.FC<SamplePickerProps> = ({
  onSelect,
  onError,
  disabled = false,
}) => {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleSelectSample = async (sample: SampleStreet) => {
    if (disabled || loadingId) return;
    try {
      setLoadingId(sample.id);
      const res = await fetch(sample.url);
      if (!res.ok) {
        throw new Error(`Failed to load sample image: ${res.statusText}`);
      }
      const blob = await res.blob();
      const input = await normaliseImage(blob, sample.name);
      onSelect(input);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load sample image.";
      onError(msg);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="t-label font-black text-black">OR TEST WITH SAMPLE STREETS</span>
        <span className="text-[0.65rem] sm:text-xs font-mono text-black/70">
          OFFLINE / DEMO-READY
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {SAMPLE_STREETS.map((sample) => {
          const isLoading = loadingId === sample.id;
          return (
            <button
              key={sample.id}
              type="button"
              disabled={disabled || !!loadingId}
              onClick={() => handleSelectSample(sample)}
              className="text-left bg-white border-[3px] border-black p-3 shadow-[4px_4px_0_0_#000] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[6px_6px_0_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_0_#000] transition-all duration-75 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group flex flex-col justify-between min-h-[110px]"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-mono text-xs font-black uppercase text-black leading-tight group-hover:text-[#FF2E93] transition-colors">
                  {sample.name}
                </span>
                <BrutBadge
                  variant={sample.expectedGrade === "A" ? "acid" : "hot"}
                  className="text-[0.65rem] px-1.5 py-0"
                >
                  EXP {sample.expectedGrade}
                </BrutBadge>
              </div>

              <p className="text-[0.7rem] font-mono text-black/70 my-1 line-clamp-2 leading-tight">
                {sample.description}
              </p>

              <div className="flex items-center justify-between pt-1 border-t-[2px] border-black/10">
                <span className="text-[0.65rem] font-mono font-bold uppercase text-black/80">
                  {isLoading ? "LOADING..." : "TAP TO LOAD →"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
