/**
 * Composable around the release data.
 *
 * useFetch runs while the page is prerendered, so the HTML it produces already
 * contains the releases — the browser never calls GitHub, and there is no
 * server at request time to call either. The list itself is written to
 * data/releases.json by the publishing workflow.
 */

import type { Release } from '~/server/utils/releases'

export type { Release }

interface ReleasesResponse {
  releases: Release[]
  count: number
  source: string
  fetchedAt: number | null
  stale: boolean
}

export const fmtSize = (bytes?: number) =>
  bytes === undefined ? '—' : (bytes / 1048576).toFixed(1) + ' MB'

/**
 * A release date, written the way the language in view writes dates.
 *
 * The locale is a parameter rather than a constant because the page has two
 * languages: "October 19, 2026" is not a translation of "19 октября 2026 г.",
 * it is the same date in the wrong notation, and a reader in Russian reads the
 * dots.
 */
export const fmtDate = (iso?: string, locale = 'en-US') => {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString(locale, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export async function useReleases() {
  const { data, error } = await useFetch<ReleasesResponse>('/api/releases', {
    key: 'releases',
    default: () => ({ releases: [], count: 0, source: 'local-cache', fetchedAt: null, stale: false }) as ReleasesResponse,
  })

  const releases = computed<Release[]>(() => data.value?.releases ?? [])

  const latest = computed<Release | null>(
    () => releases.value.find((r) => !r.prerelease) ?? releases.value[0] ?? null,
  )

  const visibleReleases = computed(() => releases.value.slice(0, 6))

  return { releases, latest, visibleReleases, error, meta: data }
}