import { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'

export async function bootstrapGuard (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) {
  try {
    const settings = await window.settingsAPI.get()
    console.log(settings)
    if (settings.bootstrap.step !== 'DONE') {
      return next({ name: 'bootstrap' })
    }
  } catch (error) {
    console.error('[router] bootstrapGuard failed', error)
    await window.helpersAPI.logRendererEvent('bootstrap-guard-failed', {
      to: to.fullPath,
      from: from.fullPath,
      error
    })
  }

  return next()
}
