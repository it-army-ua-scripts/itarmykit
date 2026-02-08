<template>
  <q-page padding>
    <div class="text-h4 text-center text-bold q-mb-md">
      {{ $t("top.volunteers") }}
    </div>
    <q-tabs v-model="activeTab" dense>
      <q-tab name="weekly" :label="$t('top.week')" />
      <q-tab name="monthly" :label="$t('top.month')" />
      <q-tab name="activeness" :label="$t('top.activeness')" />
    </q-tabs>

    <q-separator class="q-mb-sm" />

    <q-tab-panels v-model="activeTab" animated class="bg-transparent">
      <q-tab-panel name="weekly" class="bg-transparent">
        <div class="top-list">
          <q-card
            v-for="(row, idx) in topWeek"
            :key="row.name + row.traffic"
            flat
            bordered
            class="top-list-item"
            :class="idx < 3 ? 'top-list-item--leader' : ''"
          >
            <div v-if="idx < 3" class="top-list-rank">#{{ idx + 1 }}</div>

            <div class="top-list-label">Traffic</div>
            <div class="top-list-value">{{ humanBytesString(row.traffic) }}</div>

            <div class="top-list-label">Name</div>
            <div class="top-list-value">{{ row.name }}</div>

            <div class="top-list-label">Servers</div>
            <div class="top-list-value">{{ row.servers }}</div>
          </q-card>
        </div>
      </q-tab-panel>
      <q-tab-panel name="monthly" class="bg-transparent">
        <div class="top-list">
          <q-card
            v-for="(row, idx) in topMonth"
            :key="row.name + row.traffic"
            flat
            bordered
            class="top-list-item"
            :class="idx < 3 ? 'top-list-item--leader' : ''"
          >
            <div v-if="idx < 3" class="top-list-rank">#{{ idx + 1 }}</div>

            <div class="top-list-label">Traffic</div>
            <div class="top-list-value">{{ humanBytesString(row.traffic) }}</div>

            <div class="top-list-label">Name</div>
            <div class="top-list-value">{{ row.name }}</div>

            <div class="top-list-label">Servers</div>
            <div class="top-list-value">{{ row.servers }}</div>
          </q-card>
        </div>
      </q-tab-panel>
      <q-tab-panel name="activeness" class="bg-transparent">
        <div class="top-list">
          <q-card
            v-for="(row, idx) in activenessTop10"
            :key="row.name + row.score"
            flat
            bordered
            class="top-list-item"
            :class="idx < 3 ? 'top-list-item--leader' : ''"
          >
            <div v-if="idx < 3" class="top-list-rank">#{{ idx + 1 }}</div>

            <div class="top-list-label">Name</div>
            <div class="top-list-value">{{ row.name }}</div>

            <div class="top-list-label">Score</div>
            <div class="top-list-value">{{ row.score }}</div>
          </q-card>
        </div>
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script setup lang="ts">
import { UserStat } from "app/lib/activeness/api";
import { useQuasar } from "quasar";
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";

const $q = useQuasar();
const $i18n = useI18n();

const activeTab = ref("weekly");

function humanBytesString(bytes: number, dp = 1) {
  const thresh = 1024; // 1024 instead of 1000 to be consistent with other places

  if (Math.abs(bytes) < thresh) {
    return bytes + " B";
  }

  const units = ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  let u = -1;
  const r = 10 ** dp;

  do {
    bytes /= thresh;
    ++u;
  } while (
    Math.round(Math.abs(bytes) * r) / r >= thresh &&
    u < units.length - 1
  );

  return bytes.toFixed(dp) + " " + units[u];
}


const topWeek = ref(
  [] as Array<{
    traffic: number;
    name: string;
    servers: number;
  }>
);

const topMonth = ref(
  [] as Array<{
    traffic: number;
    name: string;
    servers: number;
  }>
);

async function loadTop() {
  const weeklyTop = await window.topAPI.getWeeklyTop();
  topWeek.value = [];
  for (const entry of weeklyTop.data.week_stats.items) {
    topWeek.value.push({
      traffic: entry.traffic,
      name: entry.user_name,
      servers: entry.servers_count,
    });
  }
  topMonth.value = [];
  for (const entry of weeklyTop.data.month_stats.items) {
    topMonth.value.push({
      traffic: entry.traffic,
      name: entry.user_name,
      servers: entry.servers_count,
    });
  }
}

const activenessTop10 = ref<UserStat[]>([]);
async function loadActiveness() {
  const stats = await window.activenessAPI.getStats();
  if (stats.status != "ok") {
    $q.notify({
      message: $i18n.t("top.activenessData.notifyLoadFailed", {
        error: JSON.stringify(stats),
      }),
      type: "negative",
      timeout: 5000,
    });
    return;
  }

  activenessTop10.value = stats.top10;
}

onMounted(async () => {
  await loadTop();
  await loadActiveness();
});
</script>

<style scoped>
.top-list {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.top-list-item {
  padding: 12px;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
  border: 1px solid #e6e6e6;
  text-align: center;
  position: relative;
}

.top-list-label {
  font-size: 12px;
  text-transform: uppercase;
  color: #6b6b6b;
  margin-bottom: 2px;
  letter-spacing: 0.4px;
}

.top-list-value {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 8px;
  word-break: break-word;
}

.top-list-item--leader {
  border-color: #f0c419;
  box-shadow: 0 8px 20px rgba(240, 196, 25, 0.2);
}

.top-list-rank {
  position: absolute;
  top: 8px;
  left: 8px;
  background: #f0c419;
  color: #111;
  font-weight: 800;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 6px;
}

body.q-dark .top-list-item,
body.body--dark .top-list-item,
.q-dark .top-list-item {
  background: #1f1f1f;
  border-color: #3a3a3a;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
}

body.q-dark .top-list-label,
body.body--dark .top-list-label,
.q-dark .top-list-label {
  color: #a5a5a5;
}

body.q-dark .top-list-value,
body.body--dark .top-list-value,
.q-dark .top-list-value {
  color: #f2f2f2;
}

body.q-dark .top-list-item--leader,
body.body--dark .top-list-item--leader,
.q-dark .top-list-item--leader {
  border-color: #f0c419;
  box-shadow: 0 8px 20px rgba(240, 196, 25, 0.35);
}

@media (max-width: 1400px) {
  .top-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .top-list {
    grid-template-columns: 1fr;
  }
}
</style>
