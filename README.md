# Glycolysis race to pyruvate

Glycolysis Race to Pyruvate is a two-player local hot-seat card game where players race through glycolysis by building legal reaction melds, managing cofactors, and clearing their hand first.

## Quick start

1. Run `npm run setup` once after cloning to install dependencies.
2. Run `npm run build` to create the GitHub Pages build in `dist/`.
3. Run `npm run serve` to preview the built game locally from `dist/`.

## Build command

Use `npm run build` for the production bundle. It runs `./build_github_pages.sh`, type-checks the TypeScript source, bundles `src/main.ts`, and copies the static files into `dist/`.

## Serve command

Use `npm run serve` for the local preview. It runs `./run_web_server.sh`, serves `dist/` over HTTP, and opens the game in a browser when the shell is interactive.

## v1 rules

- v1 is a two-player local hot-seat game in one browser tab or window.
- No backend, account system, or network connection is required.
- On each turn, the active player can draw, play a meld, discard one card, then pass the device.
- The inactive player's hand stays hidden until the turn changes.
- Legal melds must match a glycolysis reaction exactly.
- The shipped reaction set covers normal steps, ATP investment steps, GAPDH redox, ATP payoff steps, and the aldolase branch that can route through DHAP plus TPI.
- Cofactor cards are part of the required melds where the chemistry calls for them, including ATP, ADP, NAD+, and NADH.
- When a player empties their hand, the round ends and the next round resets the hands and starting player.
