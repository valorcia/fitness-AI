/**
 * Equipment metadata — each item ships with a curated real-life photo
 * (Unsplash) so the visual language stays uniform: real product / gym
 * photography across the whole catalogue.
 *
 * Names are kept in their canonical English form.
 */

const PHOTO = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=600&h=400&q=70`;

export type EquipmentMeta = {
  /** Curated Unsplash photo URL (real product / gym shot). */
  imageUrl: string;
  /** Short usage hint shown under the title. */
  hint?: string;
};

export const EQUIPMENT_META: Record<string, EquipmentMeta> = {
  barbell: {
    imageUrl: PHOTO("1581009146145-b5ef050c2e1e"),
    hint: "Long bar with removable plates — squat, bench, deadlift.",
  },
  dumbbell: {
    imageUrl: PHOTO("1583454110551-21f2fa2afe61"),
    hint: "Held in each hand for unilateral training.",
  },
  bench: {
    imageUrl: PHOTO("1571019613454-1cb2f99b2d8b"),
    hint: "Flat or inclinable bench for pressing and seated work.",
  },
  rack: {
    imageUrl: PHOTO("1534438327276-14e5300c3a48"),
    hint: "Safety cage to lift heavy alone (squat, overhead press).",
  },
  machine: {
    imageUrl: PHOTO("1623874514711-0f321325f318"),
    hint: "Guided-motion machine — leg press, chest press, etc.",
  },
  "cable machine": {
    imageUrl: PHOTO("1571902943202-507ec2618e8f"),
    hint: "Constant resistance via cables — rows, flyes, triceps.",
  },
  "smith machine": {
    imageUrl: PHOTO("1574680096145-d05b474e2155"),
    hint: "Barbell on vertical rails — more stable, less freedom.",
  },
  kettlebell: {
    imageUrl: PHOTO("1604480132715-59c471af6d25"),
    hint: "Cast-iron bell — swings, snatches, goblet squats.",
  },
  bands: {
    imageUrl: PHOTO("1599058917765-a780eda07a3e"),
    hint: "Resistance bands — assistance, mobility, added load.",
  },
  rings: {
    imageUrl: PHOTO("1599058917800-7c2c4e8d3a47"),
    hint: "Gymnastic rings — pull-ups, dips, advanced calisthenics.",
  },
  parallettes: {
    imageUrl: PHOTO("1604247584233-99c80a8a4659"),
    hint: "Low parallel bars — push-ups, L-sit, planche.",
  },
  "pull-up bar": {
    imageUrl: PHOTO("1598971639058-a852862a1633"),
    hint: "Door- or wall-mounted bar for pull-ups and hanging.",
  },
  "dip bars": {
    imageUrl: PHOTO("1517836357463-d25dfeac3438"),
    hint: "Parallel bars for dips and L-sits.",
  },
  fingerboard: {
    imageUrl: PHOTO("1522163182402-834f871fd851"),
    hint: "Finger-strength board for climbers.",
  },
  "ab wheel": {
    imageUrl: PHOTO("1583500178690-f7fd39157b6a"),
    hint: "Wheel with handles for advanced core rollouts.",
  },
  "foam roller": {
    imageUrl: PHOTO("1599901860904-17e6ed7083a0"),
    hint: "Self-massage for recovery and mobility.",
  },
  "yoga mat": {
    imageUrl: PHOTO("1544367567-0f2fcb009e0b"),
    hint: "Non-slip mat for yoga, core work, stretching.",
  },
  "medicine ball": {
    imageUrl: PHOTO("1517438476312-10d11ed53569"),
    hint: "Weighted ball (3–10 kg) — throws, wall balls, core.",
  },
  box: {
    imageUrl: PHOTO("1591291621164-2c6367723315"),
    hint: "Plyo box — box jumps, step-ups, Bulgarian split squats.",
  },
  "jump rope": {
    imageUrl: PHOTO("1599058918144-1bdc4f3edc77"),
    hint: "Cardio, warm-up and coordination.",
  },
  "punching bag": {
    imageUrl: PHOTO("1599058917212-d750089bc07e"),
    hint: "Boxing, kick-boxing, MMA.",
  },
  "boxing gloves": {
    imageUrl: PHOTO("1593079831268-3381b0db4a77"),
    hint: "Protect your hands on bag work or sparring.",
  },
  treadmill: {
    imageUrl: PHOTO("1534258936925-c58bed479fcb"),
    hint: "Indoor running with pace and incline control.",
  },
  bike: {
    imageUrl: PHOTO("1532298229144-0ec0c57515c7"),
    hint: "Road, MTB, indoor or spin bike.",
  },
  rower: {
    imageUrl: PHOTO("1434596922112-19c563067271"),
    hint: "Low-impact full-body cardio with back & leg work.",
  },
  "assault bike": {
    imageUrl: PHOTO("1571019614242-c5c5dee9f50b"),
    hint: "Air-resistance bike with moving arms — brutal HIIT.",
  },
  "trap bar": {
    imageUrl: PHOTO("1517963879433-6ad2b056d712"),
    hint: "Hexagonal bar — safer deadlifts for the back.",
  },
  "trail shoes": {
    imageUrl: PHOTO("1542291026-7eec264c27ff"),
    hint: "Grippy shoes for trail running.",
  },
  racket: {
    imageUrl: PHOTO("1551269901-5c5e14c25df7"),
    hint: "Tennis, padel, badminton.",
  },
  football: {
    imageUrl: PHOTO("1574629810360-7efbbe195018"),
    hint: "Football, basketball, handball…",
  },
  "shin guards": {
    imageUrl: PHOTO("1551958219-acbc608c6377"),
    hint: "Combat / team-sport leg protection.",
  },
};

export function metaFor(slug: string): EquipmentMeta {
  return (
    EQUIPMENT_META[slug] ?? {
      imageUrl: PHOTO("1517836357463-d25dfeac3438"),
      hint: undefined,
    }
  );
}
