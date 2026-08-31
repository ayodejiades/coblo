export type ScanInput = {
  bitmap: ImageBitmap;
  previewUrl: string;
  width: number;
  height: number;
  sourceName: string;
  blob: Blob;
};

export type SampleStreet = {
  id: string;
  name: string;
  description: string;
  expectedGrade: "A" | "B" | "C" | "D" | "F";
  url: string;
  attribution: string;
};
