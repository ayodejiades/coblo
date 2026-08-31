"use client";

import React, { useEffect } from "react";
import { Hero } from "@/components/marketing/Hero";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { BrutButton } from "@/components/ui/BrutButton";
import Link from "next/link";
import { ArrowRight, Camera } from "lucide-react";

export default function LandingPage() {
  useEffect(() => {
    // Warm up model on-device in background after client mount
    if (typeof window !== "undefined") {
      import("@/lib/segmentation").then(({ warmUp }) => {
        warmUp();
      });
    }
  }, []);

  return (
    <main className="w-full max-w-[1120px] mx-auto px-4 sm:px-8 py-6 flex flex-col gap-12">
      <Hero />
      <HowItWorks />

      {/* Final Call to Action Strip */}
      <section className="w-full bg-[#CCFF00] border-[4px] border-black p-6 sm:p-10 shadow-[8px_8px_0_0_#000] flex flex-col sm:flex-row items-center justify-between gap-6 my-4 select-none">
        <div className="flex flex-col gap-2 max-w-xl text-center sm:text-left">
          <h2 className="t-h2 font-black text-black leading-tight">
            READY TO AUDIT YOUR STREET?
          </h2>
          <p className="font-mono text-xs sm:text-sm text-black font-semibold">
            Turn street photography into actionable climate advocacy. Runs 100% on your device in seconds.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link href="/scan">
            <BrutButton variant="ink" size="lg">
              <Camera className="w-5 h-5 mr-1 stroke-[2.5]" />
              LAUNCH HEAT SCAN
              <ArrowRight className="w-5 h-5 ml-1 stroke-[3]" />
            </BrutButton>
          </Link>
        </div>
      </section>
    </main>
  );
}
