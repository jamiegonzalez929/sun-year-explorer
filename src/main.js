import {
  PRESET_LOCATIONS,
  buildYearSeries,
  clamp,
  dayOfYear,
  describeDay,
  formatHours,
  monthLabel,
  summarizeYear
} from "./solar.js";

const locationSelect = document.querySelector("#location-select");
const latitudeRange = document.querySelector("#latitude-range");
const latitudeInput = document.querySelector("#latitude-input");
const currentDaylight = document.querySelector("#current-daylight");
const noonAltitude = document.querySelector("#noon-altitude");
const longestDay = document.querySelector("#longest-day");
const shortestDay = document.querySelector("#shortest-day");
const seasonChip = document.querySelector("#season-chip");
const lineChart = document.querySelector("#line-chart");
const heatmap = document.querySelector("#heatmap");
const explainer = document.querySelector("#explainer");

const monthStarts = [1, 32, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335];

for (const location of PRESET_LOCATIONS) {
  const option = document.createElement("option");
  option.value = String(location.latitude);
  option.textContent = location.label;
  locationSelect.append(option);
}

locationSelect.value = String(PRESET_LOCATIONS[0].latitude);
latitudeRange.value = String(PRESET_LOCATIONS[0].latitude);
latitudeInput.value = String(PRESET_LOCATIONS[0].latitude);

function getLatitude() {
  return clamp(Number(latitudeInput.value), -66, 66);
}

function syncLatitude(value, source = "custom") {
  const latitude = clamp(Number(value), -66, 66);
  latitudeRange.value = String(latitude);
  latitudeInput.value = String(latitude);

  if (source === "preset") {
    locationSelect.value = String(latitude);
  } else {
    const matchingPreset = PRESET_LOCATIONS.find(
      (entry) => Math.abs(entry.latitude - latitude) < 0.0001
    );
    locationSelect.value = matchingPreset ? String(matchingPreset.latitude) : "";
  }

  render(latitude);
}

function buildLineChart(series) {
  const width = 920;
  const height = 280;
  const left = 44;
  const bottom = 32;
  const top = 16;
  const innerWidth = width - left - 18;
  const innerHeight = height - top - bottom;

  const points = series
    .map((entry, index) => {
      const x = left + (index / (series.length - 1)) * innerWidth;
      const y = top + innerHeight - (entry.daylight / 24) * innerHeight;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  const monthLines = monthStarts
    .map((dayIndex, index) => {
      const x = left + ((dayIndex - 1) / (series.length - 1)) * innerWidth;
      return `
        <line x1="${x}" y1="${top}" x2="${x}" y2="${top + innerHeight}" class="grid-line" />
        <text x="${x}" y="${height - 8}" text-anchor="middle" class="axis-label">${monthLabel(
          index
        )}</text>
      `;
    })
    .join("");

  const hourLines = [0, 6, 12, 18, 24]
    .map((hour) => {
      const y = top + innerHeight - (hour / 24) * innerHeight;
      return `
        <line x1="${left}" y1="${y}" x2="${left + innerWidth}" y2="${y}" class="grid-line" />
        <text x="${left - 10}" y="${y + 4}" text-anchor="end" class="axis-label">${hour}h</text>
      `;
    })
    .join("");

  lineChart.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Line chart of daylight hours through the year">
      ${hourLines}
      ${monthLines}
      <polyline class="trend-area" points="${points} ${left + innerWidth},${top + innerHeight} ${left},${top + innerHeight}" />
      <polyline class="trend-line" points="${points}" />
    </svg>
  `;
}

function colorForHours(hours) {
  const hue = 210 - (hours / 24) * 170;
  const lightness = 28 + (hours / 24) * 42;
  return `hsl(${hue} 78% ${lightness}%)`;
}

function buildHeatmap(series) {
  heatmap.innerHTML = "";
  const fragment = document.createDocumentFragment();

  monthStarts.forEach((start, monthIndex) => {
    const end = monthStarts[monthIndex + 1] ?? 366;
    const card = document.createElement("section");
    card.className = "month-card";
    card.innerHTML = `<h3>${monthLabel(monthIndex)}</h3>`;

    const grid = document.createElement("div");
    grid.className = "month-grid";

    for (let day = start; day < end; day += 1) {
      const tile = document.createElement("div");
      const daylight = series[day - 1].daylight;
      tile.className = "day-tile";
      tile.style.background = colorForHours(daylight);
      tile.title = `${describeDay(day)}: ${formatHours(daylight)}`;
      tile.setAttribute("aria-label", tile.title);
      grid.append(tile);
    }

    card.append(grid);
    fragment.append(card);
  });

  heatmap.append(fragment);
}

function render(latitude) {
  const todayIndex = dayOfYear(new Date());
  const summary = summarizeYear(latitude, todayIndex);
  const series = buildYearSeries(latitude);

  currentDaylight.textContent = formatHours(summary.today.daylight);
  noonAltitude.textContent = `${summary.today.noonAltitude.toFixed(1)}°`;
  longestDay.textContent = `${formatHours(summary.longest.daylight)} on ${describeDay(
    summary.longest.dayIndex
  )}`;
  shortestDay.textContent = `${formatHours(summary.shortest.daylight)} on ${describeDay(
    summary.shortest.dayIndex
  )}`;
  seasonChip.textContent = summary.season;
  explainer.textContent =
    latitude >= 0
      ? "Northern-hemisphere latitudes peak in June and compress in December."
      : "Southern-hemisphere latitudes peak in December and compress in June.";

  buildLineChart(series);
  buildHeatmap(series);
}

locationSelect.addEventListener("change", (event) => {
  syncLatitude(event.target.value, "preset");
});

latitudeRange.addEventListener("input", (event) => {
  syncLatitude(event.target.value);
});

latitudeInput.addEventListener("change", (event) => {
  syncLatitude(event.target.value);
});

render(getLatitude());
