import { join as joinPath }from 'path'
import { app, ipcMain } from 'electron'
import { promises as fsPromises, readFileSync, existsSync } from 'fs'
import EventEmitter from 'events';

export interface SettingsData {
    system: {
        autoUpdate: boolean
        hideInTray: boolean
        startOnBoot: boolean,
        language: 'en-US' | 'ua-UA'
    },
    modules: {
        dataPath: string;
    },
    schedule: {
        enabled: boolean;
        startTime: string;
        endTime: string;
        activity: 'DO_NOTHING' | 'MINIMAL'
    },
    itarmy: {
        uuid: string
    },
    bootstrap: {
        step: 'LANGUAGE' | 'DATA_FOLDER' | 'MODULES_CONFIGURATION' | 'ITARMY_UUID' | 'DONE'
        selectedModulesConfig: 'NONE' | 'GOVERNMENT_AGENCY' | 'WORK' | 'HOME'
    }
}

export type SettingsChangedEventHandler = (newData: SettingsData) => void

export class Settings {
    private static settingsFile = joinPath(app.getPath('appData'), 'UACyberShield', 'itarmykit', 'settings.json')
    private data: SettingsData = {
        system: {
            autoUpdate: true,
            hideInTray: false,
            startOnBoot: false,
            language: 'en-US'
        },
        modules: {
            dataPath: joinPath(app.getPath('appData'), 'UACyberShield', 'itarmykit', 'modules')
        },
        schedule: {
            enabled: false,
            startTime: '07:30',
            endTime: '17:30',
            activity: 'DO_NOTHING'
        },
        itarmy: {
            uuid: ''
        },
        bootstrap: {
            step: 'LANGUAGE',
            selectedModulesConfig: 'NONE'
        }
    }
    private loaded = false
    private settingsChangedEmiter = new EventEmitter()

    async getData() {
        if (!this.loaded) {
            await this.load()
        }
        return this.data
    }

    getDataSync() {
        if (!this.loaded) {
            this.loadSync()
        }
        return this.data
    }

    async deleteData() {
        this.deleteModulesData()
        const p = joinPath(app.getPath('appData'), 'UACyberShield', 'itarmykit')
        if (existsSync(p)) {
            await fsPromises.rmdir(p, { recursive: true })
        }
    }

    async save() {
        await fsPromises.writeFile(Settings.settingsFile, JSON.stringify(this.data))
    }

    async load() {
        try {
            this.data = JSON.parse(await fsPromises.readFile(Settings.settingsFile, 'utf-8'))
            
            // Backwards compatibility

            if (this.data.itarmy === undefined) {
                this.data.itarmy = {
                    uuid: ''
                }
            }

            if (this.data.system.language === undefined) {
                this.data.system.language = 'en-US'
            }

            if (this.data.bootstrap === undefined) {
                this.data.bootstrap = {
                    step: 'DONE',
                    selectedModulesConfig: 'NONE'
                }
            }
        } catch (e) {
            await this.save()
        }
        this.loaded = true
    }

    loadSync() {
        try {
            this.data = JSON.parse(readFileSync(Settings.settingsFile, 'utf-8'))
        } catch (e) {
            void this.save()
        }
        this.loaded = true
    }


    onSettingsChanged(handler: SettingsChangedEventHandler) {
        this.settingsChangedEmiter.on('settingsChanged', handler)
    }

    async setSystemAutoUpdate(data: SettingsData['system']['autoUpdate']) {
        if (!this.loaded) {
            await this.load()
        }

        this.data.system.autoUpdate = data
        await this.save()
        this.settingsChangedEmiter.emit('settingsChanged', this.data)
    }

    async setSystemHideInTray(data: SettingsData['system']['hideInTray']) {
        if (!this.loaded) {
            await this.load()
        }

        this.data.system.hideInTray = data
        await this.save()
        this.settingsChangedEmiter.emit('settingsChanged', this.data)
    }

    async setSystemStartOnBoot(data: SettingsData['system']['startOnBoot']) {
        if (!this.loaded) {
            await this.load()
        }

        app.setLoginItemSettings({
            openAtLogin: data,
        })

        this.data.system.startOnBoot = data
        await this.save()
        this.settingsChangedEmiter.emit('settingsChanged', this.data)
    }

    async setSystemLanguage(data: SettingsData['system']['language']) {
        if (!this.loaded) {
            await this.load()
        }

        this.data.system.language = data
        await this.save()
        this.settingsChangedEmiter.emit('settingsChanged', this.data)
    }

    async setModulesDataPath(data: SettingsData['modules']['dataPath']) {
        if (!this.loaded) {
            await this.load()
        }

        this.data.modules.dataPath = data
        await this.save()
        this.settingsChangedEmiter.emit('settingsChanged', this.data)
    }

    async promptForModulesDataPath() {
        const dialog = (await import('electron')).dialog
        const { canceled, filePaths } = await dialog.showOpenDialog({
            properties: ['openDirectory']
        })
        if (canceled) {
            return
        }

        const newFolderPath = filePaths[0]
        await this.setModulesDataPath(newFolderPath)
    }

    async openModulesDataFolder() {
        if (!this.loaded) {
            await this.load()
        }
        
        const { shell } = await import('electron')
        await shell.openPath(this.data.modules.dataPath)
    }

    async deleteModulesData() {
        if (existsSync(this.data.modules.dataPath)) {
            await fsPromises.rmdir(this.data.modules.dataPath, { recursive: true })
        }
    }

    async setItArmyUUID(data: SettingsData['itarmy']['uuid']) {
        if (!this.loaded) {
            await this.load()
        }

        this.data.itarmy.uuid = data
        await this.save()
        this.settingsChangedEmiter.emit('settingsChanged', this.data)
    }

    async setBootstrapStep(data: SettingsData['bootstrap']['step']) {
        if (!this.loaded) {
            await this.load()
        }

        this.data.bootstrap.step = data
        await this.save()
        this.settingsChangedEmiter.emit('settingsChanged', this.data)
    }

    async setBootstrapSelectedModulesConfig(data: SettingsData['bootstrap']['selectedModulesConfig']) {
        if (!this.loaded) {
            await this.load()
        }

        this.data.bootstrap.selectedModulesConfig = data
        await this.save()
        this.settingsChangedEmiter.emit('settingsChanged', this.data)
    }
}

export function handleSettings(settings: Settings) {
    ipcMain.handle('settings:get', async () => {
        return await settings.getData()
    })

    ipcMain.handle('settings:deleteData', async () => {
        await settings.deleteData()
        app.relaunch()
        app.exit()
    })

    ipcMain.handle('settings:system:autoUpdate', async (_e, data: SettingsData['system']['autoUpdate']) => {
        await settings.setSystemAutoUpdate(data)
    })

    
    ipcMain.handle('settings:system:hideInTray', async (_e, data: SettingsData['system']['hideInTray']) => {
        await settings.setSystemHideInTray(data)
    })

    ipcMain.handle('settings:system:startOnBoot', async (_e, data: SettingsData['system']['startOnBoot']) => {
        await settings.setSystemStartOnBoot(data)
    })

    ipcMain.handle('settings:system:language', async (_e, data: SettingsData['system']['language']) => {
        await settings.setSystemLanguage(data)
    })

    ipcMain.handle('settings:modules:dataPath', async (_e, data: SettingsData['modules']['dataPath']) => {
        await settings.setModulesDataPath(data)
    })

    ipcMain.handle('settings:modules:promptForDataPath', async () => {
        await settings.promptForModulesDataPath()
    })

    ipcMain.handle('settings:modules:openDataFolder', async () => {
        await settings.openModulesDataFolder()
    })

    ipcMain.handle('settings:modules:deleteData', async () => {
        await settings.deleteModulesData()
        app.relaunch()
        app.exit()
    })

    ipcMain.handle('settings:itarmy:uuid', async (_e, data: SettingsData['itarmy']['uuid']) => {
        await settings.setItArmyUUID(data)
    })

    ipcMain.handle('settings:bootstrap:step', async (_e, data: SettingsData['bootstrap']['step']) => {
        await settings.setBootstrapStep(data)
    })

    ipcMain.handle('settings:bootstrap:selectedModulesConfig', async (_e, data: SettingsData['bootstrap']['selectedModulesConfig']) => {
        await settings.setBootstrapSelectedModulesConfig(data)
    })
}