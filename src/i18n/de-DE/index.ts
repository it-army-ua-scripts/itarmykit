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
    description: 'Ausgewählte Module nach Zeitfenster automatisch starten und stoppen.',
    enabled: 'Scheduler aktivieren',
    enabledDescription: 'Wenn aktiv, steuert die App Start/Stopp nach den gewählten Zeiten.',
    startTime: 'Startzeit',
    endTime: 'Endzeit',
    intervalModule: 'Modul',
    modulesTitle: 'Module im Zeitfenster',
    intervalsTitle: 'Zeitintervalle',
    noIntervals: 'Keine Intervalle konfiguriert.',
    daysTitle: 'Wochentage',
    addInterval: 'Intervall hinzufügen',
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
    close: 'Schließen',
    autoSaveHint: 'Änderungen werden automatisch gespeichert.',
    overlapError: 'Intervalle dürfen sich nicht überschneiden.',
    saveFailed: 'Zeitplan konnte nicht gespeichert werden. Fehler: {error}'
  },
  modules: {
    menu: {
      main: 'Hauptseite',
      active: 'Aktives Modul',
      available: 'Verfügbare Module'
    },
    active: {
      selected: 'Ausgewähltes Modul zum Start',
      enabled: {
        title: 'Modul aktivieren',
        caption: 'Modulausführung aktivieren oder deaktivieren'
      },
      executionLog: 'Ausführungsprotokoll',
      stdout: 'Standardausgabe (stdout)',
      stderr: 'Standardfehlerausgabe (stderr)'
    },
    available: {
      configuration: 'Konfiguration',
      selVersion: 'Version auswählen',
      selVersionDescription: 'Die Modulversion zum Start',
      autoupdates: 'Automatische Updates',
      autoupdatesDescription: 'Das Modul automatisch auf die neueste Version aktualisieren',
      arguments: 'Startparameter (für fortgeschrittene Nutzer)',
      argumentsDescription: 'Zusätzliche Startparameter für die Ausführung der Binärdatei',
      versions: {
        versions: 'Liste der Versionen',
        downloadInstall: 'Herunterladen und Installieren',
        selectUse: 'Für Verwendung auswählen'
      }
    },
    mhddosProxy: {
      copies: 'Kopien',
      copiesDescription: 'Die Anzahl der gestarteten Prozesse (Modulkopien). 0 für Auto',
      threads: 'Threads',
      threadsDescription: 'Die Anzahl der gestarteten Threads pro Prozess. 0 für Auto',
      useMyIp: 'Meine IP benutzen',
      useMyIpDescription: 'Der Prozentanteil der Verwendung Ihrer eigenen IP-Adresse oder VPN, wenn konfiguriert'
    },
    distress: {
      concurrency: 'Nebenläufigkeit',
      concurrencyDescription: 'Die Anzahl der Aufgabenersteller. 0 setzt Standardwert auf 4096 ',
      torConnections: 'Tor-Verbindungen',
      torConnectionsDescription: 'Tor-Verbindungen für den Angriff verwenden',
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
        subtitle: 'Wenn sie russisch sind, fahren sie zur Hölle',

        body: 'Es scheint, als hätten Sie gerade versucht, die russische Sprache auszuwählen. Sie brauchen uns, um Sie zu retten. Keine Sorge, wir werden Sie bald denazifizieren und befreien.',
        explanationHint: 'Ich verstehe nicht. Erläutern Sie mir dieses Meme.',
        explanation: '"russisches Kriegsschiff, geh fick dich selbst", war die letzte Kommunikation, die am 24. Februar, dem ersten Tag der Snake-Island-Kampagne 2022, vom ukrainischen Grenzschützer Roman Hrybov an den russischen Lenkwaffenkreuzer moskva gerichtet wurde. Am 13. April 2022 wurde moskva durch eine Explosion, verursacht von ukrainischen Anti-Schiffs-Raketen, kritisch beschädigt und sank am folgenden Tag. "Menschen sind wie Schiffe" ist ein bekanntes Lied der Band Skryabin in der Ukraine. Die Denazifizierung und die Befreiung der Ukrainer sind Slogans der russischen Propaganda der "russischen Welt"-Doktrin.',
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
      language: 'Sprache auswählen',
      data: 'Daten',
      itarmy: 'ITArmy ID',
      module: 'Module'
    },

    language: {
      continueButton: 'Weiter'
    },

    data: {
      body: 'Die Anwendung wird automatisch die erforderlichen Module herunterladen und auf Ihrem PC speichern. Module und alle Daten werden im Ordner gespeichert',
      windows: 'Bevor Sie fortfahren, stellen Sie sicher, dass Sie den Datenordner zu den Ausnahmen von Windows Defender und dem Antivirenprogramm hinzugefügt haben. Andernfalls werden alle heruntergeladenen Daten gelöscht.',
      openDataFolderButton: 'Datenordner öffnen',
      changeDataFolderButton: 'Datenordner ändern',
      continueButton: 'Weiter',
      backButton: 'Zurück'
    },

    itarmy: {
      body: "Wenn Sie eine ITArmy ID haben, geben Sie sie unten ein. Andernfalls klicken Sie auf die 'Weiter' Taste",
      uuidInputTitle: 'ITArmy ID',
      continueButton: 'Weiter',
      backButton: 'Zurück'
    },

    module: {
      body: 'Wählen Sie eine Voreinstellung aus. Alle Daten können dann geändert werden',
      installation: {
        title: 'Modulinstallation'
      },
      preset: {
        government: {
          title: 'Staatseinrichtung / Alter PC',
          description: 'Diese Voreinstellung verwendet so wenig Ressourcen wie möglich. Dies kann einige Modulfunktionen deaktivieren.'
        },
        laptop: {
          title: 'Laptop',
          description: 'Diese Voreinstellung versucht, so wenig Ressourcen wie möglich zu verwenden, ohne dabei Funktionen zu deaktivieren.'
        },
        comfort: {
          title: 'Komfort',
          description: 'Diese Voreinstellung verwendet Ressourcen im Komfortmodus. Es beeinträchtigt die Leistung Ihres Computers nicht.'
        },
        normal: {
          title: 'Normal',
          description: 'Normaler Heimcomputer. Diese Voreinstellung verwendet standardmäßig die Konfiguration, die von den Modulentwicklern bereitgestellt wird.'
        },
        max: {
          title: 'Maximal',
          description: 'Höchste Leistung. Diese Voreinstellung verwendet die maximale Ressourcenkapazität Ihres Computers. Dies kann Verzögerungen in anderen Programmen verursachen.'
        },
        expert: {
          title: 'Experte',
          description: 'Diese Voreinstellung führt keine Aktionen aus. Alle Einstellungen müssen manuell gesetzt werden.'
        }
      }
    },

    doneDialog: {
      title: 'Einrichtung abgeschlossen',
      body: 'Jetzt können Sie die Anwendung verwenden. Wir benötigen jedoch noch etwas Zeit, um alles vorzubereiten (1-3 Minuten). Während dieser Zeit kann es keine Updates auf dem Hauptdashboard geben. Dies ist normal für den ersten Start :) In wenigen Minuten werden Diagramme und aktuelle Informationen auf dem Hauptdashboard angezeigt.',
      finishButton: "Großartig! Los geht's!"
    }
  },
  settings: {
    system: 'System',
    look: 'GUI',
    darkMode: 'Dunkelmodus',
    matrixMode: 'Matrix-Modus',
    autoUpdates: 'Automatische Updates',
    autoUpdatesDescription: 'Die Anwendung automatisch auf die letzte Version aktualisieren.',
    autoStartup: 'Autostart',
    autoStartupDescription: 'Die Anwendung automatisch starten, wenn das System hochfährt.',
    hideTray: 'Anwendung im Infobereich verstecken',
    hideTrayDescription: 'Die App im Infobereich verstecken, aber nicht schließen. Das Hauptfenster beim Start nicht anzeigen.',
    language: 'Sprache',
    idDescription: 'Wie kann man ID bekommen? Schauen Sie nach',
    data: 'Speicher',
    dataDescription: 'Derzeit sind Ihre Module im Ordner:',
    warnDelStatistics: 'Sind Sie sicher, dass Sie alle Statistiken löschen möchten?',
    warnDelCache: 'Sind Sie sicher, dass Sie den Modulcache löschen möchten? Die App wird nach dieser Aktion geschlossen und möglicherweise nicht automatisch neu gestartet.',
    warnDelData: 'Sind Sie sicher, dass Sie alle Daten löschen möchten, einschließlich Cache, Einstellungen und Module? Die App wird nach dieser Aktion geschlossen und möglicherweise nicht automatisch neu gestartet',
    openDataFolder: 'Dateinordner öffnen',
    changeModulesDataLocation: 'Den Speicherort der Moduldaten ändern',
    deleteStatistics: 'Statistiken löschen',
    deleteModulesCache: 'Modulcache löschen',
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

      cancell: 'Aufwachen, als wäre nichts passiert',
      submit: 'Ab ins Kaninchenloch'
    }
  },

  dashboard: {
    statistics: 'Angriffskraft-Statistiken',
    announcement: {
      title: 'Mitteilung',
      close: 'Schließen',
      message: `UPD 04.04.26

Hallo Community!

Dem Prinzip der Offenheit treu, das immer die Grundlage unserer Arbeit war, haben wir ein kleines Audit-Tool vorbereitet und stellen es nun öffentlich zur Verfügung. Mit diesem Tool kann man die aktuellen Angriffsziele in Echtzeit sehen und ihren Status verfolgen, sodass jede Teilnehmerin und jeder Teilnehmer unabhängig kontrollieren und verifizieren kann, was geschieht. Keine geschlossenen Räume, keine Geheimnisse.

Es sollte betont werden, dass die Veröffentlichung dieses Tools eine erzwungene Maßnahme ist, die dem Gegner in gewissem Maße ermöglichen wird, unsere Schläge nachzuverfolgen, was nicht gut ist. Die Worte der Administration des IT-Army-Kanals ließen uns jedoch keine andere Wahl, als ihnen durch Taten zu widersprechen. Zugleich ist hinzuzufügen, dass diese Möglichkeit immer bestanden hat, und wir treffen diese Entscheidung bewusst und mit klarem Verständnis der damit verbundenen Risiken.

Technisch gesehen fängt der Auditor den ausgehenden Datenverkehr von mhddos_proxy, distress oder jedem anderen Programm ab und zeigt eine Tabelle mit allen IP-Adressen an, an die Anfragen gesendet werden, zusammen mit der Anzahl der Pakete und dem Datenvolumen. Jede IP ist ein Link zu ipinfo.io, wo man sofort prüfen kann, wem sie gehört. Das Tool lässt sich mit einem einzigen Docker-Befehl starten, und wenn Zweifel daran bestehen, was im Inneren geschieht, genügt es, das Dockerfile in ein beliebiges LLM zu kopieren und um eine Erklärung zu bitten.

DAS TOOL FÜR DIE UNABHÄNGIGE PRÜFUNG DER ZIELE BEFINDET SICH HIER: https://github.com/porthole-ascend-cinnamon/targets_audit

Jede interessierte Person kann, selbstständig oder mithilfe eines beliebigen LLM, überprüfen, dass für dieses Audit nur minimale technische Kompetenz erforderlich ist. Es gab und gibt keinen Bedarf, in sensiblen Code einzudringen, schon gar nicht für diejenigen, die ihn offensichtlich nicht verstehen, denn gerade die Unfähigkeit, dieses Audit selbstständig durchzuführen, führte zur Forderung nach vollem Zugang. Trotzdem bestand der Administrator der IT-Army-Gruppe weiterhin auf vollem Zugang zur technischen Infrastruktur und ignorierte alle vorgebrachten Argumente.

Ja, wir haben den offenen Zugang zu den Zielen seinerzeit formell geschlossen, aber wir haben immer klar verstanden, dass dies nur zufällige Personen aufhalten würde. Zu diesen gehört offensichtlich auch der erwähnte Administrator. Technisch ist es unmöglich, solche Dinge zu verbergen, und genau das demonstrieren wir jetzt. Und leider hat der Feind dies schon lange ausgenutzt.

Wer steht wirklich hinter den Operationen?
Das Entwicklungs- und Aufklärungsteam, das in den letzten vier Jahren für alle Operationen verantwortlich war, kennt keine Organisationsstruktur mit dem Namen "IT Army" außer 1-2 Chat-Administratoren, die sich immer als ganz normale Freiwillige dargestellt haben. Daher zerschellen Aussagen wie "wir können das nicht verifizieren" an einer einfachen Realität: Ein solches "wir" existiert nicht. Die IT Army war immer eine verteilte Freiwilligengemeinschaft. Die Kanal-Admins haben weder mit der Organisation der Angriffe noch mit der Pflege der Werkzeuge etwas zu tun.

Der Kanal-Admin verlangte vollen Zugang sowohl zur Aufklärung als auch zu den Entwicklern, ohne irgendeine nachvollziehbare Begründung. Vor einem Dutzend Entwicklern, die seit Beginn bei ITAU dabei sind, konnte er seine Absichten nicht erklären. Stattdessen drohte er damit, uns das Vertrauen zu entziehen und eigenständig ein neues Team zusammenzustellen. Wir sind der Ansicht, dass die Community davon erfahren sollte.

Vorwürfe mangelnder Transparenz sind nichts weiter als eine Erfindung. Das Tool liegt vor Ihnen, die Ziele liegen vor Ihnen. Das Audit ist für alle genau jetzt verfügbar.

Daher ermutigen wir alle, den Auditor zu nutzen und unsere Ideale zu unterstützen. Wir freuen uns auf Ihr Feedback und Ihre Kommentare.

Offenheit ist keine Schwäche. Sie ist unsere Stärke.`
    },
    bytes: 'Gesendet / Datenverkehr / Insgesamt',
    bytesHint: 'Die Statistiken zum gesendeten Datenverkehr können ungenau sein. Dies hängt vom Modul und seiner Funktionsweise ab. Die Gesamtstatistik ist immer präzise und zeigt aggregierte Informationen aus allen laufenden Tools an.',
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
        smooth: 'Geglättet'
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
    itarmyAPIKeyEmpty: 'IT Army ID ist nicht angegeben. Es ist nicht kritisch, aber es ist erforderlich, um allgemeine Statistiken anzuzeigen. Sie können sie in den Einstellungen angeben.'
  },

  developers: {
    itaySubtitle: 'Eine Community ukrainischer IT-Spezialisten, die Ende Februar 2022 gegründet wurde, um den Feind im Informations- und Cyberspace nach dem Beginn der russischen Invasion in der Ukraine am 24. Februar 2022 zu neutralisieren.',
    shieldMore: 'Erfahren Sie mehr über uns und unsere Operationen:',
    partners: 'Kollegen und Partner',
    contacts: 'Kontakte',
    contactP1: 'Für Fragen zur Anwendung, fragen Sie zunächst im IT Army-Chat:',
    contactP1_1: 'Oder als letztes Mittel, auf unserem Kanal',
    contactP1_2: 'Wenn Sie uns auf dem Kanal schreiben, denken Sie daran, dass wir nur über sehr begrenzte Ressourcen verfügen und möglicherweise nicht antworten können. In der Regel gibt es jedoch Community-Mitglieder, die Ihnen helfen können.',
    contactP2: 'Technische Probleme mit der Anwendung - wenn Sie wissen, wie man GitHub verwendet, erstellen Sie bitte ein Issue im Repository.',
    contactP2_1: 'Wenn nicht - fragen Sie im IT Army-Chat.',
    contactP3: 'Fragen über Module - richten Sie sie an die Modul-Entwickler.',
    contributors: 'Mitwirkende',
    contributorsSubtitle: 'Helfen Sie dabei, das Programm zu verbessern, und Ihr Name wird automatisch in dieser Liste erscheinen. Die Liste zeigt auch Mitwirkende zur vorherigen Version der Anwendung und einigen Modulen.'
  },

  activeness: {
    login: {
      title: 'Activeness Login',
      email: 'E-Mail',
      password: 'Passwort',
      info: 'Unglücklicherweise erfordert Activeness zusätzliche Anmeldung zur Verwendung. In Zukunft werden wir versuchen, eine Anmeldung für alle IT Army-Dienste bereitzustellen. Wenn Sie nicht wissen, was Activeness ist, besuchen Sie https://activeness.social/.',
      loginButton: 'Einloggen / Registrieren',
      failed: 'Anmeldung fehlgeschlagen. Überprüfen Sie Ihre Anmeldeinformationen/Netzwerkverbindung/Activeness-Status und versuchen Sie es erneut.'
    },
    tasksTable: {
      title: 'Aufgaben',
      id: 'ID',
      what: 'Was ist zu tun',
      link: 'Link',
      description: 'Beschreibung',
      actions: 'Aktionen',
      priority: 'Diese Aufgabe hat Priorität. Es ist sehr wichtig, sie zuerst zu erledigen'
    },

    logoutButton: 'Ausloggen',
    suggesttarget: 'Mein Ziel vorschlagen',

    notifyTaskLoadFailed: 'Fehler beim Laden der Aufgaben. Fehler: {error}',
    notifyFailedToMakeTaskDone: 'Fehler beim Markieren der Aufgabe als erledigt. Fehler: {error}',
    notifyFailedTOIgnoreTask: 'Fehler beim Ignorieren der Aufgabe. Fehler: {error}'
  }
}
