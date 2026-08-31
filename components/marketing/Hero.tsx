"use client";

import React from "react";
import Link from "next/link";
import { BrutButton } from "@/components/ui/BrutButton";
import { BrutBadge } from "@/components/ui/BrutBadge";
import { BrutCard } from "@/components/ui/BrutCard";
import { GradeStamp } from "@/components/ui/GradeStamp";
import { ArrowRight, Camera, SlidersHorizontal } from "lucide-react";

export const Hero: React.FC = () => {
  return (
    <section className="w-full flex flex-col gap-10 py-6 sm:py-12">
      {/* Hero Headline & CTA Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Copy & Action */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-2">
            <BrutBadge variant="hot" className="text-xs px-2.5 py-1">
              HEAT AUDIT
            </BrutBadge>
            <BrutBadge variant="acid" className="text-xs px-2.5 py-1">
              ON-DEVICE SEGFORMER
            </BrutBadge>
            <BrutBadge variant="cyan" className="text-xs px-2.5 py-1">
              EARTH FORWARD
            </BrutBadge>
          </div>

          <h1 className="t-h1 text-black font-black leading-[0.92]">
            GRADE YOUR <span className="bg-[#FF2E93] text-black px-2 inline-block">STREET&apos;S HEAT.</span>
            <br />
            GET A PLAN TO COOL IT.
          </h1>

          <p className="t-body text-black/80 font-mono text-sm sm:text-base leading-relaxed max-w-xl font-medium">
            Extreme heat is distributed along income lines. Photograph your sidewalk — on-device SegFormer
            segmentation calculates surface heat uplift in °C, assigns an A–F report card, and simulates
            cooling canopy in real time.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <Link href="/scan" className="w-full sm:w-auto">
              <BrutButton variant="primary" size="lg" className="w-full sm:w-auto text-sm sm:text-base">
                <Camera className="w-5 h-5 mr-1 stroke-[2.5]" />
                SCAN MY STREET NOW
                <ArrowRight className="w-5 h-5 ml-1 stroke-[3]" />
              </BrutButton>
            </Link>

            <Link href="/methodology" className="w-full sm:w-auto">
              <BrutButton variant="ghost" size="lg" className="w-full sm:w-auto text-sm sm:text-base">
                OUR METHODOLOGY
              </BrutButton>
            </Link>
          </div>

          {/* Key Differentiators Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t-[3px] border-black">
            <div className="flex flex-col">
              <span className="font-mono font-black text-xs uppercase text-black">0 BYTES</span>
              <span className="font-mono text-[0.65rem] text-black/60">Image Uploads</span>
            </div>
            <div className="flex flex-col">
              <span className="font-mono font-black text-xs uppercase text-black">~1.2 SEC</span>
              <span className="font-mono text-[0.65rem] text-black/60">Local Inference</span>
            </div>
            <div className="flex flex-col">
              <span className="font-mono font-black text-xs uppercase text-black">0 JOULES</span>
              <span className="font-mono text-[0.65rem] text-black/60">Server Compute</span>
            </div>
            <div className="flex flex-col">
              <span className="font-mono font-black text-xs uppercase text-black">1080×1350</span>
              <span className="font-mono text-[0.65rem] text-black/60">Advocacy PNG</span>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Preview Card */}
        <div className="lg:col-span-5">
          <BrutCard
            title="LIVE AUDIT PREVIEW"
            headerAccent="hot"
            borderHeavy
            shadow="xl"
            className="p-4 sm:p-5"
          >
            <div className="flex flex-col gap-4">
              {/* Sample Photo Container with Overlay Badge */}
              <div className="relative aspect-[4/3] w-full bg-black border-[3px] border-black overflow-hidden shadow-[4px_4px_0_0_#000]">
                <img
                  src="/samples/bare-street.jpg"
                  alt="Street Heat Scan Sample"
                  className="w-full h-full object-cover"
                />

                {/* Grade Stamp Overlay in preview */}
                <div className="absolute top-3 right-3">
                  <GradeStamp grade="F" size="sm" />
                </div>

                {/* Stats badge overlay */}
                <div className="absolute bottom-3 left-3 bg-black text-[#CCFF00] border-[2px] border-black px-2.5 py-1 font-mono text-xs font-bold shadow-[2px_2px_0_0_#000]">
                  STREET HEAT AUDIT · CRITICAL HEAT SINK
                </div>
              </div>

              {/* Mini Simulator Preview Strip */}
              <div className="bg-[#F5F2E8] border-[2px] border-black p-3 flex items-center justify-between font-mono text-xs">
                <div className="flex items-center gap-1.5">
                  <SlidersHorizontal className="w-4 h-4 text-[#FF2E93]" />
                  <span className="font-bold">CANOPY SLIDER:</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="line-through text-black/50">GRADE F (UNSHADED)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span className="font-extrabold text-[#008f40] bg-[#00E676]/30 px-1.5 py-0.5 border border-black">
                    GRADE B (COOLED)
                  </span>
                </div>
              </div>
            </div>
          </BrutCard>
        </div>
      </div>
    </section>
  );
};
