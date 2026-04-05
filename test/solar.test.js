import test from "node:test";
import assert from "node:assert/strict";

import {
  buildYearSeries,
  daylightHours,
  formatHours,
  seasonLabel,
  summarizeYear
} from "../src/solar.js";

test("equatorial daylight stays close to twelve hours near the equinox", () => {
  const hours = daylightHours(0, 80);
  assert.ok(hours > 11.9 && hours < 12.1);
});

test("higher northern latitudes have longer June days than December days", () => {
  const june = daylightHours(52, 172);
  const december = daylightHours(52, 355);
  assert.ok(june > december);
  assert.ok(june > 16);
  assert.ok(december < 8.5);
});

test("polar daylight clamps to full or zero day when the geometry demands it", () => {
  assert.equal(daylightHours(70, 172), 24);
  assert.equal(daylightHours(70, 355), 0);
});

test("year summary identifies longest and shortest days in the expected order", () => {
  const summary = summarizeYear(40, 100);
  assert.ok(summary.longest.daylight > summary.shortest.daylight);
  assert.equal(summary.season, "Spring ramp");
});

test("buildYearSeries returns one entry per day of a non-leap year", () => {
  const series = buildYearSeries(-33.9);
  assert.equal(series.length, 365);
  assert.ok(series.every((entry) => entry.daylight >= 0 && entry.daylight <= 24));
});

test("formatted hour strings are stable for rounded minute values", () => {
  assert.equal(formatHours(12.5), "12h 30m");
});

test("southern hemisphere season labels invert the northern pattern", () => {
  assert.equal(seasonLabel(-30, 200), "Winter rebound");
  assert.equal(seasonLabel(-30, 300), "Spring ramp");
});
