<template>
  <q-card flat bordered class="row bg-transparent full-height items-stretch" style="height: 100%;">
    <div class="stat-icon-box">
      <q-icon name="fa-solid fa-layer-group"></q-icon>
    </div>
    <div class="col q-pa-sm">
      <div class="text-caption text-uppercase text-bold text-grey">
        {{ $t("dashboard.moduleStatus") }}
      </div>
      <div class="text-subtitle1 text-bold">{{ displayMessage }}</div>
    </div>
    <div class="col-auto q-pa-sm">
      <q-toggle
        v-model="moduleEnabled"
        @update:model-value="setModuleEnabled"
      />
    </div>
  </q-card>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import { ModuleName } from "app/lib/module/module";

const selectedModule = ref("DISTRESS" as ModuleName | null);
const moduleEnabled = ref(false);

const displayMessage = computed(() => {
  if (selectedModule.value == null) {
    return "NOT CONFIGURED";
  }
  if (moduleEnabled.value) {
    return "RUNNING | " + selectedModule.value;
  }
  return "IDLE | " + selectedModule.value;
});

async function loadState() {
  const executionEngineState = await window.executionEngineAPI.getState();
  moduleEnabled.value = executionEngineState.run;
  selectedModule.value = executionEngineState.moduleToRun || null;
}

async function setModuleEnabled(newValue: boolean) {
  if (newValue) {
    await window.executionEngineAPI.startModule();
  } else {
    await window.executionEngineAPI.stopModule();
  }

  await loadState();
}

onMounted(async () => {
  await loadState();
});
</script>
