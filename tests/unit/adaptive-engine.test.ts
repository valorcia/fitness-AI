import { describe, it, expect } from "vitest";
import { computeAdjustment } from "@/services/adaptive-engine";

const baseWorkout = {
  id: "w",
  userId: "u",
  planId: null,
  type: "STRENGTH",
  status: "COMPLETED",
  scheduledFor: new Date(),
  startedAt: null,
  completedAt: null,
  durationSec: null,
  caloriesKcal: null,
  avgHeartRate: null,
  maxHeartRate: null,
  perceivedLoad: 7,
  notes: null,
  score: null,
  createdAt: new Date(),
  updatedAt: new Date(),
} as any;

const fb = (over: Partial<Record<string, unknown>>) =>
  ({
    id: "f",
    workoutId: "w",
    userId: "u",
    difficulty: 6,
    pain: false,
    soreness: 3,
    motivation: 7,
    energy: 7,
    comment: null,
    createdAt: new Date(),
    ...over,
  }) as any;

describe("adaptive engine", () => {
  it("reduces load when pain is reported", () => {
    const adj = computeAdjustment(fb({ pain: true }), baseWorkout);
    expect(adj.deload).toBe(true);
    expect(adj.loadMultiplier).toBeLessThan(1);
  });
  it("increases load when easy + high energy", () => {
    const adj = computeAdjustment(
      fb({ difficulty: 3, energy: 9, soreness: 1, motivation: 9 }),
      baseWorkout,
    );
    expect(adj.loadMultiplier).toBeGreaterThanOrEqual(1);
  });
});
