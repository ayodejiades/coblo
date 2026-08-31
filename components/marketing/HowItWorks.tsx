import React from "react";
import { BrutCard } from "@/components/ui/BrutCard";
import { BrutBadge } from "@/components/ui/BrutBadge";
import { Camera, Cpu, SlidersHorizontal, ArrowRight, ShieldCheck } from "lucide-react";

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: "01",
      icon: Camera,
      title: "PHOTOGRAPH",
      badge: "INTAKE",
      badgeColor: "acid" as const,
      desc: "Stand on the sidewalk and take an eye-level photo down your street. Captures pavement, buildings, and sky in standard orientation.",
    },
    {
      num: "02",
      icon: Cpu,
      title: "SEGMENT & GRADE",
      badge: "ON-DEVICE AI",
      badgeColor: "hot" as const,
      desc: "SegFormer-B0 parses every pixel in WebAssembly/WebGPU. Evaluates ground cover fractions, Green View Index, and estimated surface heat uplift in °C.",
    },
    {
      num: "03",
      icon: SlidersHorizontal,
      title: "SIMULATE & ACT",
      badge: "ADVOCACY",
      badgeColor: "cyan" as const,
      desc: "Drag the canopy slider to convert pavement to tree shade in real time. Get a costed cooling prescription and export a high-res PNG for council petitions.",
    },
  ];

  return (
    <section className="w-full flex flex-col gap-8 py-8 border-t-[3px] border-black">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="t-label bg-black text-[#CCFF00] px-2 py-0.5 font-bold">
            HOW IT WORKS
          </span>
          <span className="t-label text-black/70">3-STEP WORKFLOW</span>
        </div>
        <h2 className="t-h2 text-black font-black">FROM Sidewalk PHOTO TO CLIMATE EVIDENCE</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <BrutCard
              key={step.num}
              title={
                <div className="flex items-center justify-between w-full">
                  <span>STEP {step.num}</span>
                  <BrutBadge variant={step.badgeColor} className="text-[0.65rem] px-1.5 py-0">
                    {step.badge}
                  </BrutBadge>
                </div>
              }
              headerAccent={step.num === "01" ? "acid" : step.num === "02" ? "hot" : "cyan"}
              className="flex flex-col justify-between"
              borderHeavy
              shadow="md"
            >
              <div className="flex flex-col gap-3">
                <div className="w-12 h-12 bg-black text-[#CCFF00] border-[2px] border-black flex items-center justify-center shadow-[3px_3px_0_0_#000]">
                  <Icon className="w-6 h-6 stroke-[2.5]" />
                </div>
                <h3 className="t-h3 font-black text-black">{step.title}</h3>
                <p className="font-mono text-xs sm:text-sm text-black/80 font-medium leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </BrutCard>
          );
        })}
      </div>

      {/* Trust & Independence Strip */}
      <div className="bg-black text-[#CCFF00] border-[3px] border-black p-4 shadow-[6px_6px_0_0_#000] flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs font-bold uppercase tracking-widest text-center sm:text-left">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#CCFF00] shrink-0" />
          <span>NO ACCOUNT NEEDED · 0 BYTES TRANSMITTED · 100% CLIENT-SIDE INFERENCE</span>
        </div>
        <span className="text-white bg-white/10 px-2 py-1 border border-white/20">
          OPEN SOURCE & SCIENCE BACKED
        </span>
      </div>
    </section>
  );
};
