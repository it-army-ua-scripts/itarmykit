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
        $t("dashboard.statistics")
      }}</q-card-section>
      <BitrateChartComponent class="fit" />
    </q-card>
    <q-card
      :class="[
        'execution-log-card q-mt-md',
        $q.dark.isActive ? 'execution-log-card--dark' : 'execution-log-card--light',
      ]"
      flat
      bordered
    >
      <q-card-section
        :class="[
          'execution-log-header text-bold text-h5 q-pb-sm',
          $q.dark.isActive ? 'execution-log-header--dark' : 'execution-log-header--light',
        ]"
      >
        {{ $t("modules.active.executionLog") }}:
      </q-card-section>
      <q-card-section class="q-pt-none">
        <CombinedLogOutputComponent />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script lang="ts" setup>
import { useQuasar } from "quasar";
import ModuleStatusComponent from "./ModuleStatusComponent.vue";
import BytesSendComponent from "./BytesSendComponent.vue";
import UpdateComponent from "./UpdateComponent.vue";
import ItArmyIDComponent from "./ItArmyIDComponent.vue";
import BitrateChartComponent from "./BitrateChartComponent.vue";
import CombinedLogOutputComponent from "../modules/CombinedLogOutputComponent.vue";
import ActivenessScoreComponent from "./ActivenessScoreComponent.vue";

const $q = useQuasar();
</script>

<style scoped>
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
