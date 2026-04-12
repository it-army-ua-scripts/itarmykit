export const DEFAULT_THEME_ID = 'light'
export const DEFAULT_MODE_ID = 'default'

export interface AppearanceThemeDefinition {
  id: string
  labelKey: string
  quasarDark: boolean
  bodyClass: string
}

export interface AppearanceModeDefinition {
  id: string
  labelKey: string
  bodyClass: string
  requiresUnlock?: boolean
}

export const appearanceThemes: AppearanceThemeDefinition[] = [
  {
    id: 'light',
    labelKey: 'settings.themeLight',
    quasarDark: false,
    bodyClass: 'app-theme--light'
  },
  {
    id: 'dark',
    labelKey: 'settings.themeDark',
    quasarDark: true,
    bodyClass: 'app-theme--dark'
  }
]

export const appearanceModes: AppearanceModeDefinition[] = [
  {
    id: 'default',
    labelKey: 'settings.modeDefault',
    bodyClass: 'app-mode--default'
  },
  {
    id: 'easter',
    labelKey: 'settings.modeEaster',
    bodyClass: 'app-mode--easter'
  },
  {
    id: 'matrix',
    labelKey: 'settings.modeMatrix',
    bodyClass: 'app-mode--matrix',
    requiresUnlock: true
  }
]

export function getAppearanceTheme (themeId: string): AppearanceThemeDefinition {
  return appearanceThemes.find((theme) => theme.id === themeId) ?? appearanceThemes[0]
}

export function getAppearanceMode (modeId: string): AppearanceModeDefinition {
  return appearanceModes.find((mode) => mode.id === modeId) ?? appearanceModes[0]
}

export function normalizeUnlockedModes (unlockedModes: unknown): string[] {
  if (!Array.isArray(unlockedModes)) {
    return []
  }

  return Array.from(new Set(unlockedModes.filter((modeId): modeId is string => typeof modeId === 'string')))
}

export function canUseAppearanceMode (modeId: string, unlockedModes: string[]): boolean {
  const mode = getAppearanceMode(modeId)
  if (!mode.requiresUnlock) {
    return true
  }

  return unlockedModes.includes(mode.id)
}

export function normalizeAppearanceThemeId (themeId: unknown): string {
  if (typeof themeId !== 'string') {
    return DEFAULT_THEME_ID
  }

  return getAppearanceTheme(themeId).id
}

export function normalizeAppearanceModeId (modeId: unknown, unlockedModes: string[]): string {
  if (typeof modeId !== 'string') {
    return DEFAULT_MODE_ID
  }

  const normalizedModeId = getAppearanceMode(modeId).id
  if (!canUseAppearanceMode(normalizedModeId, unlockedModes)) {
    return DEFAULT_MODE_ID
  }

  return normalizedModeId
}
