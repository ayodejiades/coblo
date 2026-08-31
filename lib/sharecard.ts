import { Metrics } from "@/types/metrics";
import { renderOverlay } from "./overlay";

/**
 * Generates a high-resolution 1080x1350 PNG report card canvas for advocacy.
 */
export async function renderShareCard(
  metrics: Metrics,
  baseBitmap: ImageBitmap,
  labelMap: Uint8Array,
  sourceName: string
): Promise<Blob> {
  const width = 1080;
  const height = 1350;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to get 2D canvas context for share card.");
  }

  // Ensure all custom web fonts are fully loaded before rasterizing to canvas
  if (typeof document !== "undefined" && document.fonts) {
    try {
      await Promise.all([
        document.fonts.load("900 42px 'Archivo Black'"),
        document.fonts.load("900 24px 'Archivo Black'"),
        document.fonts.load("700 20px 'JetBrains Mono'"),
        document.fonts.load("700 18px 'JetBrains Mono'"),
        document.fonts.load("700 14px 'JetBrains Mono'"),
        document.fonts.load("700 12px 'JetBrains Mono'"),
        document.fonts.load("700 16px 'Space Grotesk'"),
        document.fonts.ready,
      ]);
    } catch {
      // Gracefully continue with available fonts if offline
    }
  }

  // 1. Paper background
  ctx.fillStyle = "#F5F2E8";
  ctx.fillRect(0, 0, width, height);

  // 2. Outer heavy border
  ctx.lineWidth = 12;
  ctx.strokeStyle = "#000000";
  ctx.strokeRect(6, 6, width - 12, height - 12);

  // 3. Top Header Bar
  ctx.fillStyle = "#000000";
  ctx.fillRect(20, 20, width - 40, 90);

  ctx.fillStyle = "#CCFF00";
  ctx.font = "900 42px 'Archivo Black', Impact, sans-serif";
  ctx.fillText("COBLO", 45, 80);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "700 20px 'JetBrains Mono', monospace";
  ctx.fillText("STREET HEAT AUDIT REPORT", 230, 75);

  const dateStr = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  ctx.font = "700 18px 'JetBrains Mono', monospace";
  ctx.fillStyle = "#00D4FF";
  ctx.fillText(dateStr.toUpperCase(), width - 230, 75);

  // 4. Street name banner
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(20, 125, width - 40, 55);
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#000000";
  ctx.strokeRect(20, 125, width - 40, 55);

  ctx.fillStyle = "#000000";
  ctx.font = "700 18px 'JetBrains Mono', monospace";
  ctx.fillText(`LOCATION: ${sourceName.toUpperCase()}`, 40, 160);

  // 5. Image Thumbnails (Original Photo + Segmentation Mask side-by-side)
  const imgW = 490;
  const imgH = 340;

  // Draw original photo
  ctx.save();
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 6;
  ctx.strokeRect(30, 200, imgW, imgH);
  ctx.drawImage(baseBitmap, 30, 200, imgW, imgH);
  ctx.fillStyle = "#000000";
  ctx.fillRect(30, 200, 160, 36);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "700 14px 'JetBrains Mono', monospace";
  ctx.fillText("RAW CAPTURE", 45, 224);
  ctx.restore();

  // Draw overlay image
  const tempOverlayCanvas = document.createElement("canvas");
  tempOverlayCanvas.width = baseBitmap.width;
  tempOverlayCanvas.height = baseBitmap.height;
  const tempCtx = tempOverlayCanvas.getContext("2d");
  if (tempCtx) {
    tempCtx.drawImage(baseBitmap, 0, 0);
    const overlayImgData = renderOverlay(
      labelMap,
      baseBitmap.width,
      baseBitmap.height
    );
    const overlayMaskCanvas = document.createElement("canvas");
    overlayMaskCanvas.width = baseBitmap.width;
    overlayMaskCanvas.height = baseBitmap.height;
    const mCtx = overlayMaskCanvas.getContext("2d");
    if (mCtx) {
      mCtx.putImageData(overlayImgData, 0, 0);
      tempCtx.globalAlpha = 0.85;
      tempCtx.drawImage(overlayMaskCanvas, 0, 0);
    }
  }

  ctx.save();
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 6;
  ctx.strokeRect(560, 200, imgW, imgH);
  ctx.drawImage(tempOverlayCanvas, 560, 200, imgW, imgH);
  ctx.fillStyle = "#000000";
  ctx.fillRect(560, 200, 160, 36);
  ctx.fillStyle = "#CCFF00";
  ctx.font = "700 14px 'JetBrains Mono', monospace";
  ctx.fillText("SEGFORMER-B0", 575, 224);
  ctx.restore();

  // 6. Big Stats Cards Area
  // Grade Stamp Card (Left)
  ctx.save();
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(30, 565, 300, 300);
  ctx.lineWidth = 6;
  ctx.strokeStyle = "#000000";
  ctx.strokeRect(30, 565, 300, 300);

  // Grade badge header
  ctx.fillStyle = "#00D4FF";
  ctx.fillRect(30, 565, 300, 45);
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 4;
  ctx.strokeRect(30, 565, 300, 45);
  ctx.fillStyle = "#000000";
  ctx.font = "800 16px 'JetBrains Mono', monospace";
  ctx.fillText("HEAT REPORT CARD", 60, 595);

  // Stamped Grade Square
  const gradeColors: Record<string, string> = {
    A: "#CCFF00",
    B: "#00E676",
    C: "#FF6B1A",
    D: "#FF6B1A",
    F: "#FF2E93",
  };
  ctx.save();
  ctx.translate(180, 735);
  ctx.rotate(-0.06);
  ctx.fillStyle = gradeColors[metrics.grade] || "#D9D6CC";
  ctx.fillRect(-85, -85, 170, 170);
  ctx.lineWidth = 8;
  ctx.strokeStyle = "#000000";
  ctx.strokeRect(-85, -85, 170, 170);

  ctx.fillStyle = "#000000";
  ctx.font = "900 110px 'Archivo Black', Impact, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(metrics.grade, 0, -8);

  ctx.font = "700 14px 'JetBrains Mono', monospace";
  ctx.fillText("GRADE", 0, 60);
  ctx.restore();
  ctx.restore();

  // Uplift Card (Center/Right)
  ctx.save();
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(355, 565, 695, 300);
  ctx.lineWidth = 6;
  ctx.strokeStyle = "#000000";
  ctx.strokeRect(355, 565, 695, 300);

  ctx.fillStyle = "#FF2E93";
  ctx.fillRect(355, 565, 695, 45);
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 4;
  ctx.strokeRect(355, 565, 695, 45);
  ctx.fillStyle = "#000000";
  ctx.font = "800 16px 'JetBrains Mono', monospace";
  ctx.fillText("ESTIMATED SURFACE HEAT UPLIFT", 380, 595);

  // Large Temp readout
  ctx.fillStyle = "#000000";
  ctx.font = "900 84px 'Archivo Black', Impact, sans-serif";
  ctx.fillText(`+${metrics.upliftC.toFixed(1)}°C`, 380, 700);

  ctx.font = "700 18px 'JetBrains Mono', monospace";
  ctx.fillStyle = "#000000";
  ctx.fillText(
    "Afternoon surface heating above a fully-shaded reference block",
    380,
    745
  );

  // Green View Index bar
  ctx.fillStyle = "#F5F2E8";
  ctx.fillRect(380, 775, 645, 65);
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 3;
  ctx.strokeRect(380, 775, 645, 65);

  ctx.fillStyle = "#000000";
  ctx.font = "700 16px 'JetBrains Mono', monospace";
  ctx.fillText("GREEN VIEW INDEX (GVI):", 400, 815);

  ctx.font = "900 24px 'Archivo Black', sans-serif";
  ctx.fillStyle = "#008f40";
  ctx.fillText(`${(metrics.gvi * 100).toFixed(1)}%`, 660, 815);
  ctx.restore();

  // 7. Ground Cover Composition Strip
  ctx.save();
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(30, 890, 1020, 240);
  ctx.lineWidth = 6;
  ctx.strokeStyle = "#000000";
  ctx.strokeRect(30, 890, 1020, 240);

  ctx.fillStyle = "#CCFF00";
  ctx.fillRect(30, 890, 1020, 45);
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 4;
  ctx.strokeRect(30, 890, 1020, 45);
  ctx.fillStyle = "#000000";
  ctx.font = "800 16px 'JetBrains Mono', monospace";
  ctx.fillText("GROUND COVER COMPOSITION BREAKDOWN", 50, 920);

  // Composition bar drawing
  const barX = 50;
  const barY = 960;
  const barW = 980;
  const barH = 50;

  ctx.fillStyle = "#D9D6CC";
  ctx.fillRect(barX, barY, barW, barH);
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 4;
  ctx.strokeRect(barX, barY, barW, barH);

  const colors: Record<string, string> = {
    CANOPY: "#00E676",
    LOW_GREEN: "#CCFF00",
    PAVED: "#FF2E93",
    BUILT: "#B14EFF",
    BARE: "#FF6B1A",
    WATER: "#0066FF",
    OTHER: "#A6A29A",
  };

  let curX = barX;
  const pcts = metrics.groundPercentages;
  for (const [key, pct] of Object.entries(pcts)) {
    if (pct <= 0) continue;
    const segW = (pct / 100) * barW;
    ctx.fillStyle = colors[key] || "#8C887E";
    ctx.fillRect(curX, barY, segW, barH);
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;
    ctx.strokeRect(curX, barY, segW, barH);

    if (segW >= 50) {
      ctx.fillStyle = "#000000";
      ctx.font = "800 14px 'JetBrains Mono', monospace";
      ctx.fillText(`${Math.round(pct)}%`, curX + 10, barY + 32);
    }
    curX += segW;
  }

  // Legend swatches
  let swatchX = 50;
  const swatchY = 1045;
  for (const [key, pct] of Object.entries(pcts)) {
    if (pct <= 0) continue;
    ctx.fillStyle = colors[key] || "#8C887E";
    ctx.fillRect(swatchX, swatchY, 20, 20);
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.strokeRect(swatchX, swatchY, 20, 20);

    ctx.fillStyle = "#000000";
    ctx.font = "700 14px 'JetBrains Mono', monospace";
    ctx.fillText(`${key}: ${pct}%`, swatchX + 28, swatchY + 16);
    swatchX += 175;
    if (swatchX > 900) break;
  }
  ctx.restore();

  // 8. Bottom Prescription & Attribution Banner
  ctx.save();
  ctx.fillStyle = "#000000";
  ctx.fillRect(30, 1150, 1020, 160);

  ctx.fillStyle = "#CCFF00";
  ctx.font = "900 24px 'Archivo Black', Impact, sans-serif";
  ctx.fillText("COOLING PRESCRIPTION:", 55, 1195);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "700 16px 'JetBrains Mono', monospace";
  if (metrics.treesNeeded > 0) {
    ctx.fillText(
      `Target: Add ~${metrics.treesNeeded} street trees (+${metrics.canopyGapPp.toFixed(1)}% canopy) to achieve Grade B.`,
      55,
      1235
    );
  } else {
    ctx.fillText(
      "Street demonstrates excellent canopy cover and cooling resilience.",
      55,
      1235
    );
  }

  ctx.fillStyle = "#00D4FF";
  ctx.font = "700 14px 'JetBrains Mono', monospace";
  ctx.fillText(
    "AUDITED ON-DEVICE VIA SEGFORMER-B0 / ADE20K · 0 BYTES OF IMAGE DATA UPLOADED",
    55,
    1280
  );

  ctx.fillStyle = "#CCFF00";
  ctx.fillText("https://coblo.vercel.app", 800, 1280);
  ctx.restore();

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to export report card to PNG blob."));
      },
      "image/png",
      0.95
    );
  });
}
