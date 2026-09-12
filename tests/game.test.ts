import { describe, expect, it } from "vitest";

import { COLOR_OPTIONS, makeRound, scoreHit, updateStats } from "../lib/game";

describe("Color Tap Blitz game logic", () => {
  it("keeps a four-color reaction palette", () => {
    expect(COLOR_OPTIONS).toHaveLength(4);
    expect(new Set(COLOR_OPTIONS.map((color) => color.id)).size).toBe(4);
    expect(COLOR_OPTIONS.every((color) => color.hex.startsWith("#"))).toBe(true);
  });

  it("generates a valid color target", () => {
    const target = makeRound(() => 0.74);
    expect(COLOR_OPTIONS.some((color) => color.id === target)).toBe(true);
  });

  it("rewards higher combos with more points", () => {
    expect(scoreHit(0)).toBe(100);
    expect(scoreHit(3)).toBe(175);
    expect(scoreHit(7)).toBeGreaterThan(scoreHit(3));
  });

  it("keeps the best score and combo while counting runs", () => {
    const starting = { highScore: 420, bestCombo: 4, gamesPlayed: 2 };
    expect(updateStats(starting, 700, 6)).toEqual({ highScore: 700, bestCombo: 6, gamesPlayed: 3 });
    expect(updateStats(starting, 100, 1)).toEqual({ highScore: 420, bestCombo: 4, gamesPlayed: 3 });
  });
});
