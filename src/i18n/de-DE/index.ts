// This is just an example,
// so you can safely delete all default props below

export default {
  layout: {
    dashboard: 'Hauptseite',
    modules: 'DDOS-Module',
    activeness: 'Activeness',
    settings: 'Einstellungen',
    schedule: 'Planung',
    top: 'Ranglisten',
    developers: 'Entwickler'
  },
  schedule: {
    title: 'Planung',
    description: 'Ausgew\u00e4hlte Module nach Zeitfenster automatisch starten und stoppen.',
    enabled: 'Scheduler aktivieren',
    enabledDescription: 'Wenn aktiv, steuert die App Start/Stopp nach den gew\u00e4hlten Zeiten.',
    startTime: 'Startzeit',
    endTime: 'Endzeit',
    intervalModule: 'Modul',
    modulesTitle: 'Module im Zeitfenster',
    intervalsTitle: 'Zeitintervalle',
    noIntervals: 'Keine Intervalle konfiguriert.',
    daysTitle: 'Wochentage',
    addInterval: 'Intervall hinzuf\u00fcgen',
    removeInterval: 'Intervall entfernen',
    days: {
      sun: 'So',
      mon: 'Mo',
      tue: 'Di',
      wed: 'Mi',
      thu: 'Do',
      fri: 'Fr',
      sat: 'Sa'
    },
    close: 'Schlie\u00dfen',
    autoSaveHint: '\u00c4nderungen werden automatisch gespeichert.',
    overlapError: 'Intervalle d\u00fcrfen sich nicht \u00fcberschneiden.',
    saveFailed: 'Zeitplan konnte nicht gespeichert werden. Fehler: {error}'
  },
  modules: {
    menu: {
      main: 'Hauptseite',
      active: 'Aktives Modul',
      available: 'Verf\u00fcgbare Module'
    },
    active: {
      selected: 'Ausgew\u00e4hltes Modul zum Start',
      enabled: {
        title: 'Modul aktivieren',
        caption: 'Modulausf\u00fchrung aktivieren oder deaktivieren'
      },
      executionLog: 'Ausf\u00fchrungsprotokoll',
      stdout: 'Standardausgabe (stdout)',
      stderr: 'Standardfehlerausgabe (stderr)'
    },
    available: {
      configuration: 'Konfiguration',
      selVersion: 'Version ausw\u00e4hlen',
      selVersionDescription: 'Die Modulversion zum Start',
      autoupdates: 'Automatische Updates',
      autoupdatesDescription: 'Das Modul automatisch auf die neueste Version aktualisieren',
      arguments: 'Startparameter (f\u00fcr fortgeschrittene Nutzer)',
      argumentsDescription: 'Zus\u00e4tzliche Startparameter f\u00fcr die Ausf\u00fchrung der Bin\u00e4rdatei',
      versions: {
        versions: 'Liste der Versionen',
        downloadInstall: 'Herunterladen und Installieren',
        selectUse: 'F\u00fcr Verwendung ausw\u00e4hlen'
      }
    },
    mhddosProxy: {
      copies: 'Kopien',
      copiesDescription: 'Die Anzahl der gestarteten Prozesse (Modulkopien). 0 f\u00fcr Auto',
      threads: 'Threads',
      threadsDescription: 'Die Anzahl der gestarteten Threads pro Prozess. 0 f\u00fcr Auto',
      useMyIp: 'Meine IP benutzen',
      useMyIpDescription: 'Der Prozentanteil der Verwendung Ihrer eigenen IP-Adresse oder VPN, wenn konfiguriert'
    },
    distress: {
      concurrency: 'Nebenl\u00e4ufigkeit',
      concurrencyDescription: 'Die Anzahl der Aufgabenersteller. 0 setzt Standardwert auf 4096 ',
      torConnections: 'Tor-Verbindungen',
      torConnectionsDescription: 'Tor-Verbindungen f\u00fcr den Angriff verwenden',
      useMyIp: 'Meine IP benutzen',
      useMyIpDescription: 'Der Prozentanteil der Verwendung Ihrer eigenen IP-Adresse oder VPN, wenn konfiguriert',
      UDPFlood: 'UDP-Flood deaktivieren',
      UDPFloodDescription: 'UDP-Flood-Angriff verbieten. Funktioniert nur mit Ihrer eigenen IP-Adresse',
      ICMPFlood: 'ICMP-Flood aktivieren',
      ICMPFloodDescription: 'ICMP-Flood-Angriff erlauben. Funktioniert nur mit Ihrer eigenen IP-Adresse',
      PACKETFlood: 'PACKET-Flood aktivieren',
      PACKETFloodDescription: 'Funktioniert nicht unter OS Windows! PACKET-Flood-Angriff erlauben. Funktioniert nur mit Ihrer eigenen IP-Adresse'
    }
  },
  top: {
    volunteers: 'TOP FREIWILLIGE',
    week: 'Pro Woche',
    month: 'Pro Monat',
    activeness: 'Activeness',

    achievements: {
      peopleAreLikeShips: {
        title: 'Menschen sind wie Schiffe',
        subtitle: 'Wenn sie russisch sind, fahren sie zur H\u00f6lle',

        body: 'Es scheint, als h\u00e4tten Sie gerade versucht, die russische Sprache auszuw\u00e4hlen. Sie brauchen uns, um Sie zu retten. Keine Sorge, wir werden Sie bald denazifizieren und befreien.',
        explanationHint: 'Ich verstehe nicht. Erl\u00e4utern Sie mir dieses Meme.',
        explanation: '"russisches Kriegsschiff, geh fick dich selbst", war die letzte Kommunikation, die am 24. Februar, dem ersten Tag der Snake-Island-Kampagne 2022, vom ukrainischen Grenzsch\u00fctzer Roman Hrybov an den russischen Lenkwaffenkreuzer moskva gerichtet wurde. Am 13. April 2022 wurde moskva durch eine Explosion, verursacht von ukrainischen Anti-Schiffs-Raketen, kritisch besch\u00e4digt und sank am folgenden Tag. "Menschen sind wie Schiffe" ist ein bekanntes Lied der Band Skryabin in der Ukraine. Die Denazifizierung und die Befreiung der Ukrainer sind Slogans der russischen Propaganda der "russischen Welt"-Doktrin.',
        goodButton: 'Ich bin albern. Bitte befreien Sie mich',
        badButton: 'Ich mag die Ukraine nicht'
      }
    },

    activenessData: {
      notifyLoadFailed: 'Fehler beim Laden der Activeness-Statistiken. Fehler: {error}'
    }
  },
  bootstrap: {
    title: 'Es scheint, dies ist Ihr erster Start. Lassen Sie uns Ihnen helfen.',

    header: {
      language: 'Sprache ausw\u00e4hlen',
      data: 'Daten',
      itarmy: 'ITArmy ID',
      module: 'Module'
    },

    language: {
      continueButton: 'Weiter'
    },

    data: {
      body: 'Die Anwendung wird automatisch die erforderlichen Module herunterladen und auf Ihrem PC speichern. Module und alle Daten werden im Ordner gespeichert',
      windows: 'Bevor Sie fortfahren, stellen Sie sicher, dass Sie den Datenordner zu den Ausnahmen von Windows Defender und dem Antivirenprogramm hinzugef\u00fcgt haben. Andernfalls werden alle heruntergeladenen Daten gel\u00f6scht.',
      openDataFolderButton: 'Datenordner \u00f6ffnen',
      changeDataFolderButton: 'Datenordner \u00e4ndern',
      continueButton: 'Weiter',
      backButton: 'Zur\u00fcck'
    },

    itarmy: {
      body: "Wenn Sie eine ITArmy ID haben, geben Sie sie unten ein. Andernfalls klicken Sie auf die 'Weiter' Taste",
      uuidInputTitle: 'ITArmy ID',
      continueButton: 'Weiter',
      backButton: 'Zur\u00fcck'
    },

    module: {
      body: 'W\u00e4hlen Sie eine Voreinstellung aus. Alle Daten k\u00f6nnen dann ge\u00e4ndert werden',
      installation: {
        title: 'Modulinstallation'
      },
      preset: {
        government: {
          title: 'Staatseinrichtung / Alter PC',
          description: 'Diese Voreinstellung verwendet so wenig Ressourcen wie m\u00f6glich. Dies kann einige Modulfunktionen deaktivieren.'
        },
        laptop: {
          title: 'Laptop',
          description: 'Diese Voreinstellung versucht, so wenig Ressourcen wie m\u00f6glich zu verwenden, ohne dabei Funktionen zu deaktivieren.'
        },
        comfort: {
          title: 'Komfort',
          description: 'Diese Voreinstellung verwendet Ressourcen im Komfortmodus. Es beeintr\u00e4chtigt die Leistung Ihres Computers nicht.'
        },
        normal: {
          title: 'Normal',
          description: 'Normaler Heimcomputer. Diese Voreinstellung verwendet standardm\u00e4\u00dfig die Konfiguration, die von den Modulentwicklern bereitgestellt wird.'
        },
        max: {
          title: 'Maximal',
          description: 'H\u00f6chste Leistung. Diese Voreinstellung verwendet die maximale Ressourcenkapazit\u00e4t Ihres Computers. Dies kann Verz\u00f6gerungen in anderen Programmen verursachen.'
        },
        expert: {
          title: 'Experte',
          description: 'Diese Voreinstellung f\u00fchrt keine Aktionen aus. Alle Einstellungen m\u00fcssen manuell gesetzt werden.'
        }
      }
    },

    doneDialog: {
      title: 'Einrichtung abgeschlossen',
      body: 'Jetzt k\u00f6nnen Sie die Anwendung verwenden. Wir ben\u00f6tigen jedoch noch etwas Zeit, um alles vorzubereiten (1-3 Minuten). W\u00e4hrend dieser Zeit kann es keine Updates auf dem Hauptdashboard geben. Dies ist normal f\u00fcr den ersten Start :) In wenigen Minuten werden Diagramme und aktuelle Informationen auf dem Hauptdashboard angezeigt.',
      finishButton: 'Gro\u00dfartig! Los geht\'s!'
    }
  },
  settings: {
    system: 'System',
    look: 'GUI',
    theme: 'Thema',
    mode: 'Modus',
    themeLight: 'Hell',
    themeDark: 'Dunkel',
    locked: 'gesperrt',
    modeDefault: 'Standard',
    modeEaster: 'Ostern',
    modeMatrix: 'Matrix',
    modeLockedHint: 'Zus\u00e4tzliche Modi erscheinen hier, sobald sie freigeschaltet wurden.',
    darkMode: 'Dunkelmodus',
    matrixMode: 'Matrix-Modus',
    autoUpdates: 'Automatische Updates',
    autoUpdatesDescription: 'Die Anwendung automatisch auf die letzte Version aktualisieren.',
    autoStartup: 'Autostart',
    autoStartupDescription: 'Die Anwendung automatisch starten, wenn das System hochf\u00e4hrt.',
    hideTray: 'Anwendung im Infobereich verstecken',
    hideTrayDescription: 'Die App im Infobereich verstecken, aber nicht schlie\u00dfen. Das Hauptfenster beim Start nicht anzeigen.',
    language: 'Sprache',
    idDescription: 'Wie kann man ID bekommen? Schauen Sie nach',
    data: 'Speicher',
    dataDescription: 'Derzeit sind Ihre Module im Ordner:',
    warnDelStatistics: 'Sind Sie sicher, dass Sie alle Statistiken l\u00f6schen m\u00f6chten?',
    warnDelCache: 'Sind Sie sicher, dass Sie den Modulcache l\u00f6schen m\u00f6chten? Die App wird nach dieser Aktion geschlossen und m\u00f6glicherweise nicht automatisch neu gestartet.',
    warnDelData: 'Sind Sie sicher, dass Sie alle Daten l\u00f6schen m\u00f6chten, einschlie\u00dflich Cache, Einstellungen und Module? Die App wird nach dieser Aktion geschlossen und m\u00f6glicherweise nicht automatisch neu gestartet',
    openDataFolder: 'Dateinordner \u00f6ffnen',
    changeModulesDataLocation: 'Den Speicherort der Moduldaten \u00e4ndern',
    deleteStatistics: 'Statistiken l\u00f6schen',
    deleteModulesCache: 'Modulcache l\u00f6schen',
    deleteAllTheData: 'Werkseinstellungen',
    diagnostics: {
      title: 'Diagnose',
      description: 'Dienstwerkzeuge zur Fehlersuche.',
      openProfileFolder: 'Profilordner',
      openStabilityLog: 'Stability-Log'
    },
    matrixQuiz: {
      header: 'Wach auf, {name} ...',
      body: 'Sie sind genetisch modifizierter Ukrnazi aus den Labors von Westukraine. Wir alle sind gehirngewaschen und denken gleich. Beantworte Assoziationen (das Erste, was dir in den Sinn kommt), um das zu beweisen.',

      q1: 'Was raschelt?',
      q2: 'Wer ist putin?',
      q3: 'Was ist ausgetrocknet?',

      cancell: 'Aufwachen, als w\u00e4re nichts passiert',
      submit: 'Ab ins Kaninchenloch'
    }
  },

  dashboard: {
    statistics: 'Angriffskraft-Statistiken',
    bytes: 'Gesendet / Datenverkehr / Insgesamt',
    bytesHint: 'Die Statistiken zum gesendeten Datenverkehr k\u00f6nnen ungenau sein. Dies h\u00e4ngt vom Modul und seiner Funktionsweise ab. Die Gesamtstatistik ist immer pr\u00e4zise und zeigt aggregierte Informationen aus allen laufenden Tools an.',
    moduleStatus: 'Modul-Status',
    control: 'Systemsteuerung',
    autostart: 'Autostart',
    scheduler: 'Scheduler',
    cpuLoad: 'CPU',
    ramLoad: 'RAM',
    on: 'AN',
    off: 'AUS',
    intervals: 'Intervalle',
    updates: 'KIT Version',
    latest: 'Aktuell',
    chart: {
      now: 'Jetzt',
      average: 'Durchschnitt',
      peak: 'Spitzenwert',
      bitrate: 'Datenrate',
      trend: 'Trend',
      view: {
        raw: 'Roh',
        smooth: 'Gegl\u00e4ttet'
      },
      noData: 'Noch keine Statistik',
      events: {
        started: 'Gestartet',
        stopped: 'Gestoppt',
        error: 'Fehler'
      },
      ranges: {
        m5: '5 Min',
        m15: '15 Min',
        h1: '1 Std',
        h6: '6 Std'
      }
    },
    activeness: {
      score: 'Activeness Score'
    },
    itarmyAPIKeyEmpty: 'IT Army ID ist nicht angegeben. Es ist nicht kritisch, aber es ist erforderlich, um allgemeine Statistiken anzuzeigen. Sie k\u00f6nnen sie in den Einstellungen angeben.'
  },

  developers: {
    itaySubtitle: 'Eine Community ukrainischer IT-Spezialisten, die Ende Februar 2022 gegr\u00fcndet wurde, um den Feind im Informations- und Cyberspace nach dem Beginn der russischen Invasion in der Ukraine am 24. Februar 2022 zu neutralisieren.',
    shieldMore: 'Erfahren Sie mehr \u00fcber uns und unsere Operationen:',
    partners: 'Kollegen und Partner',
    contacts: 'Kontakte',
    contactP1: 'F\u00fcr Fragen zur Anwendung, fragen Sie zun\u00e4chst im IT Army-Chat:',
    contactP1_1: 'Oder als letztes Mittel, auf unserem Kanal',
    contactP1_2: 'Wenn Sie uns auf dem Kanal schreiben, denken Sie daran, dass wir nur \u00fcber sehr begrenzte Ressourcen verf\u00fcgen und m\u00f6glicherweise nicht antworten k\u00f6nnen. In der Regel gibt es jedoch Community-Mitglieder, die Ihnen helfen k\u00f6nnen.',
    contactP2: 'Technische Probleme mit der Anwendung - wenn Sie wissen, wie man GitHub verwendet, erstellen Sie bitte ein Issue im Repository.',
    contactP2_1: 'Wenn nicht - fragen Sie im IT Army-Chat.',
    contactP3: 'Fragen \u00fcber Module - richten Sie sie an die Modul-Entwickler.',
    contributors: 'Mitwirkende',
    contributorsSubtitle: 'Helfen Sie dabei, das Programm zu verbessern, und Ihr Name wird automatisch in dieser Liste erscheinen. Die Liste zeigt auch Mitwirkende zur vorherigen Version der Anwendung und einigen Modulen.'
  },

  activeness: {
    login: {
      title: 'Activeness Login',
      email: 'E-Mail',
      password: 'Passwort',
      info: 'Ungl\u00fccklicherweise erfordert Activeness zus\u00e4tzliche Anmeldung zur Verwendung. In Zukunft werden wir versuchen, eine Anmeldung f\u00fcr alle IT Army-Dienste bereitzustellen. Wenn Sie nicht wissen, was Activeness ist, besuchen Sie https://activeness.social/.',
      loginButton: 'Einloggen / Registrieren',
      failed: 'Anmeldung fehlgeschlagen. Pr\u00fcfen Sie E-Mail und Passwort und versuchen Sie es erneut.',
      networkFailed: 'Die Anmeldung ist fehlgeschlagen, weil der Activeness-Dienst oder Ihre Netzwerkverbindung nicht verf\u00fcgbar ist.'
    },
    tasksTable: {
      title: 'Aufgaben',
      id: 'ID',
      what: 'Was ist zu tun',
      link: 'Link',
      description: 'Beschreibung',
      actions: 'Aktionen',
      priority: 'Diese Aufgabe hat Priorit\u00e4t. Es ist sehr wichtig, sie zuerst zu erledigen'
    },

    logoutButton: 'Ausloggen',
    suggesttarget: 'Mein Ziel vorschlagen',
    actions: {
      done: 'Erledigt',
      ignore: 'Ignorieren',
      openFirst: 'Öffnen Sie zuerst den Link'
    },
    summary: {
      subtitle: 'Öffnen Sie das Ziel, führen Sie die Meldung durch und markieren oder überspringen Sie die Aufgabe danach.',
      available: 'Verfügbare Aufgaben',
      priority: 'Priorisierte Aufgaben',
      nextStep: 'Nächster Schritt',
      nextStepHint: 'Beginnen Sie mit der ersten priorisierten Aufgabe und schließen Sie sie ab, bevor Sie weitermachen.',
      tip: 'Tipp: Nutzen Sie die grüne Schaltfläche nach der Meldung. Ignorieren Sie Aufgaben nur, wenn Sie sie wirklich nicht bearbeiten können.',
      emptyTitle: 'Zurzeit keine Aufgaben',
      emptyBody: 'Schauen Sie später noch einmal vorbei oder schlagen Sie ein neues Ziel für das Team vor.',
      noDescription: 'Keine zusätzlichen Details',
      priorityTag: 'Priorität'
    },

    notifyTaskLoadFailed: 'Fehler beim Laden der Aufgaben. Fehler: {error}',
    notifyFailedToMakeTaskDone: 'Fehler beim Markieren der Aufgabe als erledigt. Fehler: {error}',
    notifyFailedTOIgnoreTask: 'Fehler beim Ignorieren der Aufgabe. Fehler: {error}',
    errors: {
      clickTooFast: 'Die Aktion wurde zu schnell wiederholt. Bitte warten Sie ein paar Sekunden und versuchen Sie es erneut.',
      invalidTaskId: 'Diese Aufgabe ist nicht mehr verf\u00fcgbar. Bitte aktualisieren Sie die Liste.',
      openTaskFirst: 'Öffnen Sie zuerst den Link zur Aufgabe und markieren Sie sie erst danach als erledigt.',
      sidExpired: 'Ihre Activeness-Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.',
      sidCheckFail: 'Ihre Activeness-Sitzung passt nicht mehr zu diesem Konto. Bitte melden Sie sich erneut an.',
      sessionExpired: 'Ihre Activeness-Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.',
      doneRejected: 'Der Activeness-Dienst hat das Abschlie\u00dfen der Aufgabe abgelehnt ({error}).',
      ignoreRejected: 'Der Activeness-Dienst hat das Ignorieren der Aufgabe abgelehnt ({error}).',
      unknown: 'Unbekannter Activeness-Fehler.'
    }
  }
}
