import React from "react";
import Link from "next/link";
import { Trees, BookOpen, Activity, Cpu } from "lucide-react";
import { BrutBadge } from "@/components/ui/BrutBadge";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-white border-t-[4px] border-black mt-16 font-mono select-none">
      {/* 1. Value Proposition Grid Strip */}
      <div className="border-b-[3px] border-black bg-[#CCFF00]">
        <div className="max-w-[1120px] mx-auto px-4 sm:px-8 py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-start gap-3 p-3 bg-white border-[2px] border-black shadow-[3px_3px_0_0_#000]">
            <div className="w-8 h-8 bg-black text-[#CCFF00] border border-black flex items-center justify-center font-bold shrink-0 text-xs">
              01
            </div>
            <div className="flex flex-col">
              <span className="font-display font-black text-xs uppercase text-black">
                0 BYTES UPLOADED
              </span>
              <span className="text-[0.65rem] text-black/70 font-semibold">
                100% on-device WebGPU inference
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-white border-[2px] border-black shadow-[3px_3px_0_0_#000]">
            <div className="w-8 h-8 bg-[#FF2E93] text-black border border-black flex items-center justify-center font-bold shrink-0 text-xs">
              02
            </div>
            <div className="flex flex-col">
              <span className="font-display font-black text-xs uppercase text-black">
                BLOCK-SCALE HEAT
              </span>
              <span className="text-[0.65rem] text-black/70 font-semibold">
                Sidewalk level surface uplift calculation
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-white border-[2px] border-black shadow-[3px_3px_0_0_#000]">
            <div className="w-8 h-8 bg-[#00E676] text-black border border-black flex items-center justify-center font-bold shrink-0 text-xs">
              03
            </div>
            <div className="flex flex-col">
              <span className="font-display font-black text-xs uppercase text-black">
                CANOPY SIMULATOR
              </span>
              <span className="text-[0.65rem] text-black/70 font-semibold">
                Real-time pavement-to-shade model
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-white border-[2px] border-black shadow-[3px_3px_0_0_#000]">
            <div className="w-8 h-8 bg-[#00D4FF] text-black border border-black flex items-center justify-center font-bold shrink-0 text-xs">
              04
            </div>
            <div className="flex flex-col">
              <span className="font-display font-black text-xs uppercase text-black">
                OPEN METHODOLOGY
              </span>
              <span className="text-[0.65rem] text-black/70 font-semibold">
                EPA and PNAS 2019 empirical basis
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Content */}
      <div className="bg-black text-[#F5F2E8] py-12 px-4 sm:px-8">
        <div className="max-w-[1120px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand & Mission (5 cols) */}
          <div className="md:col-span-5 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#CCFF00] border-[2px] border-white flex items-center justify-center text-black shadow-[3px_3px_0_0_#FFF]">
                <Trees className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="font-display font-black text-3xl tracking-tighter text-[#CCFF00]">
                COBLO
              </span>
              <BrutBadge variant="hot" className="text-[0.65rem] ml-2 px-1.5 py-0.5">
                EARTH FORWARD
              </BrutBadge>
            </div>

            <p className="text-white/80 text-xs sm:text-sm font-sans leading-relaxed">
              Empowering residents, tenant unions, and youth climate advocates with block-scale
              on-device computer vision to turn heat vulnerability into actionable municipal leverage.
            </p>
          </div>

          {/* Quick Actions (3 cols) */}
          <div className="md:col-span-3 flex flex-col gap-3">
            <span className="font-display text-xs text-[#CCFF00] tracking-wider uppercase border-b-[2px] border-white/20 pb-1.5">
              EXPLORE & AUDIT
            </span>
            <ul className="flex flex-col gap-2 text-xs">
              <li>
                <Link
                  href="/scan"
                  className="hover:text-[#CCFF00] flex items-center gap-1 transition-colors group"
                >
                  <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                  <span>Scan Sidewalk Photo</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/methodology"
                  className="hover:text-[#CCFF00] flex items-center gap-1 transition-colors group"
                >
                  <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                  <span>Scientific Methodology</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/scan"
                  className="hover:text-[#CCFF00] flex items-center gap-1 transition-colors group"
                >
                  <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                  <span>Interactive Canopy Slider</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/methodology"
                  className="hover:text-[#CCFF00] flex items-center gap-1 transition-colors group"
                >
                  <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                  <span>Model Bounds & Limitations</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Scientific Foundation & Prior Art (4 cols) */}
          <div className="md:col-span-4 flex flex-col gap-3">
            <span className="font-display text-xs text-[#CCFF00] tracking-wider uppercase border-b-[2px] border-white/20 pb-1.5">
              SCIENTIFIC ANCHORS
            </span>
            <div className="flex flex-col gap-2 text-[0.7rem] text-white/70">
              <div className="border-l-[2px] border-[#FF2E93] pl-2">
                <strong className="text-white">US EPA (Urban Heat Compendium)</strong>
                <p>Surface albedo and shaded pavement differential benchmarks</p>
              </div>
              <div className="border-l-[2px] border-[#00E676] pl-2">
                <strong className="text-white">Ziter et al. (PNAS 2019)</strong>
                <p>Non-linear daytime canopy air cooling thresholds</p>
              </div>
              <div className="border-l-[2px] border-[#00D4FF] pl-2">
                <strong className="text-white">MIT Treepedia / ADE20K</strong>
                <p>Green View Index (GVI) and SegFormer semantic mapping</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Legal & Attribution Bar */}
      <div className="bg-[#F5F2E8] border-t-[3px] border-black py-4 px-4 sm:px-8">
        <div className="max-w-[1120px] mx-auto flex items-center justify-between gap-3 text-xs text-black font-bold">
          <div className="flex items-center gap-2">
            <span>© 2026 COBLO</span>
            <span>·</span>
            <span>NEXTSTEP HACKS (EARTH FORWARD)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
