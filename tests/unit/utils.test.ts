import { describe, it, expect } from "vitest";
import {
  formatDistance,
  formatDuration,
  formatPace,
  bmrMifflinStJeor,
  dailyWaterNeedMl,
} from "@/lib/utils";

describe("utils", () => {
  it("formats distance", () => {
    expect(formatDistance(500)).toBe("500 m");
    expect(formatDistance(1500)).toBe("1.50 km");
  });
  it("formats duration", () => {
    expect(formatDuration(65)).toBe("01:05");
    expect(formatDuration(3665)).toBe("01:01:05");
  });
  it("formats pace", () => {
    expect(formatPace(330)).toBe("5'30\"/km");
    expect(formatPace(null)).toBe("—");
  });
  it("BMR returns a plausible number", () => {
    const bmr = bmrMifflinStJeor({ weightKg: 70, heightCm: 175, ageYears: 30, sex: "MALE" });
    expect(bmr).toBeGreaterThan(1500);
    expect(bmr).toBeLessThan(2000);
  });
  it("water need scales", () => {
    expect(dailyWaterNeedMl({ weightKg: 70 })).toBeGreaterThan(2000);
    expect(dailyWaterNeedMl({ weightKg: 70, tempC: 35 })).toBeGreaterThan(dailyWaterNeedMl({ weightKg: 70 }));
  });
});
