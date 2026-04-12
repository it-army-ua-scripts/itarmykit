<template>
  <q-page padding>
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
      class="execution-log-card q-mt-md"
      flat
      bordered
    >
      <q-card-section class="execution-log-header text-bold text-h5 q-pb-sm">
        {{ $t('modules.active.executionLog') }}:
      </q-card-section>
      <q-card-section class="q-pt-none">
        <CombinedLogOutputComponent />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script lang="ts" setup>
import ModuleStatusComponent from './ModuleStatusComponent.vue'
import BytesSendComponent from './BytesSendComponent.vue'
import ItArmyIDComponent from './ItArmyIDComponent.vue'
import BitrateChartComponent from './BitrateChartComponent.vue'
import CombinedLogOutputComponent from '../modules/CombinedLogOutputComponent.vue'
import ActivenessScoreComponent from './ActivenessScoreComponent.vue'
</script>

<style scoped>
.execution-log-card {
  border-radius: 12px;
  background: var(--app-panel-bg);
  border-color: var(--app-panel-border);
}

.execution-log-header {
  border-bottom-width: 1px;
  border-bottom-style: solid;
  border-bottom-color: var(--app-panel-header-border);
}
</style>
