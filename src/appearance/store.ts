import { defineStore } from 'pinia'
import type { Dark } from 'quasar'
import {
  appearanceModes,
  appearanceThemes,
  canUseAppearanceMode,
  getAppearanceMode,
  getAppearanceTheme,
  normalizeAppearanceModeId,
  normalizeAppearanceThemeId,
  normalizeUnlockedModes
} from './catalog'

interface AppearanceGuiSettings {
  theme?: string
  mode?: string
  unlockedModes?: string[]
}

export const useAppearanceStore = defineStore('appearance', {
  state: () => ({
    themeId: normalizeAppearanceThemeId(undefined),
    modeId: normalizeAppearanceModeId(undefined, []),
    unlockedModes: [] as string[]
  }),
  getters: {
    currentTheme: (state) => getAppearanceTheme(state.themeId),
    currentMode: (state) => getAppearanceMode(state.modeId),
    isDarkTheme: (state) => getAppearanceTheme(state.themeId).quasarDark,
    availableThemes: () => appearanceThemes,
    availableModes: (state) => appearanceModes.filter((mode) => canUseAppearanceMode(mode.id, state.unlockedModes))
  },
  actions: {
    hydrate (gui: AppearanceGuiSettings | undefined) {
      const unlockedModes = normalizeUnlockedModes(gui?.unlockedModes)
      this.unlockedModes = unlockedModes
      this.themeId = normalizeAppearanceThemeId(gui?.theme)
      this.modeId = normalizeAppearanceModeId(gui?.mode, unlockedModes)
    },
    applyRuntimeAppearance (dark: Dark) {
      dark.set(this.currentTheme.quasarDark)

      const body = document.body
      for (const theme of appearanceThemes) {
        body.classList.toggle(theme.bodyClass, theme.id === this.currentTheme.id)
      }
      for (const mode of appearanceModes) {
        body.classList.toggle(mode.bodyClass, mode.id === this.currentMode.id)
      }
    },
    isModeUnlocked (modeId: string) {
      return canUseAppearanceMode(modeId, this.unlockedModes)
    },
    async setTheme (themeId: string) {
      this.themeId = normalizeAppearanceThemeId(themeId)
      await window.settingsAPI.gui.setTheme(this.themeId)
    },
    async setMode (modeId: string) {
      if (!canUseAppearanceMode(modeId, this.unlockedModes)) {
        this.modeId = normalizeAppearanceModeId(this.modeId, this.unlockedModes)
        return false
      }

      this.modeId = normalizeAppearanceModeId(modeId, this.unlockedModes)
      await window.settingsAPI.gui.setMode(this.modeId)
      return true
    },
    async unlockMode (modeId: string) {
      if (this.unlockedModes.includes(modeId)) {
        return
      }

      this.unlockedModes = [...this.unlockedModes, modeId]
      await window.settingsAPI.gui.setUnlockedModes(this.unlockedModes)
    },
    async load () {
      const settings = await window.settingsAPI.get()
      this.hydrate(settings.gui)
    }
  }
})
