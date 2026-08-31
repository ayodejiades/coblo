import { pipeline, env, RawImage } from "@huggingface/transformers";
import { RawMask, SegResult, WorkerMsg, WorkerReq } from "../types/seg";

// Configure Transformers.js for browser environment
env.allowLocalModels = false;
if (env.backends?.onnx?.wasm) {
  env.backends.onnx.wasm.numThreads = 1;
}

let segmenterInstance: any = null;
let currentDevice: "webgpu" | "wasm" = "wasm";
let initPromise: Promise<any> | null = null;
const modelId = "Xenova/segformer-b0-finetuned-ade-512-512";

const progressCallback = (p: any) => {
  self.postMessage({
    type: "progress",
    status: p.status,
    loaded: p.loaded,
    total: p.total,
    progress: p.progress !== undefined ? p.progress * 100 : undefined,
    file: p.file,
  } as WorkerMsg);
};

async function createWasmPipeline() {
  currentDevice = "wasm";
  segmenterInstance = await pipeline("image-segmentation", modelId, {
    device: "wasm",
    dtype: "q8",
    progress_callback: progressCallback,
  });
  return segmenterInstance;
}

async function getSegmenter() {
  if (segmenterInstance) return segmenterInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    // Thoroughly probe WebGPU adapter support
    let hasWebGPU = false;
    try {
      if (
        typeof navigator !== "undefined" &&
        "gpu" in navigator &&
        typeof (navigator as any).gpu?.requestAdapter === "function"
      ) {
        const adapter = await (navigator as any).gpu.requestAdapter();
        if (adapter) {
          hasWebGPU = true;
        }
      }
    } catch {
      hasWebGPU = false;
    }

    if (hasWebGPU) {
      try {
        segmenterInstance = await pipeline("image-segmentation", modelId, {
          device: "webgpu",
          dtype: "fp32",
          progress_callback: progressCallback,
        });
        currentDevice = "webgpu";
      } catch (webgpuInitErr: any) {
        console.warn(
          "WebGPU pipeline build failed, falling back to WASM:",
          webgpuInitErr?.message || webgpuInitErr
        );
        segmenterInstance = await createWasmPipeline();
      }
    } else {
      segmenterInstance = await createWasmPipeline();
    }

    self.postMessage({
      type: "ready",
      device: currentDevice,
    } as WorkerMsg);

    return segmenterInstance;
  })();

  return initPromise;
}

self.onmessage = async (event: MessageEvent<WorkerReq>) => {
  const req = event.data;

  if (req.type === "init") {
    try {
      await getSegmenter();
    } catch (err: any) {
      self.postMessage({
        type: "error",
        message: `Failed to initialize segmentation model: ${err.message || String(err)}`,
      } as WorkerMsg);
    }
    return;
  }

  if (req.type === "segment") {
    const { id, buffer, width, height, mimeType } = req;
    const t0 = performance.now();

    try {
      let segmenter = await getSegmenter();

      // Convert buffer back to Blob and RawImage
      const blob = new Blob([buffer], { type: mimeType || "image/jpeg" });
      const rawImage = await RawImage.fromBlob(blob);

      // Run inference with WebGPU -> WASM fallback if runtime inference fails
      let rawOutputs: any;
      try {
        rawOutputs = await segmenter(rawImage);
      } catch (inferErr: any) {
        if (currentDevice === "webgpu") {
          console.warn(
            "WebGPU inference failed at runtime, re-initializing on WASM fallback:",
            inferErr?.message || inferErr
          );
          segmenter = await createWasmPipeline();
          rawOutputs = await segmenter(rawImage);
        } else {
          throw inferErr;
        }
      }

      const elapsedMs = Math.round(performance.now() - t0);
      const totalPixels = width * height;
      const minPixelThreshold = Math.max(10, Math.floor(totalPixels * 0.001)); // 0.1% threshold

      const masks: RawMask[] = [];
      const transferBuffers: ArrayBuffer[] = [];

      for (const item of rawOutputs) {
        const maskData = item.mask.data as Uint8Array;
        const maskW = item.mask.width;
        const maskH = item.mask.height;

        let nonZero = 0;
        for (let i = 0; i < maskData.length; i++) {
          if (maskData[i] > 127) nonZero++;
        }

        if (nonZero >= minPixelThreshold || nonZero > 100) {
          const bufferCopy = maskData.slice().buffer;
          masks.push({
            label: (item.label || "unknown").toLowerCase().trim(),
            width: maskW,
            height: maskH,
            data: new Uint8Array(bufferCopy),
          });
          transferBuffers.push(bufferCopy);
        }
      }

      const result: SegResult = {
        masks,
        width,
        height,
        ms: elapsedMs,
        device: currentDevice,
      };

      (self as any).postMessage(
        {
          type: "result",
          id,
          result,
        } as WorkerMsg,
        transferBuffers
      );
    } catch (err: any) {
      console.error("Worker segmentation error:", err);
      self.postMessage({
        type: "error",
        id,
        message: err.message || String(err),
      } as WorkerMsg);
    }
  }
};
