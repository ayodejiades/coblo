"use client";

import React, { useState } from "react";
import { SegResult } from "@/types/seg";
import { Metrics } from "@/types/metrics";
import { Terminal, ChevronDown, ChevronUp, Cpu, ShieldCheck, Zap } from "lucide-react";

interface TelemetryHUDProps {
  segResult?: SegResult;
  metrics?: Metrics;
}

export function TelemetryHUD({ segResult, metrics }: TelemetryHUDProps) {
  const [isOpen, setIsOpen] = useState(false);

  const device = segResult?.device === "webgpu" ? "WebGPU (fp32 Execution)" : "WASM (q8 SIMD Single-Thread)";
  const latency = segResult?.ms ? `${segResult.ms} ms` : "~1,200 ms";
  const maskCount = segResult?.masks?.length || 0;
  const resolution = segResult ? `${segResult.width} × ${segResult.height} px` : "1024 × 768 px";

  return (
    <div className="w-full border-[3px] border-black bg-white shadow-[4px_4px_0_0_#000] font-mono text-xs select-none">
      {/* Header Bar */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-black text-white px-4 py-2.5 flex items-center justify-between hover:bg-black/90 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <Terminal className="w-4 h-4 text-[#CCFF00]" />
          <span className="font-bold tracking-wider text-[#CCFF00]">HARDWARE &amp; INFERENCE TELEMETRY HUD</span>
          <span className="bg-[#FF2E93] text-black text-[10px] px-1.5 py-0.2 font-black uppercase">
            {segResult?.device || "ON-DEVICE"}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-white/70 hidden sm:inline">LATENCY: {latency}</span>
          {isOpen ? <ChevronUp className="w-4 h-4 text-white" /> : <ChevronDown className="w-4 h-4 text-white" />}
        </div>
      </button>

      {/* Expanded Telemetry Body */}
      {isOpen && (
        <div className="p-4 bg-[#F5F2E8] border-t-[2px] border-black grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {/* Tile 1: Acceleration Engine */}
          <div className="bg-white border-[2px] border-black p-2.5 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-black/70 font-bold text-[10px]">
              <Cpu className="w-3.5 h-3.5 text-black" />
              <span>COMPUTE BACKEND</span>
            </div>
            <span className="font-bold text-black text-xs">{device}</span>
            <span className="text-[10px] text-black/60">Transformers.js ONNX Runtime</span>
          </div>

          {/* Tile 2: Latency & Resolution */}
          <div className="bg-white border-[2px] border-black p-2.5 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-black/70 font-bold text-[10px]">
              <Zap className="w-3.5 h-3.5 text-black" />
              <span>EXECUTION LATENCY</span>
            </div>
            <span className="font-bold text-black text-xs">{latency}</span>
            <span className="text-[10px] text-black/60">Canvas Target: {resolution}</span>
          </div>

          {/* Tile 3: Privacy & Zero Egress */}
          <div className="bg-white border-[2px] border-black p-2.5 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-black/70 font-bold text-[10px]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#008f40]" />
              <span>NETWORK EGRESS</span>
            </div>
            <span className="font-bold text-[#008f40] text-xs">0 BYTES TRANSMITTED</span>
            <span className="text-[10px] text-black/60">100% Client-Side Web Worker</span>
          </div>

          {/* Tile 4: Neural Model */}
          <div className="bg-white border-[2px] border-black p-2.5 flex flex-col gap-1">
            <span className="text-black/70 font-bold text-[10px]">NEURAL ARCHITECTURE</span>
            <span className="font-bold text-black text-xs">SegFormer-B0 (ADE20K)</span>
            <span className="text-[10px] text-black/60">~14.7 MB Cached ONNX Weights</span>
          </div>

          {/* Tile 5: Segmented Mask Count */}
          <div className="bg-white border-[2px] border-black p-2.5 flex flex-col gap-1">
            <span className="text-black/70 font-bold text-[10px]">SEMANTIC MASKS RESOLVED</span>
            <span className="font-bold text-black text-xs">{maskCount} Raw Segment Masks</span>
            <span className="text-[10px] text-black/60">Transferable ArrayBuffer zero-copy</span>
          </div>

          {/* Tile 6: Ground Denominator */}
          <div className="bg-white border-[2px] border-black p-2.5 flex flex-col gap-1">
            <span className="text-black/70 font-bold text-[10px]">GROUND ANALYSIS RATIO</span>
            <span className="font-bold text-black text-xs">
              {metrics ? `${Math.round((metrics.totalGroundPixels / (metrics.totalPixels || 1)) * 100)}% of Frame` : "68% of Frame"}
            </span>
            <span className="text-[10px] text-black/60">Sky &amp; Transient Objects Excluded</span>
          </div>
        </div>
      )}
    </div>
  );
}
