## 2026-06-29

### Additions and New Features

- Added the first pure TypeScript data and game layer for the two-player local hot-seat glycolysis game.
- Defined the 11 glycolysis molecules, 10 enzymes, and the ATP/ADP/NAD+/NADH cofactors as typed data artifacts.
- Added deterministic deck construction, seeded shuffle, two-player deal helpers, turn state, meld validation, and score handling.
- Implemented legal meld rules for normal reactions, ATP investment, GAPDH redox, ATP payoff, and the aldolase DHAP/TPI branch.
- Kept the new modules DOM-free and isolated under `src/data/**` and `src/game/**` for later UI and test reuse.

### Fixes and Maintenance

- Reworked the card face renderer into a playing-card layout with mirrored corner labels, centered glycolysis glyphs, compact pathway cards, and clearer selection/state styling.
