# Glycolysis race to pyruvate

Glycolysis Race to Pyruvate is a two-player local hot-seat card game where players race through glycolysis by building legal reaction melds, managing cofactors, and clearing their hand first.

The game runs entirely in the browser from a static build. It needs no backend, account, or network connection: two players share one tab and pass the device between turns.

## Screenshots

<!-- screenshots:begin (managed by screenshot-docs) -->
![A two-meld shared glycolysis pathway after Hexokinase and Phosphoglucose isomerase, with both player scores and the frontier pointing to Fructose-6-phosphate](docs/screenshots/main_table.png)

![Mid-turn meld building with the five Hexokinase cards selected from the active hand and listed in the Selected cards zone](docs/screenshots/meld_building.png)

![Pass-the-device handoff screen with both hands hidden and the Hexokinase meld on the shared pathway](docs/screenshots/pass_device.png)
<!-- screenshots:end -->

## Quick start

1. Run `npm run setup` once after cloning to install dependencies.
2. Run `npm run serve` to build and preview the game in a browser.
3. Run `npm run build` to produce the GitHub Pages build in `dist/`.

Each `npm run` task mirrors a front-door shell script; see
[docs/USAGE.md](docs/USAGE.md) for the full command list.

## v1 rules

- Two-player local hot-seat in one browser tab; no backend or network.
- Play in a window about 16:9 to 16:10 wide so hands and the pathway fit on one
  screen.
- On a turn, the active player takes exactly one action: draw one card, or play
  one legal meld. There is no discard.
- Both players extend one shared, ordered glycolysis pathway, adding melds only
  at the end. The first meld must start with Glucose.
- A legal meld must match a glycolysis reaction exactly, including the required
  ATP, ADP, NAD+, and NADH cofactors.
- The reaction set covers normal steps, ATP investment, GAPDH redox, ATP
  payoff, and the aldolase branch through DHAP plus TPI.
- The first player to empty their hand wins the round. Full rules are in
  [docs/GAME_PLAY.md](docs/GAME_PLAY.md).

## Documentation

- [docs/INSTALL.md](docs/INSTALL.md): setup, requirements, and verify steps.
- [docs/USAGE.md](docs/USAGE.md): commands, scripts, and how to run.
- [docs/GAME_PLAY.md](docs/GAME_PLAY.md): full player-facing rules and a sample
  turn.
- [docs/CODE_ARCHITECTURE.md](docs/CODE_ARCHITECTURE.md): components and data
  flow.
- [docs/FILE_STRUCTURE.md](docs/FILE_STRUCTURE.md): directory map and where to
  add work.
- [docs/CHANGELOG.md](docs/CHANGELOG.md): dated record of changes.
- [docs/REPO_STYLE.md](docs/REPO_STYLE.md): repo conventions and file
  placement.
- [docs/TYPESCRIPT_STYLE.md](docs/TYPESCRIPT_STYLE.md): TypeScript coding rules.
- [docs/PYTEST_STYLE.md](docs/PYTEST_STYLE.md): pytest hygiene rules.

## License

Code is under the MIT license; see [LICENSE.MIT.md](LICENSE.MIT.md).
