# Game Plan: Color Tap Blitz

## Core loop

Color Tap Blitz is a twenty-second reaction workout. The player reads a target color, taps the matching swatch, and immediately receives the next target. Correct taps add points and a small time bonus; misses reset the combo and remove time. When the clock reaches zero, the run summary compares the score and combo with persisted local records.

## Risk focus

The main risk is timer and state coordination: the countdown must stop cleanly when a run ends, and rapid taps must update the score without stale combo values. The implementation uses refs for score and combo writes that happen inside touch handlers, while React state drives the UI. The timer is scheduled in a cleanup-safe effect and is only active during the `playing` phase.

**Verify:** Start a run, confirm the countdown decreases in tenths, tap the correct swatch several times, confirm combo and score increase, tap an incorrect swatch, confirm combo resets and time drops, then wait for the result state.

## Main build

- **Home:** explain the rule, show high score, best combo, and total runs, then offer a clear start action.
- **Playing:** show the target color, timer, combo, score, four large swatches, and instant hit/miss feedback.
- **Finished:** show final score, final combo, high score, replay, and home actions.
- **Persistence:** store only local game stats with AsyncStorage.
- **Accessibility:** use large touch targets, readable labels, and text labels in addition to hue.

## Verification criteria

- TypeScript check passes.
- Unit tests cover palette validity, deterministic target generation, combo scoring, and stat persistence behavior.
- The phone preview loads without runtime errors at 375 × 812.
- All four swatches are reachable and visibly differentiated.
- No button is a dead end, and the result screen offers replay and home actions.
- The README explains gameplay, setup, commands, architecture, privacy, and roadmap.
