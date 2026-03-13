import { ipcMain } from 'electron'
import fetch from 'electron-fetch'

export interface Contributor {
    login: string
    id: number
    node_id: string
    avatar_url: string
    gravatar_id: string
    url: string
    html_url: string
    followers_url: string
    following_url: string
    gists_url: string
    starred_url: string
    subscriptions_url: string
    organizations_url: string
    repos_url: string
    events_url: string
    received_events_url: string
    type: string
    site_admin: boolean
    contributions: number
}

let contributorsCache: Contributor[] | null = null
let contributorsCacheTime: Date | null = null

async function fetchContributors (repo: string): Promise<Contributor[]> {
  try {
    const response = await fetch(`https://api.github.com/repos/${repo}/contributors?per_page=100`)
    if (response.status !== 200) {
      console.warn(`[developers] Failed to load contributors for ${repo}. Status: ${response.status}`)
      return []
    }
    const contributors = await response.json() as Contributor[]
    contributors.sort((a, b) => b.contributions - a.contributions)
    return contributors
  } catch (err) {
    console.warn(`[developers] Failed to load contributors for ${repo}`, err)
    return []
  }
}

async function getDevelopersFromGithub (): Promise<Contributor[]> {
  const itkitContributors = await fetchContributors('it-army-ua-scripts/itarmykit')
  const db1000nContributors = await fetchContributors('arriven/db1000n')
  const mhddosProxyContributors = await fetchContributors('porthole-ascend-cinnamon/mhddos_proxy_releases')
  const distressContributors = await fetchContributors('Yneth/distress-releases')
  const ADSSContributors = await fetchContributors('it-army-ua-scripts/ADSS')

  const contributors = itkitContributors
  contributors.sort((a, b) => b.contributions - a.contributions)

  for (const db1000nContributor of db1000nContributors) {
    const existingContributor = contributors.find(c => c.login === db1000nContributor.login)
    if (existingContributor) {
      existingContributor.contributions += db1000nContributor.contributions
    } else {
      contributors.push(db1000nContributor)
    }
  }

  for (const mhddosProxyContributor of mhddosProxyContributors) {
    const existingContributor = contributors.find(c => c.login === mhddosProxyContributor.login)
    if (existingContributor) {
      existingContributor.contributions += mhddosProxyContributor.contributions
    } else {
      contributors.push(mhddosProxyContributor)
    }
  }

  for (const distressContributor of distressContributors) {
    const existingContributor = contributors.find(c => c.login === distressContributor.login)
    if (existingContributor) {
      existingContributor.contributions += distressContributor.contributions
    } else {
      contributors.push(distressContributor)
    }
  }

  for (const ADSSContributor of ADSSContributors) {
    const existingContributor = contributors.find(c => c.login === ADSSContributor.login)
    if (existingContributor) {
      existingContributor.contributions += ADSSContributor.contributions
    } else {
      contributors.push(ADSSContributor)
    }
  }

  contributors.sort((a, b) => b.contributions - a.contributions)
  contributorsCache = contributors
  contributorsCacheTime = new Date()
  return contributors
}

async function getContributors (): Promise<Contributor[]> {
  if (contributorsCache !== null && contributorsCacheTime !== null) {
    const now = new Date()
    const diff = now.getTime() - contributorsCacheTime.getTime()
    if (diff < 1000 * 60 * 60 * 1) { // 1 hour
      return contributorsCache
    }
  }
  return await getDevelopersFromGithub()
}

export function handleDevelopers () {
  ipcMain.handle('developers:getContributors', async () => {
    return await getContributors()
  })
}
