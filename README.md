## UPD 07.04.26

Шановна спільното!

На жаль, у відведений адміністрацією каналу час нам не вдалося знайти спільну мову. Наша позиція залишається незмінною: ми діємо відкрито, однак зобов'язані розуміти, кому саме передаємо конфіденційні дані. За наявності офіційного запиту ми готові надати всю необхідну інформацію та доступи відповідним уповноваженим особам.

Разом із тим ми не можемо продовжувати роботу в умовах, що виходять за межі правового поля держави та створюють загрозу для всіх нас.

У зв'язку з цим ми тимчасово призупиняємо роботу всіх інструментів, якими керуємо, до повного врегулювання ситуації.

Дякуємо за розуміння.

Слава Україні!

### English

Dear Community!

Unfortunately, within the time allotted by the channel administration, we were unable to find common ground. Our position remains unchanged: we act openly, but we are obliged to understand exactly to whom we are handing over confidential data. Upon receipt of an official request, we are ready to provide all necessary information and access to the duly authorized persons.

At the same time, we cannot continue working under conditions that fall outside the legal framework of the state and create a threat to all of us.

In this regard, we are temporarily suspending the operation of all tools under our control until the situation is fully resolved.

Thank you for your understanding.

Glory to Ukraine!

# Announcement

## Українською

УВАГА! ⚠️

Утіліти IT ARMY, а також команда розвідки в повному складі залишаються вірними патріотами України, які працюють проти ворога кожен день. Всі розвідники і розробники утіліт, які працювали з вами всі 4+ років, залишаються єдиними у своїй позиції, без винятку.

Інформація про компрометацію нашої команди є ініціативою адміністратора TG-каналу, який, спираючись на непідтверджені зв'язки з Мінцифри, намагався отримати доступ до чутливого коду та конфігурації під виглядом необхідного аудиту, хоча багато років він цього аудиту не потребував.

Оскільки ця особа не підтвердила ані організацію, яку вона представляє, ані мету своїх потреб, ми були вимушені відмовити задля безпеки. Ми інформуємо вас через утіліти, бо не маємо доступу до офіційного каналу.

Якщо ви сумніваєтеся в поточних цілях, ви завжди можете подивитися, куди спрямовано трафік. Ми просимо вас не зупиняти сервери, оскільки робота продовжується, і від адміністратора TG-каналу ви не отримаєте правдивої інформації.

Скоріше за все, ми будемо створювати новий канал. Очікуйте нову інформацію через утіліти.

Дякуємо за довіру. Слава Україні!

## English

ATTENTION! ⚠️

The IT ARMY utilities, as well as the entire intelligence team, remain loyal patriots of Ukraine who work against the enemy every day. All intelligence members and utility developers who have worked with you for 4+ years remain united in their position, without exception.

The information about our team being compromised is an initiative of the TG channel administrator who, citing unconfirmed connections to the Ministry of Digital Transformation, attempted to gain access to sensitive code and configuration under the guise of a necessary audit, even though for many years no such audit had been required.

Since this person did not confirm either the organization they represent or the purpose of their requests, we were forced to refuse for security reasons. We are informing you through the utilities because we do not have access to the official channel.

If you have doubts about the current goals, you can always inspect where the traffic is being directed. We ask you not to stop the servers, because the work is ongoing, and you will not receive truthful information from the TG channel administrator.

Most likely, we will create a new channel. Please wait for new information through the utilities.

Thank you for your trust. Glory to Ukraine!

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
