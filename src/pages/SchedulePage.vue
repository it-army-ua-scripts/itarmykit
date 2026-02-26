<template>
  <q-page class="q-pa-md">
    <q-card flat bordered>
      <q-card-section>
        <div class="text-h6">{{ $t('schedule.title') }}</div>
        <div class="text-caption q-mt-xs">{{ $t('schedule.description') }}</div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-item clickable v-ripple @click="setEnabled(!enabled)">
          <q-item-section>
            <q-item-label>{{ $t('schedule.enabled') }}</q-item-label>
            <q-item-label caption>{{ $t('schedule.enabledDescription') }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle
              color="primary"
              v-model="enabled"
              @update:model-value="setEnabled"
            />
          </q-item-section>
        </q-item>

        <div class="text-subtitle1 text-bold q-mt-sm q-mb-sm">{{ $t('schedule.intervalsTitle') }}</div>
        <div v-if="intervals.length === 0" class="text-caption q-mb-sm">{{ $t('schedule.noIntervals') }}</div>

        <q-card
          v-for="(interval, index) in intervals"
          :key="index"
          flat
          bordered
          class="q-mb-md"
        >
          <q-card-section>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
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

              <div class="col-12 col-md-6">
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

              <div class="col-12 col-md-6">
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

            <div class="q-mt-sm text-caption">{{ $t('schedule.daysTitle') }}</div>
            <q-option-group
              :model-value="interval.days"
              type="checkbox"
              :options="dayOptions"
              color="primary"
              inline
              :disable="!enabled"
              @update:model-value="(value) => setIntervalDays(index, value)"
            />

            <div class="q-mt-sm">
              <q-btn
                outline
                color="negative"
                icon="delete"
                :label="$t('schedule.removeInterval')"
                :disable="!enabled || intervals.length <= 1"
                @click="removeInterval(index)"
              />
            </div>
          </q-card-section>
        </q-card>

        <q-btn
          outline
          color="primary"
          icon="add"
          :label="$t('schedule.addInterval')"
          :disable="!enabled"
          @click="addInterval"
        />
      </q-card-section>

      <q-separator />
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ModuleName } from 'app/lib/module/module'
import { Platform } from 'quasar'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const enabled = ref(false)
type ScheduleInterval = {
  startTime: string
  endTime: string
  days: number[]
  module: ModuleName
}
const intervals = ref<ScheduleInterval[]>([])

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

async function saveIntervals() {
  const payload = intervals.value.map((interval) => ({
    startTime: String(interval.startTime || ''),
    endTime: String(interval.endTime || ''),
    days: normalizeDays(interval.days || []),
    module: interval.module
  }))
  await window.settingsAPI.schedule.setIntervals(payload)
}

async function setIntervalStart(index: number, newValue: string | number | null) {
  const value = String(newValue || '')
  intervals.value[index].startTime = value
  await saveIntervals()
}

async function setIntervalEnd(index: number, newValue: string | number | null) {
  const value = String(newValue || '')
  intervals.value[index].endTime = value
  await saveIntervals()
}

async function setIntervalDays(index: number, newValue: number[]) {
  intervals.value[index].days = normalizeDays(newValue)
  await saveIntervals()
}

async function setIntervalModule(index: number, newValue: ModuleName | string | null) {
  const value = String(newValue || '')
  const selected = moduleOptions.find((option) => option.value === value)?.value
  if (!selected) {
    return
  }
  intervals.value[index].module = selected
  await saveIntervals()
}

async function addInterval() {
  intervals.value.push({
    startTime: '07:30',
    endTime: '17:30',
    days: [1, 2, 3, 4, 5],
    module: moduleOptions[0].value
  })
  await saveIntervals()
}

async function removeInterval(index: number) {
  intervals.value.splice(index, 1)
  if (intervals.value.length === 0) {
    intervals.value.push({
      startTime: '07:30',
      endTime: '17:30',
      days: [0, 1, 2, 3, 4, 5, 6],
      module: moduleOptions[0].value
    })
  }
  await saveIntervals()
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
