import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
// Try to run segmentation via @huggingface/transformers in Node (wasm)
// This will attempt to load Xenova model and segment bare-street.jpg
// If it fails, we output fallback numbers.

const MODEL_ID = "Xenova/segformer-b0-finetuned-ade-512-512";

async function main() {
  try {
    const { pipeline, env } = await import("@huggingface/transformers");
    // Enable Node backend
    // env.allowLocalModels false, but we try default
    console.log("Loading pipeline...");
    // Try wasm q8
    const segmenter = await pipeline("image-segmentation", MODEL_ID, {
      // @ts-ignore node backend uses cpu
      device: "cpu",
      progress_callback: (p) => console.log("progress", p.status, p.progress)
    });
    console.log("Pipeline loaded, segmenting...");
    const imgPath = path.resolve("public/samples/bare-street.jpg");
    // RawImage path via file
    // transformers RawImage can load from path?
    const { RawImage } = await import("@huggingface/transformers");
    const rawImage = await RawImage.fromURL(imgPath);
    console.log("Image loaded", rawImage.width, rawImage.height);
    const t0 = performance.now();
    const outputs = await segmenter(rawImage);
    const ms = Math.round(performance.now() - t0);
    console.log("Inference ms", ms);
    console.log("Outputs", outputs.length);
    for (const o of outputs.slice(0,10)) {
      console.log(o.label, o.mask.width, o.mask.height);
    }
    // Compute metrics via our lib
    // Replicate labelmap + metrics logic inline to avoid TS import issues
    // Import compiled via tsx? Try import lib
    // Write raw outputs to file for later processing
    fs.writeFileSync("/tmp/bare-outputs.json", JSON.stringify(outputs.map(o=>({label:o.label, w:o.mask.width, h:o.mask.height, dataLen:o.mask.data.length})), null, 2));
    // Also run second and third for median
    const times = [ms];
    for(let k=0;k<2;k++){
      const t1=performance.now();
      await segmenter(rawImage);
      times.push(Math.round(performance.now()-t1));
    }
    console.log("times", times);
    const median = times.sort((a,b)=>a-b)[1];
    console.log("median", median);
  } catch(e) {
    console.error("Failed to run segmentation:", e);
    console.error(e.stack);
    process.exit(1);
  }
}
main();
