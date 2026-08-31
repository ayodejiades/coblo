"use client";

import React, { useState, useEffect } from "react";
import { ScanInput } from "@/types/scan";
import { SegResult } from "@/types/seg";
import { Metrics } from "@/types/metrics";
import { buildLabelMapWithMeta } from "@/lib/labelmap";
import { computeMetrics, validateStreetMetrics } from "@/lib/metrics";
import { saveScanToHistory, createThumbnail } from "@/lib/history";
import { ImageDropzone } from "@/components/capture/ImageDropzone";
import { SamplePicker } from "@/components/capture/SamplePicker";
import { ScanHistory } from "@/components/history/ScanHistory";
import { ReportCard } from "@/components/result/ReportCard";
import { LoadingBar } from "@/components/ui/LoadingBar";
import { BrutCard } from "@/components/ui/BrutCard";
import { BrutButton } from "@/components/ui/BrutButton";
import { AlertTriangle, RotateCcw, ShieldCheck, Cpu, Camera, Trees } from "lucide-react";

type ScanState =
  | { k: "idle" }
  | { k: "loading-model"; input: ScanInput; progress: number; statusText: string }
  | { k: "segmenting"; input: ScanInput; elapsedSeconds: number }
  | {
      k: "done";
      input: ScanInput;
      seg: SegResult;
      labelMap: Uint8Array;
      metrics: Metrics;
    }
  | {
      k: "error";
      message: string;
      title?: string;
      isNonStreet?: boolean;
    };

export default function ScanPage() {
  const [state, setState] = useState<ScanState>({ k: "idle" });
  const [modelProgress, setModelProgress] = useState<number>(0);
  const [modelStatusText, setModelStatusText] = useState<string>("INITIALIZING ON-DEVICE ENGINE...");

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    if (typeof window !== "undefined") {
      import("@/lib/segmentation").then(({ warmUp, onProgress, isModelReady }) => {
        warmUp();
        if (isModelReady()) {
          setModelProgress(100);
          setModelStatusText("SEGFORMER-B0 ON-DEVICE ENGINE READY");
        }

        unsubscribe = onProgress((p) => {
          const currentPct = p.progress !== undefined ? Math.round(p.progress) : undefined;
          if (currentPct !== undefined) {
            setModelProgress(currentPct);
          }

          let text = "INITIALIZING SEGFORMER-B0 ON-DEVICE ENGINE...";
          if (p.file) {
            const fileName = p.file.split("/").pop() || p.file;
            text = `DOWNLOADING ${fileName.toUpperCase()}${currentPct !== undefined ? ` (${currentPct}%)` : ""}...`;
          } else if (p.status === "ready") {
            text = "SEGFORMER-B0 ON-DEVICE ENGINE READY";
          } else if (p.status) {
            text = `PREPARING ON-DEVICE MODEL (${p.status.toUpperCase()})...`;
          }

          setModelStatusText(text);

          setState((prev) => {
            if (prev.k === "loading-model") {
              return {
                ...prev,
                progress: currentPct !== undefined ? currentPct : prev.progress,
                statusText: text,
              };
            }
            return prev;
          });
        });
      });
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleImageSelected = async (input: ScanInput) => {
    try {
      const { segmentImage, isModelReady } = await import("@/lib/segmentation");
      const ready = isModelReady();

      if (ready) {
        setState({ k: "segmenting", input, elapsedSeconds: 0 });
      } else {
        setState({
          k: "loading-model",
          input,
          progress: modelProgress > 0 ? modelProgress : 5,
          statusText: modelStatusText || "DOWNLOADING ON-DEVICE MODEL WEIGHTS (~14.7 MB)...",
        });
      }

      // Begin segmentation
      const segPromise = segmentImage(input.blob, input.width, input.height);

      // If model wasn't ready yet, poll until initialized to switch UI to segmenting
      let checkInterval: NodeJS.Timeout | null = null;
      if (!ready) {
        checkInterval = setInterval(() => {
          if (isModelReady()) {
            if (checkInterval) clearInterval(checkInterval);
            setState((prev) =>
              prev.k === "loading-model"
                ? { k: "segmenting", input, elapsedSeconds: 0 }
                : prev
            );
          }
        }, 150);
      }

      const segResult = await segPromise;
      if (checkInterval) clearInterval(checkInterval);

      // Build label map from masks and detect indoor/non-street pixel fraction
      const { labelMap, indoorFraction } = buildLabelMapWithMeta(
        segResult.masks,
        input.width,
        input.height
      );

      // Compute thermal and composition metrics
      const metrics = computeMetrics(labelMap, input.width, input.height);

      // Validate that this is a legitimate outdoor street scene
      const validation = validateStreetMetrics(metrics, indoorFraction);
      if (!validation.isValid) {
        setState({
          k: "error",
          title: validation.reason,
          message: validation.detail,
          isNonStreet: true,
        });
        return;
      }

      // Save to local history only if valid
      const thumb = createThumbnail(input.bitmap);
      saveScanToHistory({
        grade: metrics.grade,
        upliftC: metrics.upliftC,
        gvi: metrics.gvi,
        thumbnailDataUrl: thumb,
        sourceName: input.sourceName,
      });

      setState({
        k: "done",
        input,
        seg: segResult,
        labelMap,
        metrics,
      });
    } catch (err: unknown) {
      console.error("Scan processing error:", err);
      const message =
        err instanceof Error ? err.message : "Failed to segment image on-device.";
      setState({ k: "error", message, title: "AUDIT PROCESSING ERROR" });
    }
  };

  const handleReset = () => {
    if (state.k === "done" && state.input.previewUrl) {
      URL.revokeObjectURL(state.input.previewUrl);
    }
    setState({ k: "idle" });
  };

  return (
    <main className="w-full min-h-[calc(100vh-80px)] py-6 sm:py-10 px-4 sm:px-8 max-w-[1120px] mx-auto flex flex-col gap-6">
      {/* State: Idle / Intake */}
      {state.k === "idle" && (
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="t-label bg-black text-[#CCFF00] px-2 py-0.5 font-bold">
                AUDIT ENGINE
              </span>
              <span className="t-label text-black/70 font-mono">100% CLIENT-SIDE · WEBGPU / WASM</span>
            </div>
            <h1 className="t-h1 text-black font-black">AUDIT YOUR STREET</h1>
            <p className="t-body text-black/80 font-mono text-sm sm:text-base max-w-2xl font-medium">
              Upload a street photo or choose a sample. SegFormer segments every pixel
              directly inside your browser to calculate your block&apos;s heat score.
            </p>
          </div>

          <ImageDropzone
            onImageSelected={handleImageSelected}
            onError={(msg) => setState({ k: "error", message: msg, title: "IMAGE INTAKE REJECTED" })}
          />

          <SamplePicker
            onSelect={handleImageSelected}
            onError={(msg) => setState({ k: "error", message: msg, title: "SAMPLE LOAD ERROR" })}
          />

          <ScanHistory />

          {/* Privacy flex banner */}
          <div className="bg-white border-[3px] border-black p-4 shadow-[4px_4px_0_0_#000] flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-[#008f40] shrink-0" />
            <div className="font-mono text-xs text-black font-bold uppercase tracking-wider">
              PRIVACY PROMISE: 0 BYTES OF IMAGE DATA ARE EVER TRANSMITTED TO A SERVER. INFERENCE
              RUNS 100% LOCALLY VIA WEBGPU / WASM.
            </div>
          </div>
        </div>
      )}

      {/* State: Loading Model */}
      {state.k === "loading-model" && (
        <div className="py-12 flex flex-col items-center justify-center max-w-xl mx-auto w-full gap-6">
          <BrutCard title="DOWNLOADING NEURAL ENGINE" headerAccent="acid" className="w-full" borderHeavy>
            <div className="flex flex-col gap-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#CCFF00] border-[3px] border-black shadow-[3px_3px_0_0_#000] flex items-center justify-center text-black">
                  <Cpu className="w-7 h-7 stroke-[2.5]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-mono font-bold text-sm text-black">
                    SEGFORMER-B0 ONNX (~14.7 MB)
                  </span>
                  <span className="font-mono text-xs text-black/70">
                    Downloaded once &amp; persistently cached in browser CacheStorage.
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <LoadingBar
                  label="DOWNLOADING WEIGHTS"
                  progress={state.progress}
                  statusText={state.statusText}
                />
              </div>
            </div>
          </BrutCard>
        </div>
      )}

      {/* State: Segmenting */}
      {state.k === "segmenting" && (
        <div className="py-12 flex flex-col items-center justify-center max-w-xl mx-auto w-full gap-6">
          <BrutCard title="RUNNING ON-DEVICE INFERENCE" headerAccent="hot" className="w-full" borderHeavy>
            <div className="flex flex-col gap-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#FF2E93] border-[3px] border-black shadow-[3px_3px_0_0_#000] flex items-center justify-center text-white">
                  <Camera className="w-7 h-7 stroke-[2.5]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-mono font-bold text-sm text-black">
                    CLASSIFYING 150 ADE20K SURFACES
                  </span>
                  <span className="font-mono text-xs text-black/70">
                    Executing neural pipeline locally via WebGPU / WASM SIMD.
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <LoadingBar
                  label="NEURAL SEGMENTATION"
                  progress={85}
                  statusText="EXTRACTING THERMAL CONTINUUM &amp; CANOPY COVER..."
                />
              </div>
            </div>
          </BrutCard>
        </div>
      )}

      {/* State: Done (Report Card) */}
      {state.k === "done" && (
        <ReportCard
          input={state.input}
          segResult={state.seg}
          metrics={state.metrics}
          labelMap={state.labelMap}
          onReset={handleReset}
        />
      )}

      {/* State: Error / Street Scene Rejected */}
      {state.k === "error" && (
        <div className="py-12 flex flex-col items-center justify-center max-w-xl mx-auto w-full gap-6">
          <BrutCard
            title={state.title || "AUDIT FAILED"}
            headerAccent="hot"
            className="w-full"
            borderHeavy
            shadow="lg"
          >
            <div className="flex flex-col gap-5 py-2">
              <div className="flex items-start gap-4 bg-[#FF2E93]/10 border-[2px] border-[#FF2E93] p-4">
                <AlertTriangle className="w-8 h-8 text-[#FF2E93] shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1.5 font-mono">
                  <span className="font-black text-black text-sm uppercase">
                    {state.isNonStreet ? "NON-STREET SCENE DETECTED" : "PROCESSING INCOMPLETE"}
                  </span>
                  <p className="text-xs text-black/90 leading-relaxed font-medium">
                    {state.message}
                  </p>
                </div>
              </div>

              {state.isNonStreet && (
                <div className="bg-[#F5F2E8] border-[2px] border-black p-3.5 flex flex-col gap-2 font-mono text-xs text-black">
                  <span className="font-bold flex items-center gap-1.5 text-black">
                    <Trees className="w-4 h-4 text-[#008f40]" />
                    HOW TO CAPTURE A VALID STREET AUDIT:
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-black/80 pl-1">
                    <li>Stand on a sidewalk or road facing down the block corridor.</li>
                    <li>Ensure ground pavement and trees/sky are visible in view.</li>
                    <li>Avoid indoor rooms, documents, close-up objects, or pure sky shots.</li>
                  </ul>
                </div>
              )}

              <div className="flex items-center justify-end pt-2 border-t-[2px] border-black">
                <BrutButton variant="ink" size="md" onClick={() => setState({ k: "idle" })}>
                  <RotateCcw className="w-4 h-4 mr-1.5 stroke-[2.5]" />
                  TRY ANOTHER PHOTO
                </BrutButton>
              </div>
            </div>
          </BrutCard>
        </div>
      )}
    </main>
  );
}
