# Install

"Installed" means the npm dependencies are present in `node_modules/` so the
build, check, and serve scripts run. The game itself ships as a static browser
build; there is no package to install globally.

## Requirements

- Node.js and npm (the setup script aborts if `npm` is missing).
- Python 3 for the local preview server (`python3 -m http.server`) and for the
  pytest hygiene checks.
- macOS, Linux, or any POSIX shell. The scripts call `git rev-parse` and a
  POSIX shell; Known gaps lists the unverified platform matrix.

## Install steps

1. Clone the repository.
2. Install npm dependencies:

   ```bash
   npm run setup
   ```

   This runs [devel/setup_typescript.sh](../devel/setup_typescript.sh), which
   calls `npm install` against [package.json](../package.json).
3. Optional, for browser tests, install Playwright browsers:

   ```bash
   npm run setup:playwright
   ```
4. Optional, for the Python hygiene checks, install the dev requirements from
   [pip_requirements-dev.txt](../pip_requirements-dev.txt) (`pytest`,
   `pyflakes`, `bandit`, and helpers).

## Verify install

Run the full check gate; it confirms the toolchain resolves and the source
type-checks:

```bash
npm run check
```

This runs [check_codebase.sh](../check_codebase.sh) (type-check, lint,
format-check, and Node unit tests).

## Troubleshooting

- `node_modules missing`: [run_web_server.sh](../run_web_server.sh) auto-runs
  the setup script; if it cannot, run `npm run setup` manually.
- `package-lock.json missing` warning: the install is not reproducible until a
  lockfile is committed; the check still runs.

## Known gaps

- [ ] Confirm the minimum supported Node.js and npm versions.
- [ ] Confirm the supported operating systems and shells.
- [ ] Decide whether to commit a `package-lock.json` for reproducible installs.
