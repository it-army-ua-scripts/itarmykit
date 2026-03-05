import { BrowserWindow, Tray, app, Menu, nativeImage, Notification } from "electron";
import path from "path";
import { Settings } from "./settings";

const lang = {
  "en-US": {
    open: "Open",
    exit: "Exit",
  },
  "ua-UA": {
    open: "Відкрити",
    exit: "Вийти",
  },
  "de-DE": {
    open: "Öffnen",
    exit: "Beenden",
  },
} as const;

let tray: Tray | null = null;
let isQuiting = false;
let beforeQuitListenerRegistered = false;
let activeMainWindow: BrowserWindow | null = null;
let boundCloseWindow: BrowserWindow | null = null;
let boundCloseListener: ((event: Electron.Event) => void) | null = null;

const hiddenInTrayMessageByLocale: Record<"en-US" | "ua-UA" | "de-DE", string> = {
  "en-US": "Application is hidden in tray. Double-click the tray icon to open it.",
  "ua-UA": "Застосунок приховано в треї. Подвійний клік по іконці трея відкриє його.",
  "de-DE": "Die Anwendung wurde im Tray ausgeblendet. Doppelklick auf das Tray-Symbol, um sie zu öffnen.",
};

function showHiddenInTrayNotification(locale: "en-US" | "ua-UA" | "de-DE") {
  if (!Notification.isSupported()) {
    return;
  }

  new Notification({
    title: "IT Army Kit",
    body: hiddenInTrayMessageByLocale[locale],
    silent: true,
  }).show();
}

export function handleTray(settings: Settings, mainWindow: BrowserWindow) {
  activeMainWindow = mainWindow;

  if (!beforeQuitListenerRegistered) {
    app.on("before-quit", function () {
      isQuiting = true;
    });
    beforeQuitListenerRegistered = true;
  }

  const locale = settings.getDataSync().system.language;
  let translation = lang["en-US"];
  if (locale in lang) {
    translation = lang[locale as keyof typeof lang];
  }

  if (tray === null) {
    tray = new Tray(nativeImage.createEmpty());
    const appIcon = nativeImage.createFromPath(path.resolve(__dirname, "icons/trey.png"));
    tray.setImage(appIcon);
    tray.setToolTip("IT Army Kit");
    tray.on("double-click", () => {
      if (!activeMainWindow) {
        return;
      }
      if (activeMainWindow.isVisible()) {
        activeMainWindow.hide();
      } else {
        activeMainWindow.show();
      }
    });
  }

  tray.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: translation.open,
        click: function () {
          activeMainWindow?.show();
        },
      },
      {
        label: translation.exit,
        click: function () {
          isQuiting = true;
          app.quit();
        },
      },
    ])
  );

  if (boundCloseWindow && boundCloseListener) {
    boundCloseWindow.removeListener("close", boundCloseListener);
  }

  boundCloseListener = async function (event) {
    const settingsData = await settings.getData();

    if (!isQuiting && settingsData.system.hideInTray) {
      event.preventDefault();
      activeMainWindow?.hide();
      showHiddenInTrayNotification(locale);
    }

    return false;
  };
  mainWindow.on("close", boundCloseListener);
  boundCloseWindow = mainWindow;

  mainWindow.on("closed", () => {
    if (activeMainWindow === mainWindow) {
      activeMainWindow = null;
    }
  });

  const settingsData = settings.getDataSync();
  const isBootstrapIncomplete = settingsData.bootstrap.step !== "DONE";
  if (!isBootstrapIncomplete && settingsData.system.hideInTray) {
    mainWindow.hide();
  } else {
    mainWindow.show();
  }
}
