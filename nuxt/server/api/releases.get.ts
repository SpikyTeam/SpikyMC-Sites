/**
 * Releases list, read from the file the publishing workflow fetched.
 *
 * ?tag=1.1.1 narrows it to one release, which is what the per-release route
 * uses so it renders from exactly the same code path.
 */

export default defineEventHandler(async (event) => {
  const data = await readReleases()

  const tag = getQuery(event).tag
  const wanted = typeof tag === 'string' ? tag : null

  const visible = data.filter((r) => !r.draft)
  const releases = wanted ? visible.filter((r) => r.tag === wanted) : visible

  return {
    releases,
    count: releases.length,
    source: 'releases.json',
    fetchedAt: null,
    stale: false,
  }
})
