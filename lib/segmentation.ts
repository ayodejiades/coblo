import { SegResult, WorkerMsg, WorkerReq } from "@/types/seg";

export interface ProgressData {
  status: string;
  loaded?: number;
  total?: number;
  progress?: number;
  file?: string;
}

type ProgressCallback = (data: ProgressData) => void;

let worker: Worker | null = null;
let requestIdCounter = 0;
const pendingRequests = new Map<
  number,
  {
    resolve: (result: SegResult) => void;
    reject: (reason: Error) => void;
    timer: NodeJS.Timeout;
  }
>();
const progressListeners = new Set<ProgressCallback>();
let isInitialized = false;
let lastProgressData: ProgressData | null = null;

function getWorker(): Worker | null {
  if (typeof window === "undefined") return null;

  if (!worker) {
    try {
      worker = new Worker(new URL("../workers/segment.worker.ts", import.meta.url), {
        type: "module",
      });

      worker.onmessage = (event: MessageEvent<WorkerMsg>) => {
        const msg = event.data;

        if (msg.type === "progress") {
          lastProgressData = {
            status: msg.status,
            loaded: msg.loaded,
            total: msg.total,
            progress: msg.progress,
            file: msg.file,
          };
          for (const cb of progressListeners) {
            cb(lastProgressData);
          }
        } else if (msg.type === "ready") {
          isInitialized = true;
          lastProgressData = { status: "ready", progress: 100 };
          for (const cb of progressListeners) {
            cb(lastProgressData);
          }
        } else if (msg.type === "result") {
          const pending = pendingRequests.get(msg.id);
          if (pending) {
            clearTimeout(pending.timer);
            pendingRequests.delete(msg.id);
            pending.resolve(msg.result);
          }
        } else if (msg.type === "error") {
          if (msg.id !== undefined) {
            const pending = pendingRequests.get(msg.id);
            if (pending) {
              clearTimeout(pending.timer);
              pendingRequests.delete(msg.id);
              pending.reject(new Error(msg.message));
            }
          } else {
            console.error("Worker error:", msg.message);
          }
        }
      };

      worker.onerror = (err) => {
        console.error("Worker lifecycle error / termination:", err);
        const errObj = new Error(
          err.message || "Segmentation worker terminated unexpectedly (OOM, WebGPU, or ONNX crash)."
        );
        for (const [, pending] of pendingRequests.entries()) {
          clearTimeout(pending.timer);
          pending.reject(errObj);
        }
        pendingRequests.clear();
        worker = null;
        isInitialized = false;
      };
    } catch (e) {
      console.error("Failed to instantiate segmentation worker:", e);
      return null;
    }
  }

  return worker;
}

/**
 * Register a listener for model download / progress updates.
 * Fires immediately with the latest known progress state if available.
 */
export function onProgress(callback: ProgressCallback): () => void {
  progressListeners.add(callback);
  if (lastProgressData) {
    callback(lastProgressData);
  }
  return () => {
    progressListeners.delete(callback);
  };
}

/**
 * Returns whether the on-device model has finished initialization.
 */
export function isModelReady(): boolean {
  return isInitialized;
}

/**
 * Pre-warms the segmentation pipeline in the background.
 * Safe to call repeatedly.
 */
export function warmUp(): void {
  const w = getWorker();
  if (w && !isInitialized) {
    w.postMessage({ type: "init" } as WorkerReq);
  }
}

/**
 * Segments an image blob in the worker thread.
 */
export async function segmentImage(
  blob: Blob,
  width: number,
  height: number
): Promise<SegResult> {
  const w = getWorker();
  if (!w) {
    throw new Error("Web Worker could not be created in this environment.");
  }

  const id = ++requestIdCounter;
  const buffer = await blob.arrayBuffer();

  return new Promise<SegResult>((resolve, reject) => {
    const timer = setTimeout(() => {
      pendingRequests.delete(id);
      reject(
        new Error(
          "Segmentation timed out after 60 seconds. Please try a smaller image or reload."
        )
      );
    }, 60000);

    pendingRequests.set(id, { resolve, reject, timer });

    const req: WorkerReq = {
      type: "segment",
      id,
      buffer,
      width,
      height,
      mimeType: blob.type || "image/jpeg",
    };

    w.postMessage(req, [buffer]);
  });
}
