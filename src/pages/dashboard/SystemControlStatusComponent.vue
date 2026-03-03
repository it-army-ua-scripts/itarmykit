<template>
  <q-card flat bordered class="bg-transparent control-status-card">
    <div class="stat-icon-box">
      <q-icon name="fa-solid fa-sliders"></q-icon>
    </div>
    <div class="control-content q-pa-sm">
      <div class="text-caption text-uppercase text-bold text-grey">
        {{ $t("dashboard.control") }}
      </div>

      <div class="q-mt-xs row items-center no-wrap">
        <div class="text-caption status-label">{{ $t("dashboard.autostart") }}</div>
        <q-chip
          dense
          square
          :color="autoStartEnabled ? 'positive' : 'negative'"
          text-color="white"
          class="q-ml-sm"
        >
          {{ autoStartEnabled ? $t("dashboard.on") : $t("dashboard.off") }}
        </q-chip>
      </div>

      <div class="q-mt-xs row items-center no-wrap">
        <div class="text-caption status-label">{{ $t("dashboard.scheduler") }}</div>
        <q-chip
          dense
          square
          :color="scheduleEnabled ? 'positive' : 'negative'"
          text-color="white"
          class="q-ml-sm"
        >
          {{ scheduleEnabled ? $t("dashboard.on") : $t("dashboard.off") }}
        </q-chip>
      </div>

      <div class="text-caption text-grey-7 q-mt-xs">
        {{ $t("dashboard.intervals") }}: {{ intervalsCount }}
      </div>
      <div v-if="intervalLines.length > 0" class="intervals-list text-caption text-grey-7">
        <div v-for="interval in intervalLines" :key="interval">
          {{ interval }}
        </div>
      </div>
    </div>
  </q-card>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from "vue";

const autoStartEnabled = ref(false);
const scheduleEnabled = ref(false);
const intervalsCount = ref(0);
const intervalLines = ref<string[]>([]);

async function loadStatus() {
  const settings = await window.settingsAPI.get();
  autoStartEnabled.value = settings.system.startOnBoot;
  scheduleEnabled.value = settings.schedule.enabled;
  intervalsCount.value = settings.schedule.intervals.length;
  if (settings.schedule.intervals.length > 0) {
    intervalLines.value = settings.schedule.intervals
      .map((interval) => `${interval.startTime}-${interval.endTime}`);
  } else {
    intervalLines.value = [];
  }
}

let refreshInterval: ReturnType<typeof setInterval> | undefined;

onMounted(async () => {
  await loadStatus();
  refreshInterval = setInterval(() => {
    void loadStatus();
  }, 5000);
});

onUnmounted(() => {
  if (refreshInterval !== undefined) {
    clearInterval(refreshInterval);
    refreshInterval = undefined;
  }
});
</script>

<style scoped>
.control-status-card {
  display: flex;
  flex-wrap: nowrap;
  align-items: stretch;
  min-height: 124px;
  overflow: hidden;
}

.control-status-card .stat-icon-box {
  flex: 0 0 72px;
  min-width: 72px;
  align-self: stretch;
  height: auto;
  border-radius: 8px 0 0 8px;
}

.control-content {
  flex: 1 1 auto;
  min-width: 0;
}

.status-label {
  min-width: 86px;
}

.intervals-list {
  margin-top: 2px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.intervals-list > div {
  white-space: nowrap;
}
</style>
