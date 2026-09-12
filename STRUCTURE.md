# Structure: Color Tap Blitz

## Screen composition

`app/(tabs)/index.tsx` is a single, safe-area-aware screen that renders three phases: home, playing, and finished. The home phase presents the value proposition and local stats. The playing phase focuses attention on one target orb and four large response buttons. The finished phase turns the run into a replay decision.

## Pure game logic

`lib/game.ts` contains the color palette, session length, deterministic target selection, combo scoring formula, and stats update function. It has no React or platform dependencies, which keeps the game rules testable and easy to extend.

## Persistence

AsyncStorage stores one JSON object under `color-tap-blitz.stats.v1`. It contains `highScore`, `bestCombo`, and `gamesPlayed`. A missing or malformed value falls back to safe zeroed stats.

## Interaction design

Pressable elements use the `style` prop for pressed feedback, large targets, and clear labels. Haptics are invoked only from user actions or run completion. The UI also communicates color names in text, avoiding color-only meaning.
