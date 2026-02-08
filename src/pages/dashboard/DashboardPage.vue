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
    <div class="q-mt-md">
      <div class="text-bold text-h5 q-mt-lg">
        {{ $t("modules.active.executionLog") }}:
      </div>
      <q-separator></q-separator>
      <CombinedLogOutputComponent />
      <q-separator></q-separator>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import ModuleStatusComponent from "./ModuleStatusComponent.vue";
import BytesSendComponent from "./BytesSendComponent.vue";
import UpdateComponent from "./UpdateComponent.vue";
import ItArmyIDComponent from "./ItArmyIDComponent.vue";
import BitrateChartComponent from "./BitrateChartComponent.vue";
import CombinedLogOutputComponent from "../modules/CombinedLogOutputComponent.vue";
import ActivenessScoreComponent from "./ActivenessScoreComponent.vue";
</script>
