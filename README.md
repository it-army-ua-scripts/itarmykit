# IT Army Kit

Desktop application built with Quasar, Vue 3, and Electron for configuring and running supported IT Army modules.

Official user instructions:

- Ukrainian: https://itarmy.com.ua/instruction/?lang=ua
- English: https://itarmy.com.ua/instruction/?lang=en#itarmykit

## Requirements

- Node.js `>= 22.12.0`
- npm `>= 6.13.4`
- yarn `>= 1.21.1`

## Scripts

- `npm run dev` - start Quasar in Electron dev mode
- `npm run build` - build the application
- `npm run lint` - run ESLint across `.js`, `.ts`, and `.vue`
- `npm run smoke:stability` - compile and run the stability smoke check

## Project Structure

- `src/` - renderer application built with Vue and Quasar
- `src-electron/` - Electron main process, preload bridge, and IPC handlers
- `lib/` - shared module/runtime logic used by the Electron process
- `scripts/` - local smoke and support scripts
- `public/` - static assets bundled into the app
- `build/` - installer resources

## Runtime Architecture

The app has three main layers:

1. Renderer (`src/`) renders pages, dashboards, and settings UI.
2. Preload (`src-electron/electron-preload.ts`) exposes a curated IPC bridge on `window.*API`.
3. Main process (`src-electron/`) owns settings, module lifecycle, schedule reconciliation, tray integration, updates, and stability logging.

Modules are implemented under `lib/module/` and are controlled through the execution engine in `src-electron/handlers/engine.ts`.

## Local Data and Logs

The application stores runtime data in the `ITArmyKitProfile` directory under Electron's `appData` path.

Typical files:

- `settings.json` - persisted app settings
- `engine.state.json` - persisted execution engine state
- `stability.log` - newline-delimited JSON log for renderer/main/module issues

The modules payload directory defaults to:

- `%APPDATA%\ITArmyKitProfile\modules` on Windows

The stability log path resolves to:

- `%APPDATA%\ITArmyKitProfile\stability.log` on Windows

You can open the profile folder and the stability log from the app through the helpers exposed by the preload bridge.

## Packaging Notes

- Electron packaging is configured in `quasar.config.js`.
- Windows builds use `electron-builder` with an NSIS target.
- The installer bundles VC++ redistributable payloads as extra resources.

## Troubleshooting

### Renderer crashes or blank window

Check `stability.log` for entries such as:

- `render-process-gone`
- `renderer-unresponsive`
- `did-fail-load`
- `loadURL failed`

If the app fails to load `file://.../app.asar/index.html`, verify that the installation is intact and that antivirus software has not quarantined packaged files.

### Module starts but statistics are missing

The MHDDOS Proxy integration derives statistics from the module's stdout. If upstream output format or encoding changes, bitrate charts may stop updating even when the process is running.

### Settings or engine state corruption

Settings and engine state are written atomically with backup files:

- `settings.json.bak`
- `engine.state.json.bak`

The app attempts to recover from backups automatically on startup.

## Development Notes

- Keep Electron-facing dependencies in `dependencies` when they are imported by preload or runtime code.
- The preload bridge is part of the app's security boundary. Keep its surface area explicit and typed.
- Stability logging is implemented in `lib/utils/stabilityLog.ts`.
