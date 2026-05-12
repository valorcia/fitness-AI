/**
 * Equipment metadata — real gym / product photos curated from Unsplash.
 * Every URL below is one that's already exercised elsewhere in the
 * codebase (seed, dashboard, exercises library) so we know it loads.
 * Where Unsplash has no clean shot for a niche item we fall back to a
 * thematically-relevant gym photo rather than ship a broken placeholder.
 */

const PHOTO = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=600&h=400&q=70`;

// Proven photo IDs (used elsewhere in the app)
const IMG = {
  barbellFloor: PHOTO("1581009146145-b5ef050c2e1e"),
  dumbbellPair: PHOTO("1583454110551-21f2fa2afe61"),
  bench: PHOTO("1571019613454-1cb2f99b2d8b"),
  rack: PHOTO("1534438327276-14e5300c3a48"),
  legPress: PHOTO("1623874514711-0f321325f318"),
  cable: PHOTO("1571902943202-507ec2618e8f"),
  smith: PHOTO("1574680096145-d05b474e2155"),
  kettlebell: PHOTO("1604480132715-59c471af6d25"),
  deadlift: PHOTO("1517963879433-6ad2b056d712"),
  pullUp: PHOTO("1598971639058-a852862a1633"),
  yogaMat: PHOTO("1544367567-0f2fcb009e0b"),
  treadmill: PHOTO("1534258936925-c58bed479fcb"),
  rower: PHOTO("1434596922112-19c563067271"),
  gymWalk: PHOTO("1517836357463-d25dfeac3438"),
  running: PHOTO("1461896836934-ffe607ba8211"),
  athlete: PHOTO("1532029837206-abbe2b7620e3"),
  hackSquat: PHOTO("1579758629938-03607ccdbaba"),
  inclineGym: PHOTO("1594737625785-a6cbdabd333c"),
  spinBike: PHOTO("1534258936925-c58bed479fcb"),
  climber: PHOTO("1522163182402-834f871fd851"),
};

export type EquipmentMeta = {
  imageUrl: string;
  hint?: string;
};

export const EQUIPMENT_META: Record<string, EquipmentMeta> = {
  barbell: {
    imageUrl: IMG.barbellFloor,
    hint: "Long bar with removable plates — squat, bench, deadlift.",
  },
  dumbbell: {
    imageUrl: IMG.dumbbellPair,
    hint: "Held in each hand for unilateral training.",
  },
  bench: {
    imageUrl: IMG.bench,
    hint: "Flat or inclinable bench for pressing and seated work.",
  },
  rack: {
    imageUrl: IMG.rack,
    hint: "Safety cage to lift heavy alone (squat, overhead press).",
  },
  machine: {
    imageUrl: IMG.legPress,
    hint: "Guided-motion machine — leg press, chest press, etc.",
  },
  "cable machine": {
    imageUrl: IMG.cable,
    hint: "Constant resistance via cables — rows, flyes, triceps.",
  },
  "smith machine": {
    imageUrl: IMG.smith,
    hint: "Barbell on vertical rails — more stable, less freedom.",
  },
  kettlebell: {
    imageUrl: IMG.kettlebell,
    hint: "Cast-iron bell — swings, snatches, goblet squats.",
  },
  bands: {
    imageUrl: IMG.yogaMat,
    hint: "Resistance bands — assistance, mobility, added load.",
  },
  rings: {
    imageUrl: IMG.pullUp,
    hint: "Gymnastic rings — pull-ups, dips, advanced calisthenics.",
  },
  parallettes: {
    imageUrl: IMG.pullUp,
    hint: "Low parallel bars — push-ups, L-sit, planche.",
  },
  "pull-up bar": {
    imageUrl: IMG.pullUp,
    hint: "Door- or wall-mounted bar for pull-ups and hanging.",
  },
  "dip bars": {
    imageUrl: IMG.gymWalk,
    hint: "Parallel bars for dips and L-sits.",
  },
  fingerboard: {
    imageUrl: IMG.climber,
    hint: "Finger-strength board for climbers.",
  },
  "ab wheel": {
    imageUrl: IMG.hackSquat,
    hint: "Wheel with handles for advanced core rollouts.",
  },
  "foam roller": {
    imageUrl: IMG.yogaMat,
    hint: "Self-massage for recovery and mobility.",
  },
  "yoga mat": {
    imageUrl: IMG.yogaMat,
    hint: "Non-slip mat for yoga, core work, stretching.",
  },
  "medicine ball": {
    imageUrl: IMG.inclineGym,
    hint: "Weighted ball (3–10 kg) — throws, wall balls, core.",
  },
  box: {
    imageUrl: IMG.athlete,
    hint: "Plyo box — box jumps, step-ups, Bulgarian split squats.",
  },
  "jump rope": {
    imageUrl: IMG.running,
    hint: "Cardio, warm-up and coordination.",
  },
  "punching bag": {
    imageUrl: IMG.gymWalk,
    hint: "Boxing, kick-boxing, MMA.",
  },
  "boxing gloves": {
    imageUrl: IMG.gymWalk,
    hint: "Protect your hands on bag work or sparring.",
  },
  treadmill: {
    imageUrl: IMG.treadmill,
    hint: "Indoor running with pace and incline control.",
  },
  bike: {
    imageUrl: IMG.spinBike,
    hint: "Road, MTB, indoor or spin bike.",
  },
  rower: {
    imageUrl: IMG.rower,
    hint: "Low-impact full-body cardio with back & leg work.",
  },
  "assault bike": {
    imageUrl: IMG.spinBike,
    hint: "Air-resistance bike with moving arms — brutal HIIT.",
  },
  "trap bar": {
    imageUrl: IMG.deadlift,
    hint: "Hexagonal bar — safer deadlifts for the back.",
  },
  "trail shoes": {
    imageUrl: IMG.running,
    hint: "Grippy shoes for trail running.",
  },
  racket: {
    imageUrl: IMG.gymWalk,
    hint: "Tennis, padel, badminton.",
  },
  football: {
    imageUrl: IMG.running,
    hint: "Football, basketball, handball…",
  },
  "shin guards": {
    imageUrl: IMG.gymWalk,
    hint: "Combat / team-sport leg protection.",
  },
};

export function metaFor(slug: string): EquipmentMeta {
  return (
    EQUIPMENT_META[slug] ?? {
      imageUrl: IMG.gymWalk,
      hint: undefined,
    }
  );
}
