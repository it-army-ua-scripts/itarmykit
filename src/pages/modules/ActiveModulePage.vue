<template>
  <q-page>
    <MenuComponent />

    <div class="q-pa-md">
      <div class="text-h5 text-bold q-mb-md">
        {{ $t("modules.active.title") }}
      </div>

      <!-- Module Selection -->
      <div class="row items-center q-mb-lg">
        <div class="col-12">
          <span class="text-bold">{{ $t("modules.active.selectModule") }}:</span>
          <q-option-group
            v-model="selectedModule"
            :options="availableModules.map((m) => ({ label: m, value: m }))"
            color="primary"
            inline
            @update:model-value="setConfigDebounce"
          />
        </div>
      </div>

      <!-- Module Status Toggle -->
      <div class="row items-center q-mb-lg">
        <div class="col-12">
          <q-toggle
            v-model="moduleEnabled"
            @update:model-value="setModuleEnabled"
            :label="
              moduleEnabled
                ? $t('modules.active.running')
                : $t('modules.active.stopped')
            "
            color="primary"
            size="lg"
          />
        </div>
      </div>

      <q-separator class="q-my-lg" />

      <!-- Execution Log Section -->
      <div class="text-bold text-h6 q-mt-lg">
        {{ $t("modules.active.executionLog") }}:
      </div>
      <q-separator></q-separator>
      <q-input
        outlined
        v-model="executionLog"
        type="textarea"
        class="row q-mt-sm"
        rows="8"
        readonly
      />

      <!-- StdOut Log Section -->
      <div class="text-bold text-h6 q-mt-lg">
        {{ $t("modules.active.stdout") }}:
      </div>
      <q-separator></q-separator>
      <q-input
        outlined
        v-model="stdOUT"
        type="textarea"
        class="row q-mt-sm"
        rows="8"
        readonly
      />

      <!-- StdErr Log Section -->
      <div class="text-bold text-h6 q-mt-lg">
        {{ $t("modules.active.stderr") }}:
      </div>
      <q-separator></q-separator>
      <q-input
        outlined
        v-model="stdERR"
        type="textarea"
        class="row q-mt-sm"
        rows="8"
        readonly
      />

      <!-- Buffer Statistics -->
      <div class="row q-mt-lg">
        <div class="col-12">
          <div class="bg-blue-1 q-pa-md rounded-borders">
            <div class="text-caption text-grey-8">
              <strong>Execution Log:</strong> {{ executionLogLineCount }} lines,
              {{ formatBytes(executionLogSize) }}
            </div>
            <div class="text-caption text-grey-8 q-mt-xs">
              <strong>StdOut:</strong> {{ stdOutLineCount }} lines,
              {{ formatBytes(stdOutSize) }}
            </div>
            <div class="text-caption text-grey-8 q-mt-xs">
              <strong>StdErr:</strong> {{ stdErrLineCount }} lines,
              {{ formatBytes(stdErrSize) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { debounce } from "quasar";
import MenuComponent from "./MenuComponent.vue";
import { ModuleName } from "app/lib/module/module";
import { IpcRendererEvent } from "electron";
import CircularLogBuffer from "@/utils/CircularLogBuffer";

const moduleEnabled = ref(false);
const selectedModule = ref(null as ModuleName | null);
const availableModules = ref(["DISTRESS", "MHDDOS_PROXY"] as ModuleName[]);

// ✅ НОВІ буфери замість ref("")
const executionLogBuffer = new CircularLogBuffer(500);
const stdOutBuffer = new CircularLogBuffer(500);
const stdErrBuffer = new CircularLogBuffer(500);

// ✅ Computed properties для відображення
const executionLog = computed(() => executionLogBuffer.toString());
const stdOUT = computed(() => stdOutBuffer.toString());
const stdERR = computed(() => stdErrBuffer.toString());

// ✅ Computed properties для статистики
const executionLogLineCount = computed(() =>
  executionLogBuffer.getLineCount()
);
const executionLogSize = computed(() => executionLogBuffer.getSize());

const stdOutLineCount = computed(() => stdOutBuffer.getLineCount());
const stdOutSize = computed(() => stdOutBuffer.getSize());

const stdErrLineCount = computed(() => stdErrBuffer.getLineCount());
const stdErrSize = computed(() => stdErrBuffer.getSize());

/**
 * ✅ Завантажуємо попередні логи при монтуванні компонента
 */
async function loadState() {
  try {
    const executionEngineState = await window.executionEngineAPI.getState();
    moduleEnabled.value = executionEngineState.run;
    selectedModule.value = executionEngineState.moduleToRun || null;

    // ✅ Очищуємо буфери
    executionLogBuffer.clear();
    stdOutBuffer.clear();
    stdErrBuffer.clear();

    // ✅ Завантажуємо дані у буфери
    for (const entry of executionEngineState.executionLog) {
      const logLine = JSON.stringify(entry) + "\n";
      executionLogBuffer.push(logLine);
    }

    for (const line of executionEngineState.stdOut) {
      stdOutBuffer.push(line);
    }

    for (const line of executionEngineState.stdErr) {
      stdErrBuffer.push(line);
    }

    console.log("[ActiveModulePage] State loaded successfully");
  } catch (err) {
    console.error("[ActiveModulePage] Failed to load state:", err);
  }
}

/**
 * ✅ Налаштування модуля (debounce)
 */
const setConfigDebounce = debounce(setConfig, 1000);
async function setConfig() {
  try {
    await window.executionEngineAPI.setModuleToRun(
      selectedModule.value || undefined
    );
    console.log("[ActiveModulePage] Module config updated");
  } catch (err) {
    console.error("[ActiveModulePage] Failed to set config:", err);
  }
}

/**
 * ✅ Включення/виключення модуля
 */
async function setModuleEnabled(enable: boolean) {
  try {
    moduleEnabled.value = enable;
    if (enable) {
      console.log("[ActiveModulePage] Starting module");
      await window.executionEngineAPI.startModule();
      // ✅ Очищуємо буфери замість ref("")
      stdOutBuffer.clear();
      stdErrBuffer.clear();
    } else {
      console.log("[ActiveModulePage] Stopping module");
      await window.executionEngineAPI.stopModule();
    }
  } catch (err) {
    console.error("[ActiveModulePage] Failed to set module enabled:", err);
    moduleEnabled.value = !enable; // Повертаємо попередній стан
  }
}

/**
 * ✅ Обробник для execution log подій
 */
function onExecutionLog(_e: IpcRendererEvent, data: any) {
  const logLine = JSON.stringify(data) + "\n";
  executionLogBuffer.push(logLine);
}

/**
 * ✅ Обробник для stdout даних
 */
function onStdOut(_e: IpcRendererEvent, data: string) {
  stdOutBuffer.push(data);
}

/**
 * ✅ Обробник для stderr даних
 */
function onStdErr(_e: IpcRendererEvent, data: string) {
  stdErrBuffer.push(data);
}

/**
 * ✅ Форматування розміру в байтах
 */
function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * ✅ Lifecycle: Монтування компонента
 */
onMounted(async () => {
  console.log("[ActiveModulePage] Component mounted");

  // Реєструємо обробники для нових логів
  window.executionEngineAPI.listenForExecutionLog(onExecutionLog);
  window.executionEngineAPI.listenForStdOut(onStdOut);
  window.executionEngineAPI.listenForStdErr(onStdErr);

  // Завантажуємо попередні логи
  await loadState();

  console.log("[ActiveModulePage] Event listeners registered");
});

/**
 * ✅ Lifecycle: Демонтування компонента
 */
onUnmounted(() => {
  console.log("[ActiveModulePage] Component unmounting");

  // Видаляємо обробники
  window.executionEngineAPI.stopListeningForExecutionLog(onExecutionLog);
  window.executionEngineAPI.stopListeningForStdOut(onStdOut);
  window.executionEngineAPI.stopListeningForStdErr(onStdErr);

  // ✅ Очищуємо буфери при демонтуванні
  executionLogBuffer.clear();
  stdOutBuffer.clear();
  stdErrBuffer.clear();

  console.log("[ActiveModulePage] Component unmounted");
});
</script>

<style scoped lang="scss">
.rounded-borders {
  border-radius: 4px;
}
</style>