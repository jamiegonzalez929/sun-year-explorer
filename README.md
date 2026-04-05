# Sun Year Explorer

Sun Year Explorer is a small local-first data visualization for understanding how daylight duration changes through the year at different latitudes. It exists because the usual sunrise/sunset apps are optimized for today's clock times, while this project is better for seeing the full annual shape of available daylight at a glance.

## Why it exists

If you plan walks, photography, training blocks, or travel around daylight, the yearly pattern matters more than a single forecast. This project turns a latitude into an instant annual view with no accounts, no API keys, and no network dependency once the files are on disk.

## Features

- Interactive preset locations plus a custom latitude control
- Annual daylight line chart for the selected latitude
- Month-by-month heatmap of the full year
- Summary stats for today's daylight, solar-noon altitude, longest day, and shortest day
- Pure browser UI with no third-party runtime dependencies
- Automated tests for the daylight calculation logic

## Setup

Requirements:

- Node.js 25+ for running the automated tests
- Python 3 for the simplest local static file server

Clone the repo, then work from the project root.

## How to run

Start a local static server:

```bash
npm run start
```

Then open `http://localhost:4173`.

If you already have another static server you prefer, you can serve the repo root directly because the app is just static HTML, CSS, and JavaScript.

## How to test

Run the automated test suite from the repo root:

```bash
npm test
```

The tests verify the daylight model against known directional behaviors such as near-equatorial stability, longer northern summer days, and polar-day clamping at high latitudes.

## Example usage

1. Open the app in a browser.
2. Choose `Brooklyn, USA` from the preset dropdown.
3. Read the summary cards to see today's daylight and the longest and shortest days of the year.
4. Drag the latitude slider north toward Iceland or Tromso and watch the line chart steepen and the heatmap compress into darker winter bands and lighter summer bands.
5. Drag south of the equator and notice the seasonal pattern flip.

## Project structure

- `index.html`: static app shell
- `styles.css`: visual design and responsive layout
- `src/solar.js`: astronomy and summarization logic
- `src/main.js`: DOM rendering and interaction code
- `test/solar.test.js`: automated test coverage
- `docs/astronomy.md`: model notes and design decisions

## Limitations

- The model uses a standard declination-based approximation rather than a full observatory-grade sunrise calculation.
- It does not model terrain, local obstructions, atmospheric refraction, or civil time conventions like daylight saving time.
- The visualization targets non-polar latitudes in the controls to keep the UI legible, though the calculation library can still handle high-latitude edge cases.
- The site is intentionally focused on annual daylight duration, not exact sunrise and sunset clock times for a map location.

## Next ideas

- Add CSV export for the selected annual series
- Offer a dual-location compare mode
- Add leap-year support and historical overlays
- Include sunrise and sunset time estimates for a chosen longitude and fixed time zone
