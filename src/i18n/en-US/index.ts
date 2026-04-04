// This is just an example,
// so you can safely delete all default props below

export default {
  layout: {
    dashboard: 'Main',
    modules: 'DDOS Modules',
    activeness: 'Activeness',
    settings: 'Settings',
    schedule: 'Scheduling',
    top: 'Rankings',
    developers: 'Developers'
  },
  schedule: {
    title: 'Scheduling',
    description: 'Automatically start and stop selected modules by time window.',
    enabled: 'Enable Scheduler',
    enabledDescription: 'When enabled, app enforces module run/stop state based on selected time.',
    startTime: 'Start Time',
    endTime: 'End Time',
    intervalModule: 'Module',
    modulesTitle: 'Modules to run in schedule window',
    intervalsTitle: 'Time Intervals',
    noIntervals: 'No intervals configured.',
    daysTitle: 'Days of week',
    addInterval: 'Add Interval',
    removeInterval: 'Remove Interval',
    days: {
      sun: 'Sun',
      mon: 'Mon',
      tue: 'Tue',
      wed: 'Wed',
      thu: 'Thu',
      fri: 'Fri',
      sat: 'Sat'
    },
    close: 'Close',
    autoSaveHint: 'Changes are saved automatically.',
    overlapError: 'Intervals must not overlap.',
    saveFailed: 'Failed to save schedule. Error: {error}'
  },
  modules: {
    menu: {
      main: 'Main',
      active: 'Active Module',
      available: 'Available Modules'
    },
    active: {
      selected: 'Selected Module for Launch',
      enabled: {
        title: 'Activate Module',
        caption: 'Enable or disable module execution'
      },
      executionLog: 'Execution Log',
      stdout: 'Standard Output (stdout)',
      stderr: 'Standard Error Output (stderr)'
    },
    available: {
      configuration: 'Configuration',
      selVersion: 'Select Version',
      selVersionDescription: 'Module version for launch',
      autoupdates: 'Automatic Updates',
      autoupdatesDescription: 'Automatically update the module to the latest version',
      arguments: 'Launch Parameters (for advanced users)',
      argumentsDescription: 'Additional launch parameters to be used during binary file execution',
      versions: {
        versions: 'List of Versions',
        downloadInstall: 'Download and Install',
        selectUse: 'Select for Use'
      }
    },
    mhddosProxy: {
      copies: 'Copies',
      copiesDescription: 'Number of processes (module copies) launched. 0 for auto',
      threads: 'Threads',
      threadsDescription: 'Number of threads launched per process. 0 for auto',
      useMyIp: 'Use My IP',
      useMyIpDescription: 'Percentage of using your own IP address or VPN, if configured'
    },
    distress: {
      concurrency: 'Concurrency',
      concurrencyDescription: 'Number of task creators. 0 sets default to 4096',
      torConnections: 'Tor Connections',
      torConnectionsDescription: 'Use Tor connections for the attack',
      useMyIp: 'Use My IP',
      useMyIpDescription: 'Percentage of using your own IP address or VPN, if configured',
      UDPFlood: 'Disable UDP Flood',
      UDPFloodDescription: 'Disallow UDP flood attack. Works if you use your own IP',
      ICMPFlood: 'Enable ICMP Flood',
      ICMPFloodDescription: 'Allow ICMP flood attack. Works if you use your own IP',
      PACKETFlood: 'Enable PACKET Flood',
      PACKETFloodDescription: 'Not work in OS Windows! Allow PACKET flood attack. Works if you use your own IP'
    }
  },
  top: {
    volunteers: 'TOP VOLUNTEERS',
    week: 'Per Week',
    month: 'Per Month',
    activeness: 'Activeness',

    achievements: {
      peopleAreLikeShips: {
        title: 'People are like Ships',
        subtitle: "if they're Russian, they're going *****",

        body: "Looks like you just tried to select Russian language. You need us to rescue you. Don't worry, we'll soon denazify and liberate you.",
        explanationHint: "I don't understand. Clarify this meme for me.",
        explanation: '"russian warship, go fuck yourself", was the final communication made on 24 February, the first day of the 2022 Snake Island campaign, by Ukrainian border guard Roman Hrybov to the russian missile cruiser moskva. On 13 April 2022, moskva was critically damaged by an explosion caused by Ukrainian anti-ship missiles and sank the following day. "People are like ships" is a well-known in Ukraine song by Skryabin band.Denazification and making Ukrainians free - are slogans of russian propaganda of "russian world" doctrine.',

        goodButton: "I'm silly. Please liberate me.",
        badButton: "I don't like Ukraine"
      }
    },

    activenessData: {
      notifyLoadFailed: 'Failed to load activeness statistics. Error: {error}'
    }
  },
  bootstrap: {
    title: "Looks like this is your first launch. Let's help you",

    header: {
      language: 'Choose Language',
      data: 'Data',
      itarmy: 'ITArmy ID',
      module: 'Modules'
    },

    language: {
      continueButton: 'Continue'
    },

    data: {
      body: 'The app will automatically download the necessary modules and save them on your PC. Modules and all data will be stored in the folder',
      windows: "Before continuing, make sure you've added the data folder to the windows defender and antivirus exceptions. Otherwise, all downloaded data will be deleted.",
      openDataFolderButton: 'Open Data Folder',
      changeDataFolderButton: 'Change Data Folder',
      continueButton: 'Continue',
      backButton: 'Back'
    },

    itarmy: {
      body: 'If you have an ITArmy ID, enter it below. If not, press the continue button',
      uuidInputTitle: 'ITArmy ID',
      continueButton: 'Continue',
      backButton: 'Back'
    },

    module: {
      body: 'Choose a preset. All data can then be changed',
      installation: {
        title: 'Module Installation'
      },
      preset: {
        government: {
          title: 'Government Institution / Old PC',
          description: 'This preset uses as few resources as possible. This may disable some module functions.'
        },
        laptop: {
          title: 'Laptop',
          description: "This preset will try to use as few resources as possible but won't disable functions."
        },
        comfort: {
          title: 'Comfort',
          description: 'This preset uses resources in comfortable mode. Does not affect the performance of your computer.'
        },
        normal: {
          title: 'Normal',
          description: 'Normal home computer. This preset uses the configuration provided by module developers by default.'
        },
        max: {
          title: 'Maximum',
          description: 'Maximum power. This preset uses the maximum resources of your computer. This may cause lags in other programs.'
        },
        expert: {
          title: 'Expert',
          description: 'This preset does not perform any actions. All settings must be done manually.'
        }
      }
    },

    doneDialog: {
      title: 'Setup Completed',
      body: 'Now you can start using the application. But we need a bit more time to prepare everything (1-3 minutes). During this time there may be no updates on the main dashboard. This is normal for the first launch :) In a few minutes, charts and current information will appear on the main dashboard.',
      finishButton: "Great! Let's start!"
    }
  },
  settings: {
    system: 'System',
    look: 'GUI',
    darkMode: 'Dark Mode',
    matrixMode: 'Matrix Mode',
    autoUpdates: 'Automatic Updates',
    autoUpdatesDescription: 'Automatically update the application to the latest version.',
    autoStartup: 'Automatic Startup',
    autoStartupDescription: 'Automatically start the application when the system boots.',
    hideTray: 'Hide App in Tray',
    hideTrayDescription: 'Hide the app in the tray, not close it. Also, do not show the main window during startup.',
    language: 'Language',
    idDescription: 'How to get ID ? Look on',
    data: 'Storage',
    dataDescription: 'Currently your modules are located in the folder:',
    warnDelStatistics: 'Are you sure you want to delete the statistics?',
    warnDelCache: 'Are you sure you want to delete the modules cache? The app will close after this action and may not restart automatically.',
    warnDelData: 'Do you really want to delete all data, including cache, settings, and modules? The app will close after this action and may not restart automatically.',
    openDataFolder: 'Open Data Folder',
    changeModulesDataLocation: 'Change Modules Data Location',
    deleteStatistics: 'Delete Statistics',
    deleteModulesCache: 'Delete Modules Cache',
    deleteAllTheData: 'Factory Settings',
    diagnostics: {
      title: 'Diagnostics',
      description: 'Service tools for troubleshooting.',
      openProfileFolder: 'Profile folder',
      openStabilityLog: 'Stability log'
    },
    matrixQuiz: {
      header: 'Wake up, {name} ...',
      body: 'You are genno-modified ukrnazi from west Ukraine laboratories. We are all brain-washed and think the same. Answer associations (first what is on your mind) to prove that.',

      q1: 'What is rustling?',
      q2: 'Who is putin?',
      q3: 'What is dried up?',

      cancell: 'Wake up as nothing happened',
      submit: 'Down to the rabbit hole'
    }
  },

  dashboard: {
    statistics: 'Attack Power Statistics',
    announcement: {
      title: 'Announcement',
      close: 'Close',
      message: `UPD 04.04.26

Hello Community!

Remaining faithful to the principle of openness, which has always been the foundation of our work, we have prepared a small audit tool and are making it publicly available. This tool allows anyone to see the current attack targets in real time and monitor their status, meaning every participant can independently control and verify what is happening. No closed rooms, no secrets.

It should be emphasized that publishing this tool is a forced measure which, to some extent, will give the enemy the ability to track our strikes, and that is not good. However, the words of the IT Army channel administration left us no choice but to refute them through action. At the same time, it is worth adding that this possibility has always existed, and we are making this decision consciously, with a clear understanding of the risks involved.

Technically, the auditor intercepts outgoing traffic from mhddos_proxy, distress, or any other program and displays a table with all IP addresses to which requests are being sent, along with the number of packets and traffic volume. Each IP is a link to ipinfo.io, where you can immediately verify who it belongs to. It can be launched with a single Docker command, and if there are doubts about what happens inside, it is enough to copy the Dockerfile into any LLM and ask for an explanation.

THE TOOL FOR INDEPENDENT AUDITING OF TARGETS IS AVAILABLE HERE: https://github.com/porthole-ascend-cinnamon/targets_audit

Anyone interested, either independently or with the help of any LLM, can verify that only minimal technical competence is required to carry out this audit. There was never any need to dig into sensitive code, especially for those who obviously do not understand it, because it was precisely the inability to perform this audit independently that prompted the demand for full access. Despite this, the administrator of the IT Army group continued insisting on full access to the technical infrastructure, ignoring all of the arguments presented.

Yes, we formally closed open access to the targets at one point, but we always clearly understood that this would stop only random people. The aforementioned administrator clearly belongs to that category. Technically, it is impossible to hide such things, and that is exactly what we are demonstrating now. Unfortunately, the enemy has long been taking advantage of this.

Who is really behind the operations?
The development and intelligence team that has been responsible for all operations over the past four years knows of no organizational structure called "IT Army" except for 1-2 chat admins who have always presented themselves as ordinary volunteers. Therefore, statements such as "we cannot verify" collapse against a simple reality: there is no such "we." IT Army has always been a distributed volunteer community. The channel admins have nothing to do with organizing attacks or maintaining the tools.

The channel admin demanded full access to both intelligence and developers without any clear justification. In front of a dozen developers who have been in ITAU from the very beginning, he could not explain his intentions. Instead, he threatened to declare no confidence in us and independently assemble a new team. We believe the community deserves to know this.

Claims of non-transparency are nothing more than fiction. The tool is before you, the targets are before you. The audit is available to everyone right now.

So we encourage everyone to use the auditor and support our ideals. We are waiting for your feedback and comments.

Openness is not weakness. It is our strength.`
    },
    bytes: 'Sent / Traffic / Total',
    bytesHint: 'Statistics of send traffic may be not accurate. It depends on the module and the way it works. Total statistics is always precise and shows aggregated information from all the running tools.',
    moduleStatus: 'Module Status',
    control: 'System Control',
    autostart: 'Autostart',
    scheduler: 'Scheduler',
    cpuLoad: 'CPU',
    ramLoad: 'RAM',
    on: 'ON',
    off: 'OFF',
    intervals: 'Intervals',
    updates: 'KIT Version',
    latest: 'Current',
    chart: {
      now: 'Now',
      average: 'Average',
      peak: 'Peak',
      bitrate: 'Bitrate',
      trend: 'Trend',
      view: {
        raw: 'Raw',
        smooth: 'Smooth'
      },
      noData: 'No statistics yet',
      events: {
        started: 'Started',
        stopped: 'Stopped',
        error: 'Error'
      },
      ranges: {
        m5: '5m',
        m15: '15m',
        h1: '1h',
        h6: '6h'
      }
    },
    activeness: {
      score: 'Activeness Score'
    },
    itarmyAPIKeyEmpty: 'IT Army ID is not specified. It is not critical, but it is necessary for displaying general statistics. You can specify it in the settings.'
  },

  developers: {
    itaySubtitle: 'A community of Ukrainian IT specialists, created at the end of February 2022 to neutralize the enemy in information and cyberspace after the start of the Russian invasion of Ukraine on February 24, 2022.',
    shieldMore: 'Learn more about us and our operations:',
    partners: 'Colleges and Partners',
    contacts: 'Contacts',
    contactP1: 'For questions about the application, first, ask in the IT Army chat:',
    contactP1_1: 'or, as a last resort, on our channel',
    contactP1_2: 'If you write to us on the channel, remember that we have very few resources and might not respond. But usually, there are community members who can help.',
    contactP2: 'Technical problems with the application - if you know how to use Github, please create an issue in the repository',
    contactP2_1: 'if not - ask in the IT Army chat.',
    contactP3: 'Questions about modules - direct them to the module developers.',
    contributors: 'Contributors',
    contributorsSubtitle: 'Help improve the program and your name will automatically appear in this list. The list also shows contributors to the previous version of the application and some modules.'
  },

  activeness: {
    login: {
      title: 'Activeness Login',
      email: 'Email',
      password: 'Password',
      info: 'Unfortunatelly, activeness requires additional login to be used. In future we will try to provide one login to all the IT Army services. If you dont know what is the Activeness, visit https://activeness.social/',
      loginButton: 'Login / Register',
      failed: 'Login failed. Check your credentials/network connection/activeness status and try again.'
    },
    tasksTable: {
      title: 'Tasks',
      id: 'ID',
      what: 'What to do',
      link: 'Link',
      description: 'Description',
      actions: 'Actions',
      priority: 'This task is priority. It is very important to do it first.'
    },

    logoutButton: 'Logout',
    suggesttarget: 'Suggest my target',

    notifyTaskLoadFailed: 'Failed to load tasks. Error: {error}',
    notifyFailedToMakeTaskDone: 'Failed to make task done. Error: {error}',
    notifyFailedTOIgnoreTask: 'Failed to ignore task. Error: {error}'
  }
}
