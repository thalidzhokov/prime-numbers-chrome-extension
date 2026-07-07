# Prime Numbers — Chrome extension

Manifest V3 popup extension: primes in a custom range, a password generator, and a **Fingerprint** tab (selected `navigator` fields and FingerprintJS payload, computed locally). No background scripts, no network calls — everything stays on your device.

**Version:** see `manifest.json` (currently `1.1.3`).

## Features

| Tab | What it does |
|-----|----------------|
| **Primes** | Lists prime numbers between user-defined min/max; values are copyable. |
| **Pass Gen** | Generates passwords with configurable length and character classes. |
| **Fingerprint** | Shows browser fingerprint data and related canvas output; copyable JSON block. |

Privacy details: [policy-privacy.md](policy-privacy.md).

## Install for development

1. Clone the repository.
2. Build styles (see below) so `css/popup.css` matches `css/popup.scss`.
3. Open `chrome://extensions`, enable **Developer mode**, click **Load unpacked**, select the project root (folder with `manifest.json`).

After changing JS or HTML, click **Reload** on the extension card. After changing SCSS, recompile CSS (or keep `watch:css` running) and reload the extension if styles do not update.

## Project layout

```
manifest.json          # Extension manifest (MV3)
popup.html             # Popup markup
css/
  popup.scss           # Source styles (edit this)
  popup.css            # Compiled CSS (loaded by popup.html)
js/
  popup.js             # Entry: wires modules
  common.js            # Navigation, copy-to-clipboard, shared UI
  prime-numbers.js
  password-generator.js
  fingerprint.js
  vendor/fp.min.js     # FingerprintJS (bundled)
icons/
scripts/
  build-css.sh         # One-off SCSS → CSS (npm or Docker)
  watch-css.sh         # Watch mode (npm or Docker)
  package-for-store.sh # Zip for Chrome Web Store
dist/                  # Release archives (generated)
package.json           # npm scripts for Sass
```

## Styles (SCSS)

Styles are authored in **`css/popup.scss`** and compiled to **`css/popup.css`**, which `popup.html` references. Do not edit `popup.css` by hand during normal development.

**Requirements:** [Node.js](https://nodejs.org/) with `npm` (for local build), or Docker (fallback scripts).

```bash
npm install
npm run build:css    # one-off compile
npm run watch:css    # recompile on every save to popup.scss
```

Without `npm` in `PATH` (e.g. Git Bash on Windows):

```bash
bash scripts/build-css.sh   # compile once
bash scripts/watch-css.sh   # watch (uses Docker node:22-alpine if npm is missing)
```

In Cursor / VS Code you can also run **`watch:css`** in a terminal or define a [task](https://code.visualstudio.com/docs/editor/tasks) for `npm run watch:css` — no separate Sass extension is required.

## Package for Chrome Web Store

From the repo root (needs `zip`, `python3`, and `npm` or Docker for CSS build):

```bash
bash scripts/package-for-store.sh
```

Creates `dist/prime-numbers-v<version>.zip` from `manifest.json`. The script runs `npm run build:css` when `package.json` is present. Optional archive name:

```bash
bash scripts/package-for-store.sh my-release.zip
```

## Why prime numbers still matter in day-to-day work

The prime list here is a **small helper** (pick a "non-round" interval, sanity-check a range, sanity-check a schedule). Below are **real classes of problems** where periods that **do not align cleanly** with "round" minutes or seconds (including values **close to primes** or **coprime with** 60, 300, 600) **overlap less often in phase** and help **spread load spikes**.

To be fair: in production people more often use **random jitter** on an interval or TTL. Choosing something like 7 minutes or 307 seconds is a **deliberate variant of the same idea** (stagger phases), not a drop-in replacement for jitter as the default approach.

### Schedulers: cron, systemd timers, Kubernetes CronJob

Teams may use e.g. `*/7` vs `*/5` so jobs do not all sit on the same phase of a "round" grid: rhythm alignment is tied to the **least common multiple** of periods, and breaking lockstep with neighbors is easier when periods are **not all divisors of one shared base** (in large orgs this is often **manual schedule hygiene**).

### Agent polling: monitoring, metrics, health checks

Internal guides sometimes ask for intervals **not divisible by 60 seconds**, so agents on the same host **do not wake up in lockstep** with other services and hammer CPU or a metrics endpoint together.

### Cache TTL and background jobs

TTLs like **47 s** or **307 s** instead of exactly **300 s** spread invalidation times across instances. The same goal is often met with **random jitter** on a base TTL — easier to operate; a "non-round" or near-prime second count is a **conscious choice in the same problem class** when you do not want RNG in config or need a stable period without drift.
