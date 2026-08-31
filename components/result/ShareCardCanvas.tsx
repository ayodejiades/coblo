"use client";

import React, { useState } from "react";
import { Metrics } from "@/types/metrics";
import { renderShareCard } from "@/lib/sharecard";
import { BrutButton } from "@/components/ui/BrutButton";
import { Download, Share2, Check, Loader2 } from "lucide-react";

export interface ShareCardCanvasProps {
  metrics: Metrics;
  baseBitmap: ImageBitmap;
  labelMap: Uint8Array;
  sourceName: string;
}

export const ShareCardCanvas: React.FC<ShareCardCanvasProps> = ({
  metrics,
  baseBitmap,
  labelMap,
  sourceName,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [hasExported, setHasExported] = useState(false);

  const handleExport = async () => {
    if (isExporting) return;
    try {
      setIsExporting(true);
      const blob = await renderShareCard(metrics, baseBitmap, labelMap, sourceName);

      // Check if navigator.share with files is supported
      if (
        typeof navigator !== "undefined" &&
        navigator.canShare &&
        navigator.canShare({
          files: [
            new File([blob], "coblo-heat-report.png", { type: "image/png" }),
          ],
        })
      ) {
        try {
          const file = new File([blob], "coblo-heat-report.png", {
            type: "image/png",
          });
          await navigator.share({
            title: `coblo Heat Report: Grade ${metrics.grade}`,
            text: `My street scored Grade ${metrics.grade} (+${metrics.upliftC.toFixed(1)}°C heat uplift). Check out the cooling plan!`,
            files: [file],
          });
          setHasExported(true);
          return;
        } catch (shareErr: unknown) {
          if (shareErr instanceof Error && shareErr.name === "AbortError") {
            // User cancelled share dialog
            return;
          }
          // Otherwise fall back to direct file download
        }
      }

      // Fallback: direct download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `coblo-heat-report-${metrics.grade}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);

      setHasExported(true);
      setTimeout(() => setHasExported(false), 3000);
    } catch (err: unknown) {
      console.error("Export error:", err);
      alert("Could not generate export image. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <BrutButton
      type="button"
      variant="primary"
      size="md"
      onClick={handleExport}
      disabled={isExporting}
      className="w-full sm:w-auto"
    >
      {isExporting ? (
        <>
          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
          GENERATING PNG...
        </>
      ) : hasExported ? (
        <>
          <Check className="w-4 h-4 mr-1 stroke-[3]" />
          REPORT CARD READY!
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4 mr-1 stroke-[2.5]" />
          EXPORT ADVOCACY PNG (1080×1350)
        </>
      )}
    </BrutButton>
  );
};
