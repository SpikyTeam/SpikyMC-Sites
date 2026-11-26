/**
 * The release list the page is built from.
 *
 * The page is prerendered, so this runs at build time: the workflow that
 * publishes it fetches GitHub once, writes ../data/releases.json, and this
 * module reads it back. That keeps a build reproducible, and keeps the
 * browser from ever calling GitHub.
 *
 * The entry shape is the one the page renders; the workflows write it.
 */

import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

export interface ReleaseAsset {
  url: string
  size: number
  /**
   * The same file served from this origin (mirrored into the release asset
   * bundle). Only set once the mirrored file's size matched the release.
   */
  local?: string
}

export interface Release {
  tag: string
  name: string
  publishedAt: string
  prerelease: boolean
  draft: boolean
  url: string
  body: string
  assets: {
    setup?: ReleaseAsset
    windowsPortable?: ReleaseAsset
    appImage?: ReleaseAsset
    linuxPortable?: ReleaseAsset
  }
}

export const RELEASES_FILE = fileURLToPath(
  new URL('../../data/releases.json', import.meta.url),
)

export async function readReleases(): Promise<Release[]> {
  const parsed = JSON.parse(await readFile(RELEASES_FILE, 'utf8'))
  return Array.isArray(parsed?.releases) ? parsed.releases : []
}
