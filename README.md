# Color Tap Blitz

A fast, neon reaction game for iOS, Android, and the web. **Color Tap Blitz** gives you 20 seconds to match a target color, build a combo, and chase a local high score. Correct taps add a fraction of a second; misses reset your combo and cost time.

## Why this game

Color Tap Blitz is designed as a tiny, repeatable attention workout. The rules are intentionally simple so the challenge comes from rapid visual discrimination rather than memorizing a complicated control scheme. Each run lasts roughly twenty seconds, which makes the game easy to replay between tasks.

## Gameplay

1. Start a blitz from the home screen.
2. Read the target color shown in the center of the screen.
3. Tap the matching color swatch as quickly as possible.
4. Build a combo to increase the points earned per correct tap.
5. Finish the timer and compare the run against your local high score.

The score formula starts at **100 points** for the first correct tap and adds **25 points per active combo level**. A correct tap adds 0.2 seconds, while a miss resets the combo and removes 0.75 seconds.

## Features

| Feature | Details |
|---|---|
| Timed reflex loop | Twenty-second rounds with a visible progress bar and tenths-of-a-second timer |
| Four-color palette | Violet, Aqua, Coral, and Yellow targets with high-contrast touch controls |
| Combo scoring | Consecutive correct taps increase the score earned per hit |
| Instant feedback | Target card, haptic response, color state, and combo feedback respond immediately |
| Local persistence | High score, best combo, and total runs persist with AsyncStorage |
| Responsive layout | Designed for portrait mobile screens and verified at 375 × 812 |
| Offline-friendly | No account, network request, API key, or server-side game logic is required |

## Tech stack

- Expo SDK 54
- React Native 0.81
- Expo Router 6
- React 19
- TypeScript 5.9
- NativeWind 4 with StyleSheet-based game UI
- AsyncStorage for local stats
- Expo Haptics for tactile feedback
- Vitest for deterministic game-logic tests

## Getting started

### Prerequisites

Install Node.js 22 or newer and pnpm. For native development, install Expo Go or the relevant iOS/Android toolchain.

### Install and run

```bash
pnpm install
pnpm dev
```

The `dev` script starts the API process and Expo Metro together. The web preview runs through Expo's web bundler.

### Platform commands

```bash
pnpm android   # Open the Android target
pnpm ios       # Open the iOS target
pnpm dev:metro # Run only the Expo web/Metro process
```

### Validate the project

```bash
pnpm check    # TypeScript validation
pnpm test     # Vitest suite
pnpm lint     # Expo linting
pnpm format   # Prettier formatting
```

## Project structure

```text
app/
  (tabs)/
    index.tsx       # Home, gameplay, and result states
    _layout.tsx     # Single Blitz tab shell
  _layout.tsx       # Root Expo Router layout
components/         # Safe-area and shared UI components
lib/
  game.ts           # Pure color selection, scoring, and stats helpers
tests/
  game.test.ts      # Deterministic game-logic tests
theme.config.js    # Neon midnight palette
app.config.ts       # Expo branding and platform metadata
```

## Design direction

The interface uses a **neon midnight** palette: deep ink backgrounds, violet primary actions, aqua success states, coral error states, and warm yellow guidance accents. The central target orb creates a single visual focus, while the four response controls remain large and evenly weighted for one-handed play.

## Data and privacy

The game stores only three local values on the device: high score, best combo, and completed run count. There is no login flow, analytics integration, remote leaderboard, or personal-data collection in this version.

## Roadmap

Potential next improvements include daily seeded challenges, a practice mode with no timer, accessibility settings for reduced color dependence, sound packs, and an opt-in global leaderboard backed by an authenticated service.

## License

This project is ready for a repository-specific license decision. Add an MIT or Apache-2.0 license file before distributing it as an open-source package.
