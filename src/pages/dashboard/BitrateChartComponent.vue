<template>
  <div class="chart-wrap">
    <div class="chart-top q-mb-sm">
      <div class="chart-metrics">
        <div class="metric-card">
          <div class="metric-label">{{ $t("dashboard.chart.now") }}</div>
          <div class="metric-value">
            {{ humanBytesString(summary.now) }}/s
            <q-tooltip v-if="isCompact">
              <div>{{ $t("dashboard.chart.average") }}: {{ humanBytesString(summary.avg) }}/s</div>
              <div>{{ $t("dashboard.chart.peak") }}: {{ humanBytesString(summary.peak) }}/s</div>
            </q-tooltip>
          </div>
        </div>
        <div class="metric-card" v-if="!isCompact">
          <div class="metric-label">{{ $t("dashboard.chart.average") }}</div>
          <div class="metric-value">{{ humanBytesString(summary.avg) }}/s</div>
        </div>
        <div class="metric-card" v-if="!isCompact">
          <div class="metric-label">{{ $t("dashboard.chart.peak") }}</div>
          <div class="metric-value">{{ humanBytesString(summary.peak) }}/s</div>
        </div>
      </div>

      <div class="chart-controls">
        <button
          type="button"
          class="series-chip peak-marker-chip"
          :class="{ active: showPeakMarker }"
          :aria-pressed="showPeakMarker ? 'true' : 'false'"
          @click="showPeakMarker = !showPeakMarker"
        >
          <span class="dot dot-peak"></span>
          {{ $t("dashboard.chart.peak") }}
        </button>

        <div class="series-chips" v-if="!isCompact">
          <div class="series-chip">
            <span class="dot dot-bitrate"></span>
            {{ $t("dashboard.chart.bitrate") }}
          </div>
          <div class="series-chip">
            <span class="dot dot-trend"></span>
            {{ $t("dashboard.chart.trend") }}
          </div>
        </div>

        <q-btn-toggle
          v-model="selectedRange"
          dense
          unelevated
          no-caps
          class="range-toggle"
          :options="rangeOptions"
        />
      </div>
    </div>

    <VueApexCharts
      width="100%"
      :height="chartHeight"
      type="area"
      :options="chartOptions"
      :series="seriesData"
    />
  </div>
</template>

<script lang="ts" setup>
import { ModuleExecutionStatisticsEventData } from "app/lib/module/module";
import { IpcRendererEvent } from "electron";
import { computed, onMounted, onUnmounted, ref } from "vue";
import VueApexCharts from "vue3-apexcharts";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";

const $q = useQuasar();
const { t } = useI18n();
const MAX_RETENTION_MS = 1000 * 60 * 60 * 12; // 12h local retention
const BITRATE_SMOOTH_ALPHA = 0.55; // higher = closer to raw value

interface ExecutionLogEntry {
  type: "STARTED" | "STOPPED" | "ERROR";
  moduleName: "DISTRESS" | "MHDDOS_PROXY";
  timestamp: number;
}

const eventLabelMap: Record<ExecutionLogEntry["type"], string> = {
  STARTED: "dashboard.chart.events.started",
  STOPPED: "dashboard.chart.events.stopped",
  ERROR: "dashboard.chart.events.error",
};

type ChartRangeKey = "5m" | "15m" | "1h" | "6h";
const rangeToMs: Record<ChartRangeKey, number> = {
  "5m": 1000 * 60 * 5,
  "15m": 1000 * 60 * 15,
  "1h": 1000 * 60 * 60,
  "6h": 1000 * 60 * 60 * 6,
};
const rangeOptions = computed(() => [
  { label: t("dashboard.chart.ranges.m5"), value: "5m" as ChartRangeKey },
  { label: t("dashboard.chart.ranges.m15"), value: "15m" as ChartRangeKey },
  { label: t("dashboard.chart.ranges.h1"), value: "1h" as ChartRangeKey },
  { label: t("dashboard.chart.ranges.h6"), value: "6h" as ChartRangeKey },
]);
const selectedRange = ref<ChartRangeKey>("15m");
const showPeakMarker = ref(true);
const selectedRangeMs = computed(() => rangeToMs[selectedRange.value]);
const isCompact = computed(() => $q.screen.lt.md);
const chartHeight = computed(() => (isCompact.value ? 280 : 320));
const nowTs = ref(Date.now());
const rangeStartTs = computed(() => nowTs.value - selectedRangeMs.value);
let chartTick: number | undefined;

function humanBytesString(bytes: number, dp = 1) {
  const thresh = 1024;
  if (Math.abs(bytes) < thresh) {
    return `${bytes} B`;
  }

  const units = ["kB", "MB", "GB", "TB", "PB", "EB"];
  let u = -1;
  const r = 10 ** dp;

  do {
    bytes /= thresh;
    ++u;
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);

  return `${bytes.toFixed(dp)} ${units[u]}`;
}

const rawPoints = ref<Array<[number, number]>>([]);
const executionEvents = ref<ExecutionLogEntry[]>([]);

const visiblePoints = computed(() => {
  return rawPoints.value.filter((point) => point[0] >= rangeStartTs.value && point[0] <= nowTs.value);
});

const smoothedBitratePoints = computed(() => {
  let ema = 0;
  return visiblePoints.value.map((point, index) => {
    ema = index === 0 ? point[1] : BITRATE_SMOOTH_ALPHA * point[1] + (1 - BITRATE_SMOOTH_ALPHA) * ema;
    return [point[0], Math.round(ema)] as [number, number];
  });
});

const trendPoints = computed(() => {
  const alpha = 0.25;
  let ema = 0;
  return visiblePoints.value.map((point, index) => {
    ema = index === 0 ? point[1] : alpha * point[1] + (1 - alpha) * ema;
    return [point[0], Math.round(ema)] as [number, number];
  });
});

const displayedBitratePoints = computed(() => smoothedBitratePoints.value);

const effectiveRangeStartTs = computed(() => {
  if (displayedBitratePoints.value.length === 0) {
    return rangeStartTs.value;
  }
  const firstPointTs = displayedBitratePoints.value[0][0];
  return Math.max(firstPointTs, rangeStartTs.value);
});

const peakPoint = computed(() => {
  if (displayedBitratePoints.value.length === 0) {
    return null;
  }
  let peak = displayedBitratePoints.value[0];
  for (const point of displayedBitratePoints.value) {
    if (point[1] > peak[1]) {
      peak = point;
    }
  }
  return peak;
});

const visibleEvents = computed(() => {
  return executionEvents.value.filter(
    (entry) => entry.timestamp >= rangeStartTs.value && entry.timestamp <= nowTs.value
  );
});

const summary = computed(() => {
  if (visiblePoints.value.length === 0) {
    return { now: 0, avg: 0, peak: 0 };
  }

  const now = visiblePoints.value[visiblePoints.value.length - 1][1];
  const peak = visiblePoints.value.reduce((max, point) => Math.max(max, point[1]), 0);
  const avg =
    visiblePoints.value.reduce((acc, point) => acc + point[1], 0) / visiblePoints.value.length;
  return {
    now: Math.round(now),
    avg: Math.round(avg),
    peak: Math.round(peak),
  };
});

const seriesData = computed(() => [
  {
    name: t("dashboard.chart.bitrate"),
    data: displayedBitratePoints.value,
  },
  {
    name: t("dashboard.chart.trend"),
    data: trendPoints.value,
  },
]);

const chartOptions = computed(() => {
  const textColor = $q.dark.isActive ? "#e5e7eb" : "#1f2937";
  const mutedText = $q.dark.isActive ? "#9ca3af" : "#6b7280";
  const gridColor = $q.dark.isActive ? "rgba(148,163,184,0.14)" : "rgba(148,163,184,0.35)";
  const tooltipTheme = $q.dark.isActive ? "dark" : "light";
  const chartBg = $q.dark.isActive ? "rgba(17,24,39,0.14)" : "rgba(241,245,249,0.45)";
  const areaOpacity = $q.dark.isActive ? 0.24 : 0.14;
  const trendOpacity = $q.dark.isActive ? 0.3 : 0.22;

  return {
    chart: {
      id: "attack-power-datetime",
      type: "area",
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 450,
        dynamicAnimation: {
          enabled: true,
          speed: 450,
        },
      },
      zoom: {
        enabled: false,
      },
      toolbar: {
        show: false,
      },
      foreColor: textColor,
      background: chartBg,
    },
    colors: ["#f59e0b", "#06b6d4"],
    stroke: {
      curve: "smooth",
      width: [2.8, 2],
      dashArray: [0, 6],
    },
    dataLabels: {
      enabled: false,
    },
    markers: {
      size: 0,
      hover: {
        size: 4,
      },
    },
    fill: {
      type: ["gradient", "solid"],
      gradient: {
        shade: $q.dark.isActive ? "dark" : "light",
        shadeIntensity: 0.45,
        opacityFrom: areaOpacity,
        opacityTo: 0.03,
        stops: [0, 95],
      },
      opacity: [1, trendOpacity],
    },
    grid: {
      borderColor: gridColor,
      strokeDashArray: 4,
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    annotations: {
      points: showPeakMarker.value && peakPoint.value
        ? [
            {
              x: peakPoint.value[0],
              y: peakPoint.value[1],
              marker: {
                size: 5,
                fillColor: "#f59e0b",
                strokeColor: $q.dark.isActive ? "#0b1220" : "#ffffff",
                strokeWidth: 2,
              },
              label: {
                borderColor: "transparent",
                offsetY: -8,
                style: {
                  color: "#fff",
                  background: "#f59e0b",
                  fontSize: "11px",
                },
                text: `${t("dashboard.chart.peak")}: ${humanBytesString(peakPoint.value[1])}/s`,
              },
            },
          ]
        : [],
      xaxis: visibleEvents.value.map((event) => ({
        x: event.timestamp,
        borderColor: event.type === "ERROR" ? "#ef4444" : "rgba(100,116,139,0.55)",
        strokeDashArray: 4,
        label: {
          show: event.type === "ERROR",
          borderColor: "transparent",
          style: {
            color: "#fff",
            background: event.type === "ERROR" ? "#ef4444" : "#64748b",
            fontSize: "10px",
          },
          text: t(eventLabelMap[event.type]),
        },
      })),
    },
    xaxis: {
      type: "datetime",
      min: effectiveRangeStartTs.value,
      max: nowTs.value,
      labels: {
        datetimeUTC: false,
        style: {
          colors: mutedText,
        },
      },
      axisBorder: {
        color: gridColor,
      },
      axisTicks: {
        color: gridColor,
      },
    },
    yaxis: {
      labels: {
        formatter: (val: number) => `${humanBytesString(Math.max(0, val))}/s`,
        style: {
          colors: mutedText,
        },
      },
    },
    tooltip: {
      theme: tooltipTheme,
      x: {
        formatter: (value: number) =>
          new Date(value).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
      },
      y: {
        formatter: (value: number, ctx: any) => {
          const current = Math.max(0, value);
          if (ctx?.seriesIndex === 0) {
            const i = ctx?.dataPointIndex ?? -1;
            const prev = i > 0 ? displayedBitratePoints.value[i - 1]?.[1] ?? current : current;
            const delta = current - prev;
            const sign = delta > 0 ? "+" : "";
            return `${humanBytesString(current)}/s (${sign}${humanBytesString(delta)}/s)`;
          }
          return `${humanBytesString(current)}/s`;
        },
      },
    },
    legend: {
      show: false,
    },
    noData: {
      text: t("dashboard.chart.noData"),
      align: "center",
      verticalAlign: "middle",
      style: {
        color: mutedText,
      },
    },
    theme: {
      mode: $q.dark.isActive ? "dark" : "light",
    },
  };
});

function pruneOldData() {
  const minTs = nowTs.value - MAX_RETENTION_MS;
  rawPoints.value = rawPoints.value.filter((point) => point[0] >= minTs);
  executionEvents.value = executionEvents.value.filter((entry) => entry.timestamp >= minTs);
}

async function loadInitialState() {
  const state = await window.executionEngineAPI.getState();
  state.statistics.sort((a, b) => a.timestamp - b.timestamp);
  rawPoints.value = state.statistics.map((s) => [s.timestamp, Math.round(s.currentSendBitrate)]);
  executionEvents.value = state.executionLog
    .filter((entry) => entry.type === "STARTED" || entry.type === "STOPPED" || entry.type === "ERROR")
    .sort((a, b) => a.timestamp - b.timestamp);
  pruneOldData();
}

function onStatisticsUpdate(_e: IpcRendererEvent, data: ModuleExecutionStatisticsEventData) {
  nowTs.value = Date.now();
  rawPoints.value.push([data.timestamp || Date.now(), Math.round(data.currentSendBitrate)]);
  pruneOldData();
}

function onExecutionLogUpdate(_e: IpcRendererEvent, data: ExecutionLogEntry) {
  if (data.type !== "STARTED" && data.type !== "STOPPED" && data.type !== "ERROR") {
    return;
  }
  executionEvents.value.push(data);
  pruneOldData();
}

onMounted(async () => {
  await loadInitialState();
  chartTick = window.setInterval(() => {
    nowTs.value = Date.now();
  }, 1000);
  await window.executionEngineAPI.listenForStatistics(onStatisticsUpdate);
  await window.executionEngineAPI.listenForExecutionLog(onExecutionLogUpdate);
});

onUnmounted(() => {
  if (chartTick !== undefined) {
    clearInterval(chartTick);
    chartTick = undefined;
  }
  void window.executionEngineAPI.stopListeningForStatistics(onStatisticsUpdate);
  void window.executionEngineAPI.stopListeningForExecutionLog(onExecutionLogUpdate);
});
</script>

<style scoped>
.chart-wrap {
  width: 100%;
}

.chart-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.chart-metrics {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.metric-card {
  border: 1px solid rgba(148, 163, 184, 0.25);
  border-radius: 10px;
  padding: 5px 9px;
  min-width: 120px;
  background: rgba(148, 163, 184, 0.06);
}

.metric-label {
  font-size: 11px;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: #94a3b8;
}

.metric-value {
  font-size: 14px;
  font-weight: 700;
}

.chart-controls {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}

.series-chips {
  display: flex;
  align-items: center;
  gap: 8px;
}

.series-chip {
  border: 1px solid rgba(148, 163, 184, 0.25);
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  display: inline-block;
}

.dot-bitrate {
  background: #f59e0b;
}

.dot-trend {
  background: #06b6d4;
}

.dot-peak {
  background: #f59e0b;
}

.peak-marker-chip {
  cursor: pointer;
  background: rgba(148, 163, 184, 0.06);
  color: #94a3b8;
  transition: background-color 0.18s ease, border-color 0.18s ease, color 0.18s ease;
}

.peak-marker-chip:hover {
  border-color: rgba(245, 158, 11, 0.38);
}

.peak-marker-chip.active {
  color: #111827;
  font-weight: 700;
  border-color: rgba(245, 158, 11, 0.5);
  background: rgba(245, 158, 11, 0.18);
}

:global(body.body--dark) .peak-marker-chip.active {
  color: #f8fafc;
}

:deep(.range-toggle) {
  min-width: 248px;
}

:deep(.range-toggle .q-btn) {
  border: 1px solid rgba(148, 163, 184, 0.3);
  background: transparent;
  color: #94a3b8;
  min-width: 62px;
  flex: 1 1 0;
  padding: 0 8px;
}

:deep(.range-toggle .q-btn.q-btn--active) {
  background: rgba(59, 130, 246, 0.22);
  color: #fff;
  border-color: rgba(59, 130, 246, 0.45);
}

@media (max-width: 900px) {
  .chart-top {
    gap: 8px;
  }

  .chart-controls {
    width: 100%;
    justify-content: flex-end;
  }

  :deep(.range-toggle) {
    min-width: 224px;
  }

  .metric-card {
    min-width: 110px;
  }
}
</style>
