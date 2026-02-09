import { Settings } from "./settings";
import { ItArmyClient } from '../../lib/itarmy/client'
import { ipcMain, shell } from "electron";

export function handleHelpers() {
    ipcMain.handle('helpers:openURLInBrowser', async (_e, url: string) => {
        try {
            const parsed = new URL(url)
            if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
                console.warn('Blocked external URL with unsupported protocol', parsed.protocol)
                return
            }
        } catch {
            console.warn('Blocked external URL due to invalid format')
            return
        }
        await shell.openExternal(url)
    })
}
