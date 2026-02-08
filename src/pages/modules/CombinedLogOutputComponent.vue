<template>
  <div class="log-container">
    <!-- ✅ Заголовок з інформацією -->
    <div class="log-header">
      <span class="log-title">
        Execution Log 
        ({{ logBuffer?.getLineCount() || 0 }} lines, 
        {{ formatBytes(logBuffer?.getSize() || 0) }})
      </span>
      
      <!-- ✅ Пошук логів -->
      <q-input
        v-model="searchQuery"
        dense
        debounce="300"
        placeholder="Search logs..."
        class="log-search"
        @update:model-value="onSearchChange"
      >
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
        <template v-slot:append v-if="searchQuery">
          <q-icon
            name="close"
            @click="clearSearch"
            class="cursor-pointer"
          />
        </template>
      </q-input>

      <!-- ✅ Кнопки дій -->
      <q-btn
        flat
        dense
        icon="delete"
        @click="clearLogs"
        title="Clear all logs"
      />
      <q-btn
        flat
        dense
        icon="download"
        @click="exportLogs"
        title="Export logs to file"
      />
    </div>

    <!-- ✅ Scroll area з логами -->
    <q-scroll-area
      ref="scrollArea"
      outlined
      class="log-area"
    >
      <pre class="log-content">{{ displayedLog }}</pre>
    </q-scroll-area>

    <!-- ✅ Статистика буфера -->
    <div class="log-stats">
      <span>{{ logBuffer?.getLineCount() || 0 }} / {{ maxLines }} lines</span>
      <span class="separator">|</span>
      <span>{{ formatBytes(logBuffer?.getSize() || 0) }} used</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { IpcRendererEvent } from 'electron'
import CircularLogBuffer from '@/utils/CircularLogBuffer'

const $q = useQuasar()

// ✅ Конфігурація буфера
const maxLines = 500

// ✅ Створюємо буфер для логів
const logBuffer = new CircularLogBuffer(maxLines)

// ✅ Стан компонента
const scrollArea = ref(null)
const searchQuery = ref('')

/**
 * ✅ Computed property: Показує відфільтровані логи
 * або всі логи, якщо пошук пустий
 */
const displayedLog = computed(() => {
  if (searchQuery.value) {
    // Якщо є пошук, показуємо тільки знайдені рядки
    const results = logBuffer.search(searchQuery.value)
    return results.join('\n')
  }
  // Інакше показуємо всі логи
  return logBuffer.toString()
})

/**
 * ✅ Завантажуємо попередні логи при монтуванні компонента
 */
async function loadState() {
  try {
    console.log('[CombinedLogOutput] Loading execution state...')
    const executionEngineState = await window.executionEngineAPI.getState()
    
    // Очищуємо буфер перед завантаженням
    logBuffer.clear()

    // ✅ Додаємо попередні execution логи
    for (const entry of executionEngineState.executionLog) {
      const logLine = `[${entry.type}] ${entry.message}`
      logBuffer.push(logLine)
    }

    // ✅ Додаємо stdout логи
    for (const line of executionEngineState.stdOut) {
      logBuffer.push(line)
    }

    // ✅ Додаємо stderr логи з префіксом
    for (const line of executionEngineState.stdErr) {
      logBuffer.push(`[ERROR] ${line}`)
    }

    console.log(
      `[CombinedLogOutput] Loaded ${logBuffer.getLineCount()} log lines`
    )
    
    // Скролимо в кінець
    scrollToBottom()
  } catch (err) {
    console.error('[CombinedLogOutput] Failed to load execution state:', err)
    $q.notify({
      type: 'negative',
      message: 'Failed to load execution state',
      timeout: 3000,
    })
  }
}

/**
 * ✅ Обробник для execution log подій
 * Викликається коли модуль емітує 'execution:started', 'execution:stopped' тощо
 */
function onExecutionLog(_e: IpcRendererEvent, data: any) {
  const logLine = `[${data.type}] ${data.message}`
  logBuffer.push(logLine)
  scrollToBottom()
}

/**
 * ✅ Обробник для stdout даних
 * Викликається коли модуль виводить текст у stdout
 */
function onStdOut(_e: IpcRendererEvent, data: string) {
  logBuffer.push(data)
  scrollToBottom()
}

/**
 * ✅ Обробник для stderr даних
 * Викликається коли модуль виводить помилку
 */
function onStdErr(_e: IpcRendererEvent, data: string) {
  logBuffer.push(`[STDERR] ${data}`)
  scrollToBottom()
}

/**
 * ✅ Автоматичний скролінг у кінець буфера
 * Викликається після додавання нових логів
 */
function scrollToBottom() {
  if (!scrollArea.value) return
  
  // Використовуємо requestAnimationFrame для гладкого скролінгу
  requestAnimationFrame(() => {
    scrollArea.value?.setScrollPercentage('vertical', 1, 100)
  })
}

/**
 * ✅ Очищення всіх логів
 */
function clearLogs() {
  logBuffer.clear()
  searchQuery.value = ''
  
  $q.notify({
    type: 'info',
    message: 'Logs cleared',
    timeout: 2000,
  })
  
  console.log('[CombinedLogOutput] Logs cleared')
}

/**
 * ✅ Експорт логів у файл
 */
function exportLogs() {
  const logContent = logBuffer.toString()
  
  if (logContent.length === 0) {
    $q.notify({
      type: 'warning',
      message: 'No logs to export',
      timeout: 2000,
    })
    return
  }

  // Створюємо timestamp для імені файлу
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = `execution-logs-${timestamp}.txt`

  // Створюємо blob з логами
  const blob = new Blob([logContent], { type: 'text/plain; charset=utf-8' })
  const url = URL.createObjectURL(blob)

  // Завантажуємо файл
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  // Очищуємо ресурс
  URL.revokeObjectURL(url)

  $q.notify({
    type: 'positive',
    message: `Logs exported to ${filename}`,
    timeout: 2000,
  })
  
  console.log(`[CombinedLogOutput] Exported logs to ${filename}`)
}

/**
 * ✅ Обробник пошуку
 */
function onSearchChange() {
  // Пошук обраховується в computed property displayedLog
  scrollToBottom()
}

/**
 * ✅ Очищення пошуку
 */
function clearSearch() {
  searchQuery.value = ''
}

/**
 * ✅ Форматування розміру в байтах
 */
function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * ✅ Lifecycle: Монтування компонента
 */
onMounted(async () => {
  console.log('[CombinedLogOutput] Component mounted')
  
  // Завантажуємо попередні логи
  await loadState()

  // Реєструємо обробники для нових логів
  window.executionEngineAPI.listenForExecutionLog(onExecutionLog)
  window.executionEngineAPI.listenForStdOut(onStdOut)
  window.executionEngineAPI.listenForStdErr(onStdErr)

  console.log('[CombinedLogOutput] Event listeners registered')
})

/**
 * ✅ Lifecycle: Демонтування компонента
 */
onUnmounted(() => {
  console.log('[CombinedLogOutput] Component unmounting')
  
  // Видаляємо обробники
  window.executionEngineAPI.stopListeningForExecutionLog(onExecutionLog)
  window.executionEngineAPI.stopListeningForStdOut(onStdOut)
  window.executionEngineAPI.stopListeningForStdErr(onStdErr)

  // Очищуємо буфер щоб звільнити пам'ять
  logBuffer.clear()

  console.log('[CombinedLogOutput] Component unmounted')
})
</script>

<style scoped lang="scss">
.log-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.1));
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.1);

  .log-title {
    font-weight: 500;
    font-size: 13px;
  }

  .log-search {
    flex: 1;
    max-width: 300px;
    margin: 0 16px;
  }
}

.log-area {
  flex: 1;
  border: 1px solid var(--q-color-primary);
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.05);
  min-height: 200px;
  max-height: 100%;

  .log-content {
    padding: 12px;
    margin: 0;
    font-family: 'Monaco', 'Courier New', monospace;
    font-size: 12px;
    line-height: 1.5;
    word-wrap: break-word;
    white-space: pre-wrap;
    color: #333;
  }
}

.log-stats {
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 4px;
  font-size: 11px;
  color: #999;
  display: flex;
  gap: 8px;

  .separator {
    color: #ddd;
  }
}

// Темна тема (якщо використовується)
:deep(.body--dark) {
  .log-header {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.1));
    border-color: rgba(255, 255, 255, 0.1);
  }

  .log-area {
    background: rgba(255, 255, 255, 0.02);
    border-color: var(--q-color-primary);

    .log-content {
      color: #ddd;
    }
  }

  .log-stats {
    background: rgba(255, 255, 255, 0.05);
    color: #aaa;

    .separator {
      color: #555;
    }
  }
}
</style>