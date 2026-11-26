/**
 * Writes data/releases.json, the only thing the page reads for releases.
 *
 * Runs in the publishing workflow before the site is generated, so a build
 * reflects GitHub at that moment and the browser never talks to GitHub. When
 * the API is unreachable the previous file is kept, so an outage costs
 * freshness and never a build.
 *
 * Also marks the mirrored copies: an asset is offered from this origin only
 * when the file in ../mirror/<tag>/<name> has the same size as the release,
 * the same check the server used to make.
 */

import { mkdir, readFile, stat, writeFile, rename } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const API = process.env.SPIKY_RELEASES_API
  ?? 'https://api.github.com/repos/SpikyTeam/SpikyMC/releases'
const MIRROR = fileURLToPath(new URL('../mirror/', import.meta.url))
const OUT = fileURLToPath(new URL('../data/releases.json', import.meta.url))

async function mirrored(tag, name, size) {
  try {
    const st = await stat(join(MIRROR, tag, name))
    return st.isFile() && st.size === size
  } catch {
    return false
  }
}

function slotOf(name) {
  if (/-Setup-.*\.exe$/i.test(name)) return 'setup'
  if (/Portable.*\.zip$/i.test(name)) return 'windowsPortable'
  if (/\.AppImage$/i.test(name)) return 'appImage'
  if (/Portable.*\.tar\.gz$/i.test(name)) return 'linuxPortable'
  return null
}

async function normalise(raw) {
  const list = []
  for (const r of Array.isArray(raw) ? raw : []) {
    const tag = r.tag_name ?? ''
    const assets = {}
    for (const a of r.assets ?? []) {
      const slot = slotOf(a.name ?? '')
      if (!slot || assets[slot]) continue
      const asset = { url: a.browser_download_url, size: a.size }
      if (await mirrored(tag, a.name, a.size)) {
        asset.local = `/downloads/${encodeURIComponent(tag)}/${encodeURIComponent(a.name)}`
      }
      assets[slot] = asset
    }
    list.push({
      tag,
      name: r.name || tag,
      publishedAt: r.published_at ?? r.created_at,
      prerelease: !!r.prerelease,
      draft: !!r.draft,
      url: r.html_url,
      body: r.body ?? '',
      assets,
    })
  }
  return list
}

async function main() {
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'spikymc-site',
  }
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`

  let releases
  try {
    const res = await fetch(`${API}?per_page=10`, { headers, signal: AbortSignal.timeout(20000) })
    if (!res.ok) throw new Error(`GitHub API responded ${res.status}`)
    releases = await normalise(await res.json())
    if (releases.length === 0) throw new Error('no releases in the response')
  } catch (err) {
    try {
      JSON.parse(await readFile(OUT, 'utf8'))
      console.warn(`keeping the previous releases.json: ${err.message}`)
      return
    } catch {
      throw err
    }
  }

  await mkdir(dirname(OUT), { recursive: true })
  const tmp = `${OUT}.tmp`
  await writeFile(tmp, JSON.stringify({ releases }), 'utf8')
  await rename(tmp, OUT)
  console.log(`wrote ${releases.length} releases`)
}

await main()
