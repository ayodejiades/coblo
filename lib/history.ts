import { GradeType } from "@/components/ui/GradeStamp";

export type HistoryEntry = {
  id: string;
  ts: number;
  grade: GradeType;
  upliftC: number;
  gvi: number;
  thumbnailDataUrl: string;
  sourceName: string;
};

const STORAGE_KEY = "coblo.history.v1";
const MAX_ENTRIES = 20;

export function loadScanHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn("Could not read scan history from localStorage:", err);
    return [];
  }
}

export function saveScanToHistory(entry: Omit<HistoryEntry, "id" | "ts">): void {
  if (typeof window === "undefined") return;
  try {
    const existing = loadScanHistory();
    const newEntry: HistoryEntry = {
      ...entry,
      id: `scan-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      ts: Date.now(),
    };

    const updated = [newEntry, ...existing].slice(0, MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn("Could not persist scan to localStorage:", err);
  }
}

export function clearScanHistory(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn("Could not clear scan history:", err);
  }
}

/**
 * Creates a lightweight 240px wide JPEG data URL thumbnail from an ImageBitmap.
 */
export function createThumbnail(bitmap: ImageBitmap, targetWidth = 240): string {
  try {
    const canvas = document.createElement("canvas");
    const aspect = bitmap.height / bitmap.width;
    canvas.width = targetWidth;
    canvas.height = Math.round(targetWidth * aspect);
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.6);
  } catch (e) {
    console.warn("Thumbnail generation failed:", e);
    return "";
  }
}
