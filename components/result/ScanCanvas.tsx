"use client";

import React, { useEffect, useRef, useState } from "react";
import { BrutCard } from "@/components/ui/BrutCard";
import { BrutSlider } from "@/components/ui/BrutSlider";
import { renderOverlay } from "@/lib/overlay";
import { CBClass, CB_CLASSES, SEG_HEX } from "@/lib/classes";
import { Layers, Eye, EyeOff } from "lucide-react";

export interface ScanCanvasProps {
  baseBitmap: ImageBitmap;
  labelMap: Uint8Array;
  width: number;
  height: number;
  overrideLabelMap?: Uint8Array | null;
  className?: string;
}

const INSPECTABLE_CLASSES: CBClass[] = [
  "CANOPY",
  "LOW_GREEN",
  "PAVED",
  "BUILT",
  "BARE",
  "WATER",
  "TRANSIENT",
];

export const ScanCanvas: React.FC<ScanCanvasProps> = ({
  baseBitmap,
  labelMap,
  width,
  height,
  overrideLabelMap,
  className,
}) => {
  const baseCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [opacity, setOpacity] = useState<number>(75);
  const [hasRevealed, setHasRevealed] = useState<boolean>(false);
  const [hiddenClasses, setHiddenClasses] = useState<Set<CBClass>>(new Set());

  // Draw base photo once
  useEffect(() => {
    const canvas = baseCanvasRef.current;
    if (!canvas || !baseBitmap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(baseBitmap, 0, 0, width, height);
  }, [baseBitmap, width, height]);

  // Draw overlay whenever labelMap, override, or hiddenClasses change
  useEffect(() => {
    const canvas = overlayCanvasRef.current;
    if (!canvas || !labelMap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    const overlayImgData = renderOverlay(
      labelMap,
      width,
      height,
      overrideLabelMap,
      hiddenClasses
    );
    ctx.putImageData(overlayImgData, 0, 0);

    if (!hasRevealed) {
      setHasRevealed(true);
    }
  }, [labelMap, overrideLabelMap, width, height, hasRevealed, hiddenClasses]);

  const toggleClass = (cls: CBClass) => {
    setHiddenClasses((prev) => {
      const next = new Set(prev);
      if (next.has(cls)) {
        next.delete(cls);
      } else {
        next.add(cls);
      }
      return next;
    });
  };

  const showAll = () => setHiddenClasses(new Set());
  const hideAll = () => setHiddenClasses(new Set(INSPECTABLE_CLASSES));

  return (
    <BrutCard
      title="STREET SEGMENTATION"
      headerAccent="acid"
      subtitle={`${width} × ${height} PX`}
      className={className}
    >
      <div className="flex flex-col gap-4">
        {/* Canvas viewport */}
        <div
          role="region"
          aria-label="Street segmentation viewer with interactive thermal overlay"
          className="relative w-full aspect-auto bg-black border-[3px] border-black overflow-hidden shadow-[4px_4px_0_0_#000]"
        >
          {/* Base photo canvas */}
          <canvas
            ref={baseCanvasRef}
            role="img"
            aria-label="Base street photo"
            className="block w-full h-auto object-cover"
            style={{ aspectRatio: `${width} / ${height}` }}
          />

          {/* Overlay mask canvas with clip-path wipe animation on mount */}
          <canvas
            ref={overlayCanvasRef}
            role="img"
            aria-label={`Segmented semantic mask overlay at ${opacity}% opacity`}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-75"
            style={{
              opacity: opacity / 100,
              aspectRatio: `${width} / ${height}`,
            }}
          />
        </div>

        {/* Opacity slider */}
        <div className="pt-1">
          <BrutSlider
            label="MASK OVERLAY OPACITY"
            min={0}
            max={100}
            step={5}
            value={opacity}
            onChange={setOpacity}
            unit="%"
            fillColor="cyan"
          />
        </div>

        {/* Layer Isolation Inspector */}
        <div className="border-t-[2px] border-black pt-3 flex flex-col gap-2 font-mono text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-black">
              <Layers className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>ISOLATE SEMANTIC LAYERS:</span>
            </div>
            <div className="flex items-center gap-1 text-[10px]">
              <button
                type="button"
                onClick={showAll}
                aria-label="Show all semantic layers"
                className="px-1.5 py-0.5 bg-[#F5F2E8] border border-black font-bold hover:bg-black hover:text-white"
              >
                SHOW ALL
              </button>
              <button
                type="button"
                onClick={hideAll}
                aria-label="Hide all semantic layers"
                className="px-1.5 py-0.5 bg-[#F5F2E8] border border-black font-bold hover:bg-black hover:text-white"
              >
                HIDE ALL
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Semantic class filters">
            {INSPECTABLE_CLASSES.map((cls) => {
              const isHidden = hiddenClasses.has(cls);
              const hex = SEG_HEX[cls];

              return (
                <button
                  key={cls}
                  type="button"
                  onClick={() => toggleClass(cls)}
                  aria-pressed={!isHidden}
                  aria-label={`Toggle ${cls} layer visibility`}
                  className={`flex items-center gap-1.5 px-2 py-1 border-[2px] border-black transition-all ${
                    isHidden
                      ? "bg-[#D9D6CC]/40 text-black/40 line-through opacity-60"
                      : "bg-white text-black font-bold shadow-[2px_2px_0_0_#000]"
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 border border-black shrink-0"
                    style={{ backgroundColor: isHidden ? "#999" : hex }}
                  />
                  <span>{cls}</span>
                  {isHidden ? (
                    <EyeOff className="w-3 h-3 text-black/40" />
                  ) : (
                    <Eye className="w-3 h-3 text-black" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </BrutCard>
  );
};
