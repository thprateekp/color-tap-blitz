# Memory

- The first attempted second-project initialization was rejected because this session retains one active WebDev project slot. The existing workspace was intentionally repurposed for Color Tap Blitz while the original chess build remains safely pushed to its own GitHub repository.
- Expo SDK 54, AsyncStorage, Expo Haptics, Expo Router, and Vitest were already installed in the workspace.
- The game is local-only by design; it does not need auth, database, server routes, or external APIs.
- Timer writes use refs for score and combo so rapid taps do not depend on asynchronous React state updates.
- The UI is intentionally hue-plus-label, so the game remains understandable to players who do not distinguish every color equally well.
