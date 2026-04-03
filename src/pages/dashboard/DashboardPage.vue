<template>
  <q-page padding>
    <q-dialog v-model="showAnnouncementDialog">
      <q-card class="announcement-dialog">
        <q-card-section class="row items-center q-pb-sm">
          <div class="text-h6 text-bold">{{ $t('dashboard.announcement.title') }}</div>
          <q-space />
          <q-btn v-close-popup flat round dense icon="close" aria-label="Close" />
        </q-card-section>

        <q-card-section>
          <div class="announcement-dialog__content">{{ $t('dashboard.announcement.message') }}</div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn v-close-popup color="primary" :label="$t('dashboard.announcement.close')" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <div class="row">
      <div class="col-xs-12 col-sm-6 col-lg-3 q-pa-xs d-flex">
        <ModuleStatusComponent />
      </div>
      <div class="col-xs-12 col-sm-6 col-lg-3 q-pa-xs d-flex">
        <BytesSendComponent />
      </div>
      <div class="col-xs-12 col-sm-6 col-lg-3 q-pa-xs d-flex">
        <ActivenessScoreComponent />
      </div>
      <div class="col-xs-12 col-sm-6 col-lg-3 q-pa-xs d-flex">
        <ItArmyIDComponent />
      </div>
    </div>
    <q-card class="row q-mt-sm q-pa-md bg-transparent" flat bordered>
      <q-card-section class="text-bold text-h5 q-pa-none q-pl-md">{{
        $t('dashboard.statistics')
      }}</q-card-section>
      <BitrateChartComponent class="fit" />
    </q-card>
    <q-card
      :class="[
        'execution-log-card q-mt-md',
        $q.dark.isActive ? 'execution-log-card--dark' : 'execution-log-card--light'
      ]"
      flat
      bordered
    >
      <q-card-section
        :class="[
          'execution-log-header text-bold text-h5 q-pb-sm',
          $q.dark.isActive ? 'execution-log-header--dark' : 'execution-log-header--light'
        ]"
      >
        {{ $t('modules.active.executionLog') }}:
      </q-card-section>
      <q-card-section class="q-pt-none">
        <CombinedLogOutputComponent />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import ModuleStatusComponent from './ModuleStatusComponent.vue'
import BytesSendComponent from './BytesSendComponent.vue'
import ItArmyIDComponent from './ItArmyIDComponent.vue'
import BitrateChartComponent from './BitrateChartComponent.vue'
import CombinedLogOutputComponent from '../modules/CombinedLogOutputComponent.vue'
import ActivenessScoreComponent from './ActivenessScoreComponent.vue'

const $q = useQuasar()
const showAnnouncementDialog = ref(true)
</script>

<style scoped>
.announcement-dialog {
  width: min(720px, 92vw);
  max-width: 92vw;
}

.announcement-dialog__content {
  max-height: 55vh;
  overflow-y: auto;
  padding-right: 8px;
  white-space: pre-line;
  line-height: 1.6;
}

.execution-log-card {
  border-radius: 12px;
}

.execution-log-header {
  border-bottom-width: 1px;
  border-bottom-style: solid;
}

.execution-log-card--light {
  background: rgba(248, 250, 252, 0.62);
  border-color: rgba(148, 163, 184, 0.28);
}

.execution-log-header--light {
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
}

.execution-log-card--dark {
  background: rgba(15, 23, 42, 0.38);
  border-color: rgba(148, 163, 184, 0.24);
}

.execution-log-header--dark {
  border-bottom-color: rgba(148, 163, 184, 0.2);
}
</style>
