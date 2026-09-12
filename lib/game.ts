export type ColorId = "violet" | "aqua" | "coral" | "yellow";

export type ColorOption = {
  id: ColorId;
  label: string;
  hex: string;
  soft: string;
};

export type GameStats = {
  highScore: number;
  bestCombo: number;
  gamesPlayed: number;
};

export const COLOR_OPTIONS: ColorOption[] = [
  { id: "violet", label: "Violet", hex: "#9B7BFF", soft: "#261E4A" },
  { id: "aqua", label: "Aqua", hex: "#48E0B2", soft: "#143E3A" },
  { id: "coral", label: "Coral", hex: "#FF6B8A", soft: "#492333" },
  { id: "yellow", label: "Yellow", hex: "#FFD166", soft: "#4A3A1D" },
];

export const SESSION_SECONDS = 20;

export function makeRound(random = Math.random): ColorId {
  return COLOR_OPTIONS[Math.floor(random() * COLOR_OPTIONS.length)].id;
}

export function scoreHit(combo: number) {
  return 100 + combo * 25;
}

export function updateStats(stats: GameStats, score: number, combo: number): GameStats {
  return {
    highScore: Math.max(stats.highScore, score),
    bestCombo: Math.max(stats.bestCombo, combo),
    gamesPlayed: stats.gamesPlayed + 1,
  };
}
