export type RawMask = {
  label: string; // ADE20K class name, lowercased
  width: number;
  height: number;
  data: Uint8Array; // length = width*height, 0 or 255
};

export type SegResult = {
  masks: RawMask[];
  width: number;
  height: number;
  ms: number;
  device: "webgpu" | "wasm";
};

export type WorkerMsg =
  | {
      type: "progress";
      status: string;
      loaded?: number;
      total?: number;
      progress?: number;
      file?: string;
    }
  | { type: "ready"; device: "webgpu" | "wasm" }
  | { type: "result"; id: number; result: SegResult }
  | { type: "error"; id?: number; message: string };

export type WorkerReq =
  | { type: "init" }
  | {
      type: "segment";
      id: number;
      buffer: ArrayBuffer;
      width: number;
      height: number;
      mimeType: string;
    };
