# Daylight Model Notes

## Overview

Sun Year Explorer uses a compact astronomical approximation to estimate daylight duration for each day of a non-leap year. The intent is to show the shape of the year clearly and consistently rather than reproduce observatory-grade sunrise tables.

## Formula

For each day index:

1. Estimate solar declination from the day of year with a cosine approximation.
2. Convert latitude and declination into the sunrise hour angle.
3. Convert the hour angle to daylight hours.
4. Clamp extreme cases to `0` or `24` hours where the geometry implies polar night or midnight sun.

The core relationship in the implementation is:

```text
daylight_hours = 24 * acos(-tan(latitude) * tan(declination)) / pi
```

This is a standard day-length approximation and is sufficient for comparative planning and visual exploration.

## Tradeoffs

- Strengths:
  - Fast enough to recompute the entire year on every interaction
  - No remote calls or external datasets required
  - Stable across browsers and easy to test
- Known omissions:
  - No atmospheric refraction correction
  - No topographic or urban horizon effects
  - No daylight-saving or legal time calculations
  - No leap-year branch in the current UI

## Why this approach

The project goal was a small real tool that could be finished in one session, work offline, and still be useful. A pure latitude-based daylight model is a good fit because it avoids fake integrations and still produces a meaningful visualization for travel planning, outdoor routines, and seasonal comparison.
