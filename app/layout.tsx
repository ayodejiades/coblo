import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { Trees, BookOpen } from "lucide-react";
import { Footer } from "@/components/navigation/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://coblo.vercel.app"),
  title: "coblo — Grade your street's heat. Get a plan to cool it.",
  description:
    "Photograph your street. On-device AI segments every pixel, calculates afternoon surface heat uplift in °C, and generates an actionable cooling prescription with live canopy simulation.",
  keywords: [
    "urban heat island",
    "street tree audit",
    "canopy segmentation",
    "climate resilience",
    "heat mitigation",
    "SegFormer",
    "ADE20K",
  ],
  authors: [{ name: "coblo Team" }],
  openGraph: {
    title: "coblo — Grade your street's heat",
    description: "Photograph your street; on-device AI grades its heat and prescribes a cooling plan.",
    url: "https://coblo.vercel.app",
    siteName: "coblo",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "coblo — Grade your street's heat",
    description: "On-device AI street heat audits and live canopy cooling simulation.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col justify-between bg-[#F5F2E8] text-black antialiased">
        {/* Global Navigation Header */}
        <header className="w-full bg-white border-b-[3px] border-black sticky top-0 z-40">
          <div className="max-w-[1120px] mx-auto px-4 sm:px-8 py-3 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 group cursor-pointer"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#CCFF00] border-[2.5px] border-black flex items-center justify-center font-black text-black shadow-[2px_2px_0_0_#000] group-hover:bg-[#FF2E93] group-hover:text-white transition-colors">
                <Trees className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="font-display font-black text-xl sm:text-2xl tracking-tighter text-black">
                COBLO
              </span>
            </Link>

            <nav className="flex items-center gap-2 sm:gap-4 font-mono text-xs sm:text-sm font-bold">
              <Link
                href="/scan"
                className="px-3 py-1.5 bg-[#CCFF00] text-black border-[2px] border-black shadow-[2px_2px_0_0_#000] hover:-translate-x-[1px] hover:-translate-y-[1px] active:translate-x-[1px] active:translate-y-[1px] transition-transform"
              >
                SCAN STREET
              </Link>
              <Link
                href="/methodology"
                className="px-3 py-1.5 bg-white text-black border-[2px] border-black shadow-[2px_2px_0_0_#000] hover:bg-[#F5F2E8] transition-colors flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5" />
                METHODOLOGY
              </Link>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1">{children}</div>

        {/* Rich Neobrutalist Footer */}
        <Footer />
      </body>
    </html>
  );
}
