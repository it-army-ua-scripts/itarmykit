import { autoUpdater } from 'electron-updater';
import { Settings } from './settings'
import { ExecutionEngine } from './engine';

export function handleUpdater(settings: Settings, executionEngine: ExecutionEngine) {
    const updateFunction = async () => {
        try {
            const settingsData = await settings.getData()
            if (settingsData.system.autoUpdate) {
                console.log("Checking for updates...")
                await autoUpdater.checkForUpdates()
            }
        } catch (err) {
            console.warn('Auto-update check failed', err)
        }
    }

    void updateFunction()
    setInterval(updateFunction, 1000 * 60 * 30) // 30 minutes

    autoUpdater.on('update-downloaded', async (event) => {
        console.log("Downloaded update file: " + event.downloadedFile)

        // On windowns we need to manually stop execution engine because on-quite functionality doesnt work in combination with autoUpdater
        if (process.platform === 'win32') {
            await executionEngine.dispose()
        }

        autoUpdater.quitAndInstall()
    })
    autoUpdater.on('update-available', (info) => {
        console.log('Update available.')
    })
    autoUpdater.on('update-not-available', (info) => {
        console.log('Update not available.')
    })
    autoUpdater.on('error', (err) => {
        console.warn('Auto-update error', err)
    })
}
