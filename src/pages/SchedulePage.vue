<template>
  <q-page class="schedule-page q-pa-md">
    <q-card flat bordered class="schedule-shell">
      <q-card-section class="schedule-header">
        <div>
          <div class="text-h6">{{ $t('schedule.title') }}</div>
          <div class="text-caption q-mt-xs">{{ $t('schedule.description') }}</div>
        </div>
        <q-chip
          dense
          square
          :color="enabled ? 'positive' : 'grey-6'"
          text-color="white"
          class="q-ml-md"
        >
          {{ enabled ? $t('dashboard.on') : $t('dashboard.off') }}
        </q-chip>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div class="schedule-toggle">
          <div>
            <div class="text-subtitle2 text-bold">{{ $t('schedule.enabled') }}</div>
            <div class="text-caption">{{ $t('schedule.enabledDescription') }}</div>
          </div>
          <q-toggle
            color="primary"
            v-model="enabled"
            @update:model-value="setEnabled"
          />
        </div>

        <div class="text-caption text-grey q-mt-sm">{{ $t('schedule.autoSaveHint') }}</div>

        <div class="text-subtitle1 text-bold q-mt-md q-mb-sm">{{ $t('schedule.intervalsTitle') }}</div>
        <div v-if="intervals.length === 0" class="text-caption q-mb-sm">{{ $t('schedule.noIntervals') }}</div>

        <q-card
          v-for="(interval, index) in intervals"
          :key="index"
          flat
          bordered
          class="interval-card q-mb-md"
        >
          <q-card-section>
            <div class="row items-center justify-between q-mb-sm">
              <div class="text-subtitle2 text-bold">#{{ index + 1 }}</div>
              <q-chip dense square color="primary" text-color="white">
                {{ interval.module }}
              </q-chip>
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-4">
                <q-input
                  outlined
                  :model-value="interval.startTime"
                  mask="time"
                  :rules="['time']"
                  :label="$t('schedule.startTime')"
                  :disable="!enabled"
                  @update:model-value="(value) => setIntervalStart(index, value)"
                >
                  <template v-slot:append>
                    <q-icon name="access_time" class="cursor-pointer">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-time
                          :model-value="interval.startTime"
                          @update:model-value="(value) => setIntervalStart(index, value)"
                        >
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup :label="$t('schedule.close')" color="primary" flat />
                          </div>
                        </q-time>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-md-4">
                <q-input
                  outlined
                  :model-value="interval.endTime"
                  mask="time"
                  :rules="['time']"
                  :label="$t('schedule.endTime')"
                  :disable="!enabled"
                  @update:model-value="(value) => setIntervalEnd(index, value)"
                >
                  <template v-slot:append>
                    <q-icon name="access_time" class="cursor-pointer">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-time
                          :model-value="interval.endTime"
                          @update:model-value="(value) => setIntervalEnd(index, value)"
                        >
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup :label="$t('schedule.close')" color="primary" flat />
                          </div>
                        </q-time>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-md-4">
                <q-select
                  outlined
                  :model-value="interval.module"
                  :options="moduleOptions"
                  emit-value
                  map-options
                  :label="$t('schedule.intervalModule')"
                  :disable="!enabled"
                  @update:model-value="(value) => setIntervalModule(index, value)"
                />
              </div>
            </div>

            <div class="q-mt-sm text-caption text-bold">{{ $t('schedule.daysTitle') }}</div>
            <div class="day-pills q-mt-xs">
              <q-btn
                v-for="day in dayOptions"
                :key="day.value"
                dense
                unelevated
                no-caps
                size="sm"
                :disable="!enabled"
                :color="interval.days.includes(day.value) ? 'primary' : 'grey-4'"
                :text-color="interval.days.includes(day.value) ? 'white' : 'dark'"
                :label="day.label"
                @click="toggleIntervalDay(index, day.value)"
              />
            </div>

            <div class="q-mt-sm">
              <q-btn
                outline
                color="negative"
                icon="delete"
                :label="$t('schedule.removeInterval')"
                :disable="!enabled"
                @click="removeInterval(index)"
              />
            </div>
          </q-card-section>
        </q-card>

        <q-btn
          class="add-interval-btn"
          outline
          color="primary"
          icon="add"
          :label="$t('schedule.addInterval')"
          :disable="!enabled"
          @click="addInterval"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ModuleName } from 'app/lib/module/module'
import { Platform, useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const $q = useQuasar()

const enabled = ref(false)
type ScheduleInterval = {
  startTime: string
  endTime: string
  days: number[]
  module: ModuleName
}
const intervals = ref<ScheduleInterval[]>([])

function cloneIntervals(items: ScheduleInterval[]): ScheduleInterval[] {
  return items.map((interval) => ({
    startTime: interval.startTime,
    endTime: interval.endTime,
    days: [...interval.days],
    module: interval.module
  }))
}

const moduleOptions = [
  { label: 'DISTRESS', value: 'DISTRESS' as ModuleName },
  ...(Platform.is.mac ? [] : [{ label: 'MHDDOS_PROXY', value: 'MHDDOS_PROXY' as ModuleName }])
]
const dayOptions = [
  { label: t('schedule.days.sun'), value: 0 },
  { label: t('schedule.days.mon'), value: 1 },
  { label: t('schedule.days.tue'), value: 2 },
  { label: t('schedule.days.wed'), value: 3 },
  { label: t('schedule.days.thu'), value: 4 },
  { label: t('schedule.days.fri'), value: 5 },
  { label: t('schedule.days.sat'), value: 6 }
]

async function setEnabled(newValue: boolean) {
  enabled.value = newValue
  await window.settingsAPI.schedule.setEnabled(newValue)
}

function normalizeDays(days: number[]): number[] {
  return Array.from(new Set(days.filter((day) => Number.isInteger(day) && day >= 0 && day <= 6))).sort()
}

async function saveIntervals(): Promise<boolean> {
  const payload = intervals.value.map((interval) => ({
    startTime: String(interval.startTime || ''),
    endTime: String(interval.endTime || ''),
    days: normalizeDays(interval.days || []),
    module: interval.module
  }))
  try {
    await window.settingsAPI.schedule.setIntervals(payload)
    return true
  } catch (err) {
    const errMsg = String(err || '')
    const overlapError = errMsg.toLowerCase().includes('overlap')
    $q.notify({
      type: 'negative',
      message: overlapError
        ? t('schedule.overlapError')
        : t('schedule.saveFailed', { error: errMsg })
    })
    return false
  }
}

async function setIntervalStart(index: number, newValue: string | number | null) {
  const previous = cloneIntervals(intervals.value)
  const value = String(newValue || '')
  intervals.value[index].startTime = value
  if (!(await saveIntervals())) {
    intervals.value = previous
  }
}

async function setIntervalEnd(index: number, newValue: string | number | null) {
  const previous = cloneIntervals(intervals.value)
  const value = String(newValue || '')
  intervals.value[index].endTime = value
  if (!(await saveIntervals())) {
    intervals.value = previous
  }
}

async function toggleIntervalDay(index: number, day: number) {
  const previous = cloneIntervals(intervals.value)
  const current = new Set(intervals.value[index].days)
  if (current.has(day)) {
    current.delete(day)
  } else {
    current.add(day)
  }
  intervals.value[index].days = normalizeDays(Array.from(current))
  if (!(await saveIntervals())) {
    intervals.value = previous
  }
}

async function setIntervalModule(index: number, newValue: ModuleName | string | null) {
  const previous = cloneIntervals(intervals.value)
  const value = String(newValue || '')
  const selected = moduleOptions.find((option) => option.value === value)?.value
  if (!selected) {
    return
  }
  intervals.value[index].module = selected
  if (!(await saveIntervals())) {
    intervals.value = previous
  }
}

async function addInterval() {
  const previous = cloneIntervals(intervals.value)
  intervals.value.push({
    startTime: '07:30',
    endTime: '17:30',
    days: [],
    module: moduleOptions[0].value
  })
  if (!(await saveIntervals())) {
    intervals.value = previous
  }
}

async function removeInterval(index: number) {
  const previous = cloneIntervals(intervals.value)
  intervals.value.splice(index, 1)
  if (!(await saveIntervals())) {
    intervals.value = previous
  }
}

async function loadSettings() {
  const settings = await window.settingsAPI.get()
  enabled.value = settings.schedule.enabled
  intervals.value = settings.schedule.intervals.map((interval) => ({
    startTime: interval.startTime,
    endTime: interval.endTime,
    days: normalizeDays(interval.days),
    module: moduleOptions.some((option) => option.value === interval.module) ? interval.module : moduleOptions[0].value
  }))
  if (intervals.value.length === 0) {
    intervals.value = [{
      startTime: settings.schedule.startTime || '07:30',
      endTime: settings.schedule.endTime || '17:30',
      days: [0, 1, 2, 3, 4, 5, 6],
      module: moduleOptions[0].value
    }]
  }
}

onMounted(async () => {
  await loadSettings()
})
</script>

<style scoped>
.schedule-page {
  display: flex;
  justify-content: center;
}

.schedule-shell {
  width: 100%;
  max-width: 1080px;
  border-radius: 14px;
}

.schedule-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.schedule-toggle {
  border: 1px solid rgba(148, 163, 184, 0.28);
  border-radius: 12px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.interval-card {
  border-radius: 12px;
  border-color: rgba(148, 163, 184, 0.35);
  background: rgba(148, 163, 184, 0.04);
}

.day-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.add-interval-btn {
  width: 100%;
}
</style>
