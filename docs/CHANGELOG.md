## 2026-06-29

### Additions and New Features

- Added the first pure TypeScript data and game layer for the two-player local hot-seat glycolysis game.
- Defined the 11 glycolysis molecules, 10 enzymes, and the ATP/ADP/NAD+/NADH cofactors as typed data artifacts.
- Added deterministic deck construction, seeded shuffle, two-player deal helpers, turn state, meld validation, and score handling.
- Implemented legal meld rules for normal reactions, ATP investment, GAPDH redox, ATP payoff, and the aldolase DHAP/TPI branch.
- Kept the new modules DOM-free and isolated under `src/data/**` and `src/game/**` for later UI and test reuse.
- Added [docs/CODE_ARCHITECTURE.md](CODE_ARCHITECTURE.md) and [docs/FILE_STRUCTURE.md](FILE_STRUCTURE.md) describing the UI layer, the DOM-free domain layer, and the directory map.
- Added [docs/INSTALL.md](INSTALL.md) and [docs/USAGE.md](USAGE.md) stubs covering setup, the check gate, and the build and serve commands.
- Added [docs/screenshots/main_table.png](screenshots/main_table.png) and [docs/screenshots/pass_device.png](screenshots/pass_device.png) captured from the live build.

### Fixes and Maintenance

- Reworked the card face renderer into a playing-card layout with mirrored corner labels, centered glycolysis glyphs, compact pathway cards, and clearer selection/state styling.
- Rewrote [README.md](../README.md) to a short overview plus a documentation map and a managed screenshot block, and embedded the two captured screenshots.
- Trimmed [AGENTS.md](../AGENTS.md) to bare pointer paths and added the missing [docs/TYPESCRIPT_STYLE.md](TYPESCRIPT_STYLE.md) and [docs/PYTEST_STYLE.md](PYTEST_STYLE.md) references for this TypeScript repo.
- Fixed `tsconfig.lint.json` TS18003 error by adding `src/**/*.ts` to its include list; the template-generated config only listed `tests/**/*.ts` and `tools/**/*.ts`, which matched zero files in this repo since those directories use `.mjs` not `.ts`; adding the `src/` glob gives the wider typecheck a real input set while keeping test/tool paths ready for future TypeScript additions.
