import { ipcMain } from 'electron'

export interface PeriodTopData {
    items: Array<{
        traffic: number,
        user_name: string,
        systems: Array<string>,
        servers_count: number,
    }>
    start_date: string
    end_data: string
}

export interface TopData {
    success: boolean;
    error: string
    data: {
        week_stats: PeriodTopData
        month_stats: PeriodTopData
    }
}

function emptyPeriodTopData (): PeriodTopData {
  return {
    items: [],
    start_date: '',
    end_data: ''
  }
}

async function getTopData (): Promise<TopData> {
  try {
    const response = await fetch('https://itarmy.com.ua/leaderboard/json/leaderboard.json')
    if (response.status !== 200) {
      return {
        success: false,
        error: `Bad status code: ${response.status}`,
        data: {
          week_stats: emptyPeriodTopData(),
          month_stats: emptyPeriodTopData()
        }
      }
    }
    return await response.json() as TopData
  } catch (err) {
    return {
      success: false,
      error: String(err),
      data: {
        week_stats: emptyPeriodTopData(),
        month_stats: emptyPeriodTopData()
      }
    }
  }
}

export function handleTop () {
  ipcMain.handle('top:getWeeklyTop', async () => {
    return await getTopData()
  })
}
