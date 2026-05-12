/**
 * Equipment metadata — every entry uses the same illustration style: a white
 * silhouette icon from the `game-icons` Iconify set on a brand-coloured
 * gradient tile. This guarantees a consistent visual base across the whole
 * "Matériel à disposition" + "Autre matériel" sections.
 *
 * Names are kept in English (the global gym vocabulary), so the icon does
 * the heavy lifting for non-English speakers / beginners.
 */

const ICON = (name: string) =>
  `https://api.iconify.design/game-icons:${name}.svg?color=%23ffffff&height=80`;

export type EquipmentMeta = {
  /** Iconify URL (game-icons set, always white silhouette). */
  iconUrl: string;
  /** Short usage hint shown under the label. */
  hint?: string;
  /** Gradient (from → to) used as the tile background. */
  gradient: [string, string];
};

const STRENGTH: [string, string] = ["#1B3954", "#0F766E"];
const FREE_WEIGHT: [string, string] = ["#0F172A", "#1B3954"];
const MACHINE: [string, string] = ["#0EA5E9", "#14B8A6"];
const PULL: [string, string] = ["#7C3AED", "#A855F7"];
const CARDIO: [string, string] = ["#10B981", "#22D3EE"];
const COMBAT: [string, string] = ["#7F1D1D", "#DC2626"];
const MOBILITY: [string, string] = ["#6366F1", "#A855F7"];
const CORE: [string, string] = ["#1F2937", "#475569"];
const OUTDOOR: [string, string] = ["#10B981", "#F59E0B"];
const FIELD: [string, string] = ["#1F2937", "#10B981"];

export const EQUIPMENT_META: Record<string, EquipmentMeta> = {
  barbell: {
    iconUrl: ICON("barbell"),
    hint: "Long bar with removable plates — squat, bench, deadlift.",
    gradient: STRENGTH,
  },
  dumbbell: {
    iconUrl: ICON("dumbbell"),
    hint: "Held in each hand for unilateral training.",
    gradient: STRENGTH,
  },
  bench: {
    iconUrl: ICON("weight-lifting-up"),
    hint: "Flat or inclinable bench for pressing and seated work.",
    gradient: STRENGTH,
  },
  rack: {
    iconUrl: ICON("weight-lifting-up"),
    hint: "Safety cage to lift heavy alone (squat, overhead press).",
    gradient: STRENGTH,
  },
  machine: {
    iconUrl: ICON("gears"),
    hint: "Guided-motion machine — leg press, chest press, etc.",
    gradient: MACHINE,
  },
  "cable machine": {
    iconUrl: ICON("pulley"),
    hint: "Constant resistance via cables — rows, flyes, triceps.",
    gradient: PULL,
  },
  "smith machine": {
    iconUrl: ICON("weight-lifting-up"),
    hint: "Barbell on vertical rails — more stable, less freedom.",
    gradient: FREE_WEIGHT,
  },
  kettlebell: {
    iconUrl: ICON("kettlebell"),
    hint: "Cast-iron bell — swings, snatches, goblet squats.",
    gradient: STRENGTH,
  },
  bands: {
    iconUrl: ICON("elastic"),
    hint: "Resistance bands — assistance, mobility, added load.",
    gradient: MOBILITY,
  },
  rings: {
    iconUrl: ICON("gymnastics"),
    hint: "Gymnastic rings — pull-ups, dips, advanced calisthenics.",
    gradient: MOBILITY,
  },
  parallettes: {
    iconUrl: ICON("wood-stick"),
    hint: "Low parallel bars — push-ups, L-sit, planche.",
    gradient: STRENGTH,
  },
  "pull-up bar": {
    iconUrl: ICON("wood-stick"),
    hint: "Door- or wall-mounted bar for pull-ups and hanging.",
    gradient: PULL,
  },
  "dip bars": {
    iconUrl: ICON("wood-stick"),
    hint: "Parallel bars for dips and L-sits.",
    gradient: PULL,
  },
  fingerboard: {
    iconUrl: ICON("hand"),
    hint: "Finger-strength board for climbers.",
    gradient: OUTDOOR,
  },
  "ab wheel": {
    iconUrl: ICON("car-wheel"),
    hint: "Wheel with handles for advanced core rollouts.",
    gradient: CORE,
  },
  "foam roller": {
    iconUrl: ICON("bread-slice"),
    hint: "Self-massage for recovery and mobility.",
    gradient: MOBILITY,
  },
  "yoga mat": {
    iconUrl: ICON("meditation"),
    hint: "Non-slip mat for yoga, core work, stretching.",
    gradient: MOBILITY,
  },
  "medicine ball": {
    iconUrl: ICON("bowling-ball"),
    hint: "Weighted ball (3–10 kg) — throws, wall balls, core.",
    gradient: CORE,
  },
  box: {
    iconUrl: ICON("cardboard-box"),
    hint: "Plyo box — box jumps, step-ups, Bulgarian split squats.",
    gradient: STRENGTH,
  },
  "jump rope": {
    iconUrl: ICON("rope-coil"),
    hint: "Cardio, warm-up and coordination.",
    gradient: CARDIO,
  },
  "punching bag": {
    iconUrl: ICON("punching-bag"),
    hint: "Boxing, kick-boxing, MMA.",
    gradient: COMBAT,
  },
  "boxing gloves": {
    iconUrl: ICON("boxing-glove"),
    hint: "Protect your hands on bag work or sparring.",
    gradient: COMBAT,
  },
  treadmill: {
    iconUrl: ICON("run"),
    hint: "Indoor running with pace and incline control.",
    gradient: CARDIO,
  },
  bike: {
    iconUrl: ICON("bicycle"),
    hint: "Road, MTB, indoor or spin bike.",
    gradient: CARDIO,
  },
  rower: {
    iconUrl: ICON("rowing"),
    hint: "Low-impact full-body cardio with back & leg work.",
    gradient: CARDIO,
  },
  "assault bike": {
    iconUrl: ICON("bicycle"),
    hint: "Air-resistance bike with moving arms — brutal HIIT.",
    gradient: CARDIO,
  },
  "trap bar": {
    iconUrl: ICON("barbell"),
    hint: "Hexagonal bar — safer deadlifts for the back.",
    gradient: STRENGTH,
  },
  "trail shoes": {
    iconUrl: ICON("running-shoe"),
    hint: "Grippy shoes for trail running.",
    gradient: OUTDOOR,
  },
  racket: {
    iconUrl: ICON("tennis-racket"),
    hint: "Tennis, padel, badminton.",
    gradient: FIELD,
  },
  football: {
    iconUrl: ICON("soccer-ball"),
    hint: "Football, basketball, handball…",
    gradient: FIELD,
  },
  "shin guards": {
    iconUrl: ICON("gauntlet"),
    hint: "Combat / team-sport leg protection.",
    gradient: COMBAT,
  },
};

export function metaFor(slug: string): EquipmentMeta {
  return (
    EQUIPMENT_META[slug] ?? {
      iconUrl: ICON("gym-bag"),
      hint: undefined,
      gradient: STRENGTH,
    }
  );
}
