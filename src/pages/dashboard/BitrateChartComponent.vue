<template>
    <VueApexCharts
        width="100%"
        height="400"
        type="area"
        :options="chartOptions"
        :series="seriesData"
    />
</template>

<script lang="ts" setup>
import { ModuleExecutionEvent } from 'app/lib/module/module';
import { ModuleExecutionStartedEventData, ModuleExecutionStatisticsEventData } from 'app/lib/module/module';
import { ExecutionLogEntry } from 'app/src-electron/handlers/engine';
import { IpcRendererEvent } from 'electron';
import { onMounted, onUnmounted, ref, computed } from 'vue';
import VueApexCharts from 'vue3-apexcharts'

function humanBytesString(bytes: number, dp=1) {
  const thresh = 1000;

  if (Math.abs(bytes) < thresh) {
    return bytes + ' B';
  }

  const units = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  let u = -1;
  const r = 10**dp;

  do {
    bytes /= thresh;
    ++u;
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);


  return bytes.toFixed(dp) + ' ' + units[u];
}

const seriesData = ref([{
  data: [
  ] as Array<[number, number]>
}])

const executionEvents = ref([] as ExecutionLogEntry[])

const chartOptions = computed (() => { return {
  chart: {
    id: 'area-datetime',
    type: 'area',
    zoom: {
      autoScaleYaxis: true
    }
  },
  annotations: {
    xaxis: executionEvents.value.map((e) => {
      return {
        x: e.timestamp,
        yAxisIndex: 0,
        borderColor: '#999',
        label: {
          show: true,
          style: {
            color: '#fff',
            background: '#775DD0',
          },
          text: e.type,
        }
      }
    })
  },
  dataLabels: {
    enabled: false
  },
  markers: {
    size: 0,
    style: 'hollow',
  },
  xaxis: {
    type: 'datetime',
  },
  yaxis: {
    labels: {
      formatter: function (val: number) {
        return humanBytesString(val) + "/s"
      }
    }
  },
  tooltip: {

  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.7,
      opacityTo: 0.9,
      stops: [0, 100]
    }
  },
}})

async function loadInitialState() {
  const state = await window.executionEngineAPI.getState()
  seriesData.value[0].data = state.statistics.map((s) => [s.timestamp, Number(s.currentSendBitrate.toFixed())])
  // filter entries older than hour ago
  seriesData.value[0].data = seriesData.value[0].data.filter((s) => s[0] > Date.now() - 1000 * 60 * 60)

  executionEvents.value = state.executionLog
  console.log(executionEvents.value)
  console.log(chartOptions.value)
}

function onStatisticsUpdate(_e: IpcRendererEvent, data: ModuleExecutionStatisticsEventData) {
  seriesData.value[0].data.push([Date.now(), Number(data.currentSendBitrate.toFixed())])
  if (seriesData.value[0].data.length > 100) {
    seriesData.value[0].data.shift()
  }
}

onMounted(async () => {
    await loadInitialState()
    window.executionEngineAPI.listenForStatistics(onStatisticsUpdate)
})

onUnmounted(() => {
    window.executionEngineAPI.stopListeningForStatistics(onStatisticsUpdate)
})

</script>