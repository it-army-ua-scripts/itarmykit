import { ipcMain } from "electron";
import fetch from "electron-fetch";

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


async function getDevelopersFromGithub(): Promise<Contributor[]> {
    const itkitResponse = await fetch("https://api.github.com/repos/it-army-ua-scripts/itarmykit/contributors?per_page=100")
    const itkitContributors = await itkitResponse.json() as Contributor[]
    itkitContributors.sort((a, b) => b.contributions - a.contributions)

    const db1000nResponse = await fetch("https://api.github.com/repos/arriven/db1000n/contributors?per_page=100")
    const db1000nContributors = await db1000nResponse.json() as Contributor[]
    db1000nContributors.sort((a, b) => b.contributions - a.contributions)

    const mhddos_proxyResponse = await fetch("https://api.github.com/repos/porthole-ascend-cinnamon/mhddos_proxy_releases/contributors?per_page=100")
    const mhddos_proxyContributors = await mhddos_proxyResponse.json() as Contributor[]
    mhddos_proxyContributors.sort((a, b) => b.contributions - a.contributions)

    const distressResponse = await fetch("https://api.github.com/repos/Yneth/distress-releases/contributors?per_page=100")
    const distressContributors = await distressResponse.json() as Contributor[]
    distressContributors.sort((a, b) => b.contributions - a.contributions)
	
    const ADSSResponse = await fetch("https://api.github.com/repos/it-army-ua-scripts/ADSS/contributors?per_page=100")
    const ADSSContributors = await ADSSResponse.json() as Contributor[]
    ADSSContributors.sort((a, b) => b.contributions - a.contributions)

    let contributors = itkitContributors
    contributors.sort((a, b) => b.contributions - a.contributions)

    for (const db1000nContributor of db1000nContributors) {
        const existingContributor = contributors.find(c => c.login === db1000nContributor.login)
        if (existingContributor) {
            existingContributor.contributions += db1000nContributor.contributions
        } else {
            contributors.push(db1000nContributor)
        }
    }

    for (const mhddos_proxyContributor of mhddos_proxyContributors) {
        const existingContributor = contributors.find(c => c.login === mhddos_proxyContributor.login)
        if (existingContributor) {
            existingContributor.contributions += mhddos_proxyContributor.contributions
        } else {
            contributors.push(mhddos_proxyContributor)
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

    contributorsCache = contributors
    contributorsCacheTime = new Date()
    return contributors
}

async function getContributors(): Promise<Contributor[]> {
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