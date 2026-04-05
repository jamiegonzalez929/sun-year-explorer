const DAYS_IN_YEAR = 365;

export const PRESET_LOCATIONS = [
  { id: "brooklyn", label: "Brooklyn, USA", latitude: 40.6782 },
  { id: "reykjavik", label: "Reykjavik, Iceland", latitude: 64.1466 },
  { id: "quito", label: "Quito, Ecuador", latitude: -0.1807 },
  { id: "melbourne", label: "Melbourne, Australia", latitude: -37.8136 },
  { id: "tromso", label: "Tromso, Norway", latitude: 69.6492 }
];

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function dayOfYear(date) {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const current = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  );
  return Math.floor((current - start) / 86400000);
}

export function solarDeclination(dayIndex) {
  const angle = (2 * Math.PI * (dayIndex + 10)) / DAYS_IN_YEAR;
  return (-23.44 * Math.cos(angle) * Math.PI) / 180;
}

export function daylightHours(latitude, dayIndex) {
  const latRad = (latitude * Math.PI) / 180;
  const decl = solarDeclination(dayIndex);
  const cosineHourAngle = -Math.tan(latRad) * Math.tan(decl);

  if (cosineHourAngle <= -1) {
    return 24;
  }

  if (cosineHourAngle >= 1) {
    return 0;
  }

  return (24 * Math.acos(cosineHourAngle)) / Math.PI;
}

export function solarNoonAltitude(latitude, dayIndex) {
  const declinationDegrees = (solarDeclination(dayIndex) * 180) / Math.PI;
  return 90 - Math.abs(latitude - declinationDegrees);
}

export function formatHours(hours) {
  const totalMinutes = Math.round(hours * 60);
  const wholeHours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${wholeHours}h ${String(minutes).padStart(2, "0")}m`;
}

export function seasonLabel(latitude, dayIndex) {
  const north = [
    { threshold: 80, name: "Winter rebound" },
    { threshold: 172, name: "Spring ramp" },
    { threshold: 266, name: "Summer stretch" },
    { threshold: 355, name: "Autumn slide" },
    { threshold: Infinity, name: "Winter rebound" }
  ];
  const south = [
    { threshold: 80, name: "Summer stretch" },
    { threshold: 172, name: "Autumn slide" },
    { threshold: 266, name: "Winter rebound" },
    { threshold: 355, name: "Spring ramp" },
    { threshold: Infinity, name: "Summer stretch" }
  ];

  const labels = latitude >= 0 ? north : south;
  return labels.find((entry) => dayIndex < entry.threshold).name;
}

export function monthLabel(monthIndex) {
  return new Date(Date.UTC(2025, monthIndex, 1)).toLocaleString("en-US", {
    month: "short",
    timeZone: "UTC"
  });
}

export function buildYearSeries(latitude) {
  return Array.from({ length: DAYS_IN_YEAR }, (_, index) => {
    const dayIndex = index + 1;
    return {
      dayIndex,
      daylight: daylightHours(latitude, dayIndex),
      noonAltitude: solarNoonAltitude(latitude, dayIndex)
    };
  });
}

export function summarizeYear(latitude, currentDay = dayOfYear(new Date())) {
  const series = buildYearSeries(latitude);
  const longest = series.reduce((best, entry) =>
    entry.daylight > best.daylight ? entry : best
  );
  const shortest = series.reduce((best, entry) =>
    entry.daylight < best.daylight ? entry : best
  );
  const today = series[currentDay - 1];

  return {
    today,
    longest,
    shortest,
    season: seasonLabel(latitude, currentDay)
  };
}

export function describeDay(dayIndex) {
  const date = new Date(Date.UTC(2025, 0, dayIndex));
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC"
  });
}
