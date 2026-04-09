# ITArmyKit

Десктопний застосунок на Quasar, Vue 3, Electron і TypeScript для налаштування та запуску підтримуваних модулів IT Army.

## Вимоги

- Node.js `>= 22.12.0`
- Yarn `>= 1.21.1`

## Команди

- `yarn dev` - запуск застосунку в режимі розробки Electron
- `yarn build` - збірка застосунку
- `yarn lint` - запуск ESLint
- `yarn smoke:stability` - запуск smoke-перевірки стабільності

## Структура проєкту

- `src/` - клієнтська частина застосунку
- `src-electron/` - main process Electron, preload-міст і IPC-обробники
- `lib/` - спільна runtime-логіка та логіка модулів
- `public/` - статичні ресурси
- `scripts/` - локальні smoke-скрипти
- `build/` - ресурси для пакування

## Примітки

- Пакування налаштоване в `quasar.config.js`.
- Windows-збірки використовують `electron-builder` з NSIS.
- Робочі дані застосунку зберігаються в `ITArmyKitProfile` всередині Electron `appData`.
