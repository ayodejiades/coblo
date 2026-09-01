import fs from 'fs';
import path from 'path';
import { pipeline, RawImage } from "@huggingface/transformers";

const MODEL_ID = "Xenova/segformer-b0-finetuned-ade-512-512";

async function main(){
  const segmenter = await pipeline("image-segmentation", MODEL_ID, {device:"cpu"});
  const imgPath = path.resolve("public/samples/bare-street.jpg");
  const rawImage = await RawImage.fromURL(imgPath);
  console.log(`Image ${rawImage.width}x${rawImage.height}`);
  const times=[];
  let finalOutputs=null;
  for(let i=0;i<3;i++){
    const t0=performance.now();
    const outs = await segmenter(rawImage);
    const ms=Math.round(performance.now()-t0);
    times.push(ms);
    console.log(`Run ${i+1}: ${ms}ms, ${outs.length} classes`);
    for(const o of outs){
      let cnt=0;
      const d=o.mask.data;
      for(let k=0;k<d.length;k++) if(d[k]>127) cnt++;
      console.log(`  ${o.label}: ${cnt} pixels (${(cnt/(o.mask.width*o.mask.height)*100).toFixed(2)}%)`);
    }
    finalOutputs=outs;
  }
  times.sort((a,b)=>a-b);
  console.log("times sorted", times, "median", times[1]);

  // Now compute metrics via our lib logic
  // Import mapping
  const { ADE_TO_CB, CLASS_INDEX_MAP, PRIORITY } = await import("../lib/classes.ts").catch(async()=> {
    // fallback inline mapping
    return {
      ADE_TO_CB: { tree:"CANOPY", palm:"CANOPY", grass:"LOW_GREEN", plant:"LOW_GREEN", flower:"LOW_GREEN", field:"LOW_GREEN", road:"PAVED", sidewalk:"PAVED", path:"PAVED", runway:"PAVED", floor:"PAVED", stairs:"PAVED", building:"BUILT", house:"BUILT", skyscraper:"BUILT", wall:"BUILT", fence:"BUILT", hovel:"BUILT", tower:"BUILT", bridge:"BUILT", awning:"BUILT", roof:"BUILT", earth:"BARE", sand:"BARE", dirt:"BARE", rock:"BARE", hill:"BARE", mountain:"BARE", water:"WATER", sea:"WATER", river:"WATER", lake:"WATER", pool:"WATER", fountain:"WATER", sky:"SKY", car:"TRANSIENT", truck:"TRANSIENT", bus:"TRANSIENT", van:"TRANSIENT", person:"TRANSIENT", bicycle:"TRANSIENT", motorbike:"TRANSIENT", boat:"TRANSIENT", pole:"TRANSIENT", streetlight:"TRANSIENT", signboard:"TRANSIENT", "traffic light":"TRANSIENT", ashcan:"TRANSIENT", bench:"TRANSIENT" },
      CLASS_INDEX_MAP: {CANOPY:0,LOW_GREEN:1,PAVED:2,BUILT:3,BARE:4,WATER:5,SKY:6,TRANSIENT:7,UNKNOWN:8},
      PRIORITY: ["UNKNOWN","SKY","BARE","PAVED","BUILT","WATER","LOW_GREEN","CANOPY","TRANSIENT"]
    };
  });

  // Build labelMap similar to lib/labelmap
  // Use stub imports if dynamic import fails due to TS
  // Let's use JS implementation
  const CB_CLASSES = ["CANOPY","LOW_GREEN","PAVED","BUILT","BARE","WATER","SKY","TRANSIENT","UNKNOWN"];
  const CLASS_IDX = {CANOPY:0,LOW_GREEN:1,PAVED:2,BUILT:3,BARE:4,WATER:5,SKY:6,TRANSIENT:7,UNKNOWN:8};
  const ADE_TO_CB2 = {
    tree:"CANOPY", palm:"CANOPY", treehouse:"CANOPY",
    grass:"LOW_GREEN", plant:"LOW_GREEN", flower:"LOW_GREEN", field:"LOW_GREEN", flora:"LOW_GREEN", shrub:"LOW_GREEN", bush:"LOW_GREEN",
    road:"PAVED", route:"PAVED", sidewalk:"PAVED", pavement:"PAVED", path:"PAVED", runway:"PAVED", floor:"PAVED", flooring:"PAVED", stairs:"PAVED", step:"PAVED", curb:"PAVED", crosswalk:"PAVED", driveway:"PAVED",
    building:"BUILT", edifice:"BUILT", house:"BUILT", skyscraper:"BUILT", wall:"BUILT", fence:"BUILT", fencing:"BUILT", hovel:"BUILT", hut:"BUILT", tower:"BUILT", bridge:"BUILT", awning:"BUILT", sunshade:"BUILT", roof:"BUILT", canopy:"BUILT", column:"BUILT", pillar:"BUILT", grandstand:"BUILT",
    earth:"BARE", ground:"BARE", land:"BARE", soil:"BARE", sand:"BARE", dirt:"BARE", rock:"BARE", stone:"BARE", hill:"BARE", mountain:"BARE", gravel:"BARE",
    water:"WATER", sea:"WATER", river:"WATER", lake:"WATER", pool:"WATER", fountain:"WATER", pond:"WATER", stream:"WATER",
    sky:"SKY",
    car:"TRANSIENT", automobile:"TRANSIENT", truck:"TRANSIENT", bus:"TRANSIENT", minibus:"TRANSIENT", van:"TRANSIENT", vehicle:"TRANSIENT", person:"TRANSIENT", individual:"TRANSIENT", pedestrian:"TRANSIENT", bicycle:"TRANSIENT", bike:"TRANSIENT", minibike:"TRANSIENT", motorbike:"TRANSIENT", motorcycle:"TRANSIENT", boat:"TRANSIENT", pole:"TRANSIENT", post:"TRANSIENT", streetlight:"TRANSIENT", streetlamp:"TRANSIENT", signboard:"TRANSIENT", sign:"TRANSIENT", "traffic light":"TRANSIENT", ashcan:"TRANSIENT", trash:"TRANSIENT", bench:"TRANSIENT", chair:"TRANSIENT", table:"TRANSIENT",
  };
  const PRIORITY2 = ["UNKNOWN","SKY","BARE","PAVED","BUILT","WATER","LOW_GREEN","CANOPY","TRANSIENT"];
  const mapped = finalOutputs.map(m=>{
    const clean=m.label.toLowerCase().split(",")[0].trim();
    const cb=ADE_TO_CB2[clean]||"UNKNOWN";
    const pri=PRIORITY2.indexOf(cb);
    return {mask:m.mask, label:m.label, cb, pri, classIdx:CLASS_IDX[cb]};
  });
  mapped.sort((a,b)=>a.pri-b.pri);
  const W=rawImage.width, H=rawImage.height;
  const total=W*H;
  const labelMap=new Uint8Array(total);
  labelMap.fill(CLASS_IDX.UNKNOWN);
  for(const item of mapped){
    const {mask, classIdx}=item;
    const maskW=mask.width, maskH=mask.height;
    const data=mask.data;
    if(maskW===W && maskH===H){
      for(let i=0;i<total;i++) if(data[i]>127) labelMap[i]=classIdx;
    } else {
      // nearest neighbor
      const sx=maskW/W, sy=maskH/H;
      for(let y=0;y<H;y++){
        const syI=Math.min(maskH-1, Math.floor(y*sy));
        for(let x=0;x<W;x++){
          const sxI=Math.min(maskW-1, Math.floor(x*sx));
          if(data[syI*maskW+sxI]>127) labelMap[y*W+x]=classIdx;
        }
      }
    }
  }
  // histogram
  const counts=new Array(9).fill(0);
  for(let i=0;i<total;i++) counts[labelMap[i]]++;
  console.log("counts", counts.map((c,i)=>`${CB_CLASSES[i]}:${c}(${(c/total*100).toFixed(2)}%)`).join(", "));
  const rawFractions={};
  for(let i=0;i<9;i++) rawFractions[CB_CLASSES[i]]=counts[i]/total;
  const gvi= (counts[CLASS_IDX.CANOPY]+counts[CLASS_IDX.LOW_GREEN])/total;
  const nonGround=counts[CLASS_IDX.SKY]+counts[CLASS_IDX.TRANSIENT]+counts[CLASS_IDX.UNKNOWN];
  const groundTotal=Math.max(0, total-nonGround);
  const ground={};
  for(const cls of CB_CLASSES) ground[cls]=0;
  if(groundTotal>0){
    for(let i=0;i<9;i++){
      const cls=CB_CLASSES[i];
      if(cls!=="SKY" && cls!=="TRANSIENT" && cls!=="UNKNOWN") ground[cls]=counts[i]/groundTotal;
    }
  }
  const UPLIFT={PAVED:8.5,BUILT:5.0,BARE:4.0,LOW_GREEN:1.5,CANOPY:0.0,WATER:-1.0,SKY:0,TRANSIENT:0,UNKNOWN:0};
  let uplift=0;
  for(const cls of CB_CLASSES) if(cls!=="SKY" && cls!=="TRANSIENT" && cls!=="UNKNOWN") uplift+=ground[cls]*(UPLIFT[cls]||0);
  uplift=Math.max(0, Math.round(uplift*10)/10);
  const GRADE_BANDS=[{max:1.5,grade:"A"},{max:3.0,grade:"B"},{max:4.5,grade:"C"},{max:6.0,grade:"D"},{max:Infinity,grade:"F"}];
  let grade="F";
  for(const b of GRADE_BANDS) if(uplift<=b.max){grade=b.grade;break;}
  const canopyGapPp = uplift>3.0 ? Math.round(Math.min(ground.PAVED||0, (uplift-3.0)/8.5)*1000)/10 : 0;
  const treesNeeded=canopyGapPp>0?Math.ceil(canopyGapPp/3.33):0;
  const simulatedUplift = (()=>{ if(canopyGapPp<=0) return uplift; let simU=0; const simGround={...ground}; const add=canopyGapPp/100; simGround.PAVED=Math.max(0,(ground.PAVED||0)-add); simGround.CANOPY=(ground.CANOPY||0)+add; for(const cls of CB_CLASSES) if(cls!=="SKY" && cls!=="TRANSIENT" && cls!=="UNKNOWN") simU+=simGround[cls]*(UPLIFT[cls]||0); return Math.max(0, Math.round(simU*10)/10);})();
  // compute gvi pct
  console.log("metrics:", {gvi: (gvi*100).toFixed(1), uplift, grade, groundPaved: Math.round((ground.PAVED||0)*100), groundCanopy: Math.round((ground.CANOPY||0)*100), treesNeeded, canopyGapPp, times, median: times[1]});
  // simulate to B grade
  const PP_PER_TREE=3.33;
  const simTreesNeeded=treesNeeded;
  const costMin=Math.max(1200, simTreesNeeded*400), costMax=Math.max(2500, simTreesNeeded*750);
  console.log(`cost $${costMin.toLocaleString()} – $${costMax.toLocaleString()}`);

  // Now test simulated to max canopy scenario as per numbers.json simulated fields: we need simulated uplift at max slider, which may be 40% etc. But our numbers.json expects simulatedUpliftC for full slider (trees to reach B). That's ~3.0 or 2.1 example.
  // Let's compute max slider 40%?
  // For now output json
  const outJson = {
    grade,
    upliftC: uplift.toFixed(1),
    gviPct: (gvi*100).toFixed(1),
    pavedPct: String(Math.round((ground.PAVED||0)*100)),
    canopyPct: String(Math.round((ground.CANOPY||0)*100)),
    treesNeeded: String(treesNeeded),
    simulatedUpliftC: simulatedUplift.toFixed(1),
    simulatedGrade: (()=>{ for(const b of GRADE_BANDS) if(simulatedUplift<=b.max) return b.grade; return "F"})(),
    costEstimate: `$${costMin.toLocaleString()} – $${costMax.toLocaleString()}`,
    inferenceMs: String(times[1]),
    inferenceSeconds: (times[1]/1000).toFixed(1)
  };
  console.log("numbers.json", JSON.stringify(outJson,null,2));
  fs.writeFileSync("/tmp/numbers-observed.json", JSON.stringify(outJson,null,2));
}

main().catch(e=>{console.error(e); process.exit(1)});
