<template>
  <router-view />
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar'
import { onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppearanceStore } from 'src/appearance/store'

const i18n = useI18n()
const $q = useQuasar()
const appearanceStore = useAppearanceStore()

async function applySettings () {
  try {
    const settings = await window.settingsAPI.get()
    i18n.locale.value = settings.system.language
    appearanceStore.hydrate(settings.gui)
    appearanceStore.applyRuntimeAppearance($q.dark)
  } catch (error) {
    console.error('[app] applySettings failed', error)
    await window.helpersAPI.logRendererEvent('app-apply-settings-failed', error)
  }
}

onMounted(async () => {
  await applySettings()
})

watch(
  () => [appearanceStore.themeId, appearanceStore.modeId],
  () => {
    appearanceStore.applyRuntimeAppearance($q.dark)
  }
)

</script>
