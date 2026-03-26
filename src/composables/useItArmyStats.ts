import { computed, onMounted, onUnmounted, readonly, ref } from 'vue'

const REFRESH_INTERVAL_MS = 5000

const login = ref('')
const totalTraffic = ref(0)
const available = ref(false)
const apiKeyEmpty = ref(false)
const error = ref('')
const loaded = ref(false)

let refreshInterval: ReturnType<typeof setInterval> | undefined
let activeConsumers = 0
let inFlightRequest: Promise<void> | null = null

async function refreshSharedStats () {
  if (inFlightRequest) {
    return await inFlightRequest
  }

  inFlightRequest = (async () => {
    const response = await window.itArmyAPI.getStats()

    if (response.success) {
      login.value = response.data.login
      totalTraffic.value = response.data.totalTraffic
      available.value = true
      apiKeyEmpty.value = false
      error.value = ''
    } else {
      available.value = false
      apiKeyEmpty.value = response.error === 'EMPTY_API_KEY'
      error.value = response.error === 'EMPTY_API_KEY' ? '' : JSON.stringify(response)
    }

    loaded.value = true
  })().finally(() => {
    inFlightRequest = null
  })

  await inFlightRequest
}

function startSharedPolling () {
  activeConsumers += 1
  if (activeConsumers > 1) {
    return
  }

  void refreshSharedStats()
  refreshInterval = setInterval(() => {
    void refreshSharedStats()
  }, REFRESH_INTERVAL_MS)
}

function stopSharedPolling () {
  activeConsumers = Math.max(0, activeConsumers - 1)
  if (activeConsumers !== 0) {
    return
  }

  if (refreshInterval !== undefined) {
    clearInterval(refreshInterval)
    refreshInterval = undefined
  }
}

export function useItArmyStats () {
  onMounted(() => {
    startSharedPolling()
  })

  onUnmounted(() => {
    stopSharedPolling()
  })

  return {
    login: readonly(login),
    totalTraffic: readonly(totalTraffic),
    available: readonly(available),
    apiKeyEmpty: readonly(apiKeyEmpty),
    error: readonly(error),
    loaded: readonly(loaded),
    hasData: computed(() => loaded.value && available.value),
    refresh: refreshSharedStats
  }
}
