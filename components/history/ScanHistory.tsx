"use client";

import React, { useEffect, useState } from "react";
import { HistoryEntry, loadScanHistory, clearScanHistory } from "@/lib/history";
import { BrutCard } from "@/components/ui/BrutCard";
import { BrutBadge } from "@/components/ui/BrutBadge";
import { BrutButton } from "@/components/ui/BrutButton";
import { History, Trash2, Clock } from "lucide-react";

export interface ScanHistoryProps {
  onSelectScan?: (entry: HistoryEntry) => void;
  className?: string;
}

export const ScanHistory: React.FC<ScanHistoryProps> = ({ onSelectScan, className }) => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setHistory(loadScanHistory());
  }, []);

  const handleClear = () => {
    if (confirm("Clear local scan history?")) {
      clearScanHistory();
      setHistory([]);
    }
  };

  if (history.length === 0) return null;

  return (
    <BrutCard
      title="RECENT LOCAL AUDITS"
      headerAccent="grey"
      subtitle={`${history.length} SAVED ON-DEVICE`}
      className={className}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-black" />
            <span className="t-label text-black">PAST STREET SCANS</span>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="font-mono text-[0.65rem] uppercase text-black/60 hover:text-[#FF2E93] flex items-center gap-1 font-bold cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            CLEAR
          </button>
        </div>

        {/* Horizontal scroll list */}
        <div className="flex items-stretch gap-3 overflow-x-auto pb-2 pt-1 scrollbar-thin">
          {history.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectScan && onSelectScan(item)}
              className={`min-w-[160px] sm:min-w-[180px] max-w-[200px] bg-white border-[2px] border-black p-2 shadow-[3px_3px_0_0_#000] flex flex-col justify-between shrink-0 select-none ${
                onSelectScan ? "cursor-pointer hover:-translate-y-0.5 transition-transform" : ""
              }`}
            >
              <div className="relative aspect-video w-full bg-black border border-black overflow-hidden mb-2">
                {item.thumbnailDataUrl ? (
                  <img
                    src={item.thumbnailDataUrl}
                    alt={item.sourceName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#D9D6CC] flex items-center justify-center font-mono text-xs">
                    PHOTO
                  </div>
                )}
                <div className="absolute top-1 right-1">
                  <BrutBadge
                    variant={item.grade === "A" ? "acid" : item.grade === "B" ? "canopy" : "hot"}
                    className="text-[0.6rem] px-1 py-0"
                  >
                    {item.grade}
                  </BrutBadge>
                </div>
              </div>

              <div className="flex flex-col gap-0.5">
                <div className="font-mono font-bold text-xs text-black truncate">
                  {item.sourceName}
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-black/10">
                  <span className="font-mono font-black text-xs text-black tabular-nums">
                    +{item.upliftC.toFixed(1)}°C
                  </span>
                  <span className="font-mono text-[0.6rem] text-black/60 flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    {new Date(item.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </BrutCard>
  );
};
