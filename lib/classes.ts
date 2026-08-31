export const CB_CLASSES = [
  "CANOPY",
  "LOW_GREEN",
  "PAVED",
  "BUILT",
  "BARE",
  "WATER",
  "SKY",
  "TRANSIENT",
  "UNKNOWN",
] as const;

export type CBClass = (typeof CB_CLASSES)[number];

export const ADE_TO_CB: Record<string, CBClass> = {
  // Tree Canopy
  tree: "CANOPY",
  palm: "CANOPY",
  treehouse: "CANOPY",

  // Low Vegetation / Grass
  grass: "LOW_GREEN",
  plant: "LOW_GREEN",
  flower: "LOW_GREEN",
  field: "LOW_GREEN",
  flora: "LOW_GREEN",
  shrub: "LOW_GREEN",
  bush: "LOW_GREEN",

  // Paved surfaces (impervious ground heat sinks)
  road: "PAVED",
  route: "PAVED",
  sidewalk: "PAVED",
  pavement: "PAVED",
  path: "PAVED",
  runway: "PAVED",
  floor: "PAVED",
  flooring: "PAVED",
  stairs: "PAVED",
  step: "PAVED",
  curb: "PAVED",
  crosswalk: "PAVED",
  driveway: "PAVED",

  // Built infrastructure / vertical mass
  building: "BUILT",
  edifice: "BUILT",
  house: "BUILT",
  skyscraper: "BUILT",
  wall: "BUILT",
  fence: "BUILT",
  fencing: "BUILT",
  hovel: "BUILT",
  hut: "BUILT",
  tower: "BUILT",
  bridge: "BUILT",
  awning: "BUILT",
  sunshade: "BUILT",
  roof: "BUILT",
  canopy: "BUILT", // architectural canopy
  column: "BUILT",
  pillar: "BUILT",
  grandstand: "BUILT",

  // Bare earth / exposed unpaved soil
  earth: "BARE",
  ground: "BARE",
  land: "BARE",
  soil: "BARE",
  sand: "BARE",
  dirt: "BARE",
  rock: "BARE",
  stone: "BARE",
  hill: "BARE",
  mountain: "BARE",
  gravel: "BARE",

  // Water bodies
  water: "WATER",
  sea: "WATER",
  river: "WATER",
  lake: "WATER",
  pool: "WATER",
  fountain: "WATER",
  pond: "WATER",
  stream: "WATER",

  // Sky
  sky: "SKY",

  // Transient / movable / occluding objects
  car: "TRANSIENT",
  automobile: "TRANSIENT",
  truck: "TRANSIENT",
  bus: "TRANSIENT",
  minibus: "TRANSIENT",
  van: "TRANSIENT",
  vehicle: "TRANSIENT",
  person: "TRANSIENT",
  individual: "TRANSIENT",
  pedestrian: "TRANSIENT",
  bicycle: "TRANSIENT",
  bike: "TRANSIENT",
  minibike: "TRANSIENT",
  motorbike: "TRANSIENT",
  motorcycle: "TRANSIENT",
  boat: "TRANSIENT",
  pole: "TRANSIENT",
  post: "TRANSIENT",
  streetlight: "TRANSIENT",
  streetlamp: "TRANSIENT",
  signboard: "TRANSIENT",
  sign: "TRANSIENT",
  "traffic light": "TRANSIENT",
  ashcan: "TRANSIENT",
  trash: "TRANSIENT",
  bench: "TRANSIENT",
  chair: "TRANSIENT",
  table: "TRANSIENT",
  canopy_cloth: "TRANSIENT",
  umbrella: "TRANSIENT",
  booth: "TRANSIENT",
  tent: "TRANSIENT",
};

/**
 * ADE20K labels that strictly designate indoor household/office objects.
 * Used for automatic rejection of non-street/indoor images.
 */
export const INDOOR_ADE_LABELS = new Set([
  "bed",
  "sofa",
  "couch",
  "cushion",
  "armchair",
  "wardrobe",
  "closet",
  "cupboard",
  "cabinet",
  "desk",
  "counter",
  "bookcase",
  "refrigerator",
  "icebox",
  "sink",
  "washbasin",
  "toilet",
  "commode",
  "bathtub",
  "shower",
  "fireplace",
  "hearth",
  "curtain",
  "drape",
  "carpet",
  "rug",
  "mirror",
  "television",
  "screen",
  "monitor",
  "computer",
  "keyboard",
  "microwave",
  "oven",
  "stove",
  "plate",
  "dish",
  "food",
  "painting",
  "poster",
  "clock",
  "vase",
  "apparel",
  "clothing",
  "pillow",
  "quilt",
  "blanket",
  "ceiling",
  "buffet",
  "sideboard",
  "nightstand",
  "ottoman",
]);

export function isIndoorLabel(rawLabel: string): boolean {
  const clean = rawLabel.toLowerCase().split(",")[0].trim();
  return INDOOR_ADE_LABELS.has(clean);
}

/**
 * Priority order for mask composition.
 * Later entries overwrite earlier entries in the label map.
 * E.g., Canopy overrules pavement beneath it;
 * Transient objects (cars, people) overrule the road they occlude.
 */
export const PRIORITY: CBClass[] = [
  "UNKNOWN",
  "SKY",
  "BARE",
  "PAVED",
  "BUILT",
  "WATER",
  "LOW_GREEN",
  "CANOPY",
  "TRANSIENT",
];

export const SEG_COLOR: Record<CBClass, [number, number, number]> = {
  CANOPY: [0, 230, 118],
  LOW_GREEN: [204, 255, 0],
  PAVED: [255, 46, 147],
  BUILT: [177, 78, 255],
  BARE: [255, 107, 26],
  WATER: [0, 102, 255],
  SKY: [0, 212, 255],
  TRANSIENT: [217, 214, 204],
  UNKNOWN: [120, 120, 120],
};

export const SEG_HEX: Record<CBClass, string> = {
  CANOPY: "#00E676",
  LOW_GREEN: "#CCFF00",
  PAVED: "#FF2E93",
  BUILT: "#B14EFF",
  BARE: "#FF6B1A",
  WATER: "#0066FF",
  SKY: "#00D4FF",
  TRANSIENT: "#D9D6CC",
  UNKNOWN: "#787878",
};

export const SEG_ALPHA: Record<CBClass, number> = {
  CANOPY: 0.68,
  LOW_GREEN: 0.68,
  PAVED: 0.68,
  BUILT: 0.68,
  BARE: 0.68,
  WATER: 0.68,
  SKY: 0.45,
  TRANSIENT: 0.35,
  UNKNOWN: 0.3,
};

export const CLASS_INDEX_MAP: Record<CBClass, number> = {
  CANOPY: 0,
  LOW_GREEN: 1,
  PAVED: 2,
  BUILT: 3,
  BARE: 4,
  WATER: 5,
  SKY: 6,
  TRANSIENT: 7,
  UNKNOWN: 8,
};

export const INDEX_TO_CLASS: CBClass[] = [
  "CANOPY",
  "LOW_GREEN",
  "PAVED",
  "BUILT",
  "BARE",
  "WATER",
  "SKY",
  "TRANSIENT",
  "UNKNOWN",
];

export function mapAdeToCb(rawLabel: string): CBClass {
  const clean = rawLabel.toLowerCase().split(",")[0].trim();
  return ADE_TO_CB[clean] || "UNKNOWN";
}
