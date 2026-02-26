<template>
    <q-scroll-area
        ref="scroll"
        outlined
        style="height: 260px; max-height: 360px;"
        :class="[
            'execution-log-scroll q-mt-sm',
            $q.dark.isActive ? 'execution-log-scroll--dark' : 'execution-log-scroll--light',
        ]"
    >
        <pre :class="['execution-log-pre', $q.dark.isActive ? 'execution-log-pre--dark' : 'execution-log-pre--light']">{{ log }}</pre>
    </q-scroll-area>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { IpcRendererEvent } from 'electron';
import { QScrollArea, useQuasar } from 'quasar';

const log = ref("")
const scroll = ref<QScrollArea>()
const $q = useQuasar()

async function loadState() {
    const executionEngineState = await window.executionEngineAPI.getState()
    log.value = executionEngineState.executionLog.map((e) => JSON.stringify(e) + "\n").join("")
    log.value += executionEngineState.stdOut.join("")
    log.value += executionEngineState.stdErr.join("")
    
    // Has to be executed after first draw of the component to be able to adjust size
    setTimeout(() => {
        scroll.value?.setScrollPercentage("vertical", 1, 1000)
    }, 500)
}

function onExecutionLog(_e: IpcRendererEvent, data: any) {
    data = JSON.stringify(data) + "\n"
    log.value += data
    while (log.value.length > 10000) {
        log.value = log.value.slice(1000)
    }
    scroll.value?.setScrollPercentage("vertical", 1, 1000)
}

function onStdOut(_e: IpcRendererEvent, data: string) {
    log.value += data
    while (log.value.length > 10000) {
        log.value = log.value.slice(1000)
    }
    scroll.value?.setScrollPercentage("vertical", 1, 1000)
}

function onStdErr(_e: IpcRendererEvent, data: string) {
    log.value += data
    while (log.value.length > 10000) {
        log.value = log.value.slice(1000)
    }
    scroll.value?.setScrollPercentage("vertical", 1, 1000)
}

onMounted(async () => {
    window.executionEngineAPI.listenForExecutionLog(onExecutionLog)
    window.executionEngineAPI.listenForStdOut(onStdOut)
    window.executionEngineAPI.listenForStdErr(onStdErr)
    await loadState()
})

onUnmounted(() => {
    window.executionEngineAPI.stopListeningForExecutionLog(onExecutionLog)
    window.executionEngineAPI.stopListeningForStdOut(onStdOut)
    window.executionEngineAPI.stopListeningForStdErr(onStdErr)
})

</script>

<style scoped>
.execution-log-scroll {
    border: 1px solid rgba(148, 163, 184, 0.28);
    border-radius: 12px;
}

.execution-log-scroll--light {
    background: rgba(241, 245, 249, 0.72);
}

.execution-log-pre {
    margin: 0;
    padding: 12px 14px;
    white-space: pre-wrap;
    word-break: break-word;
    font-size: 13px;
    line-height: 1.45;
    font-family: "JetBrains Mono", "Fira Code", "Consolas", monospace;
}

.execution-log-pre--light {
    color: #111827;
}

.execution-log-scroll--dark {
    border-color: rgba(148, 163, 184, 0.24);
    background: rgba(15, 23, 42, 0.45);
}

.execution-log-pre--dark {
    color: #e5e7eb;
}
</style>
