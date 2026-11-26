/**
 * Best-effort platform guess from a user-agent string.
 *
 * Used on the server to decide which build to recommend first, so the right
 * one is in the HTML rather than swapped in after hydration. It is a guess by
 * definition and stays deliberately conservative: an unrecognised agent gets
 * no recommendation, because showing someone the wrong installer is worse
 * than showing them both.
 *
 * Order matters. Android reports "Linux" too, and iOS reports "Mac OS X",
 * so the more specific tokens have to be tested before the generic ones.
 */

export type Platform = 'windows' | 'linux' | 'macos' | 'android' | 'ios' | 'other' | null

export function detectPlatform(ua: string): Platform {
  if (!ua) return null

  const s = ua.toLowerCase()

  // phones and tablets first: they claim to be Linux or Mac OS X as well
  if (s.includes('android')) return 'android'
  if (/iphone|ipad|ipod/.test(s)) return 'ios'

  // bots and crawlers should never be told to download anything
  if (/bot|crawler|spider|curl|wget|python-requests|headless|monitor|uptime/.test(s)) {
    return null
  }

  if (s.includes('windows') || s.includes('win32') || s.includes('win64')) return 'windows'
  if (s.includes('mac os') || s.includes('macintosh') || s.includes('darwin')) return 'macos'
  if (s.includes('linux') || s.includes('x11') || s.includes('freebsd') || s.includes('openbsd')) {
    return 'linux'
  }

  return 'other'
}

/**
 * Which of the two published platform groups to recommend.
 *
 * Only Windows and Linux have builds, so an Android phone or a Mac lands on
 * the full list instead of being pushed at a binary that will not run. A Mac
 * is worth calling out as Linux-compatible though: it is the one non-Linux
 * platform where an AppImage has a real chance.
 */
export function recommendedGroup(platform: Platform): 'windows' | 'linux' | null {
  if (platform === 'windows') return 'windows'
  if (platform === 'linux' || platform === 'macos') return 'linux'
  return null
}

/**
 * Where a platform choice is kept between visits.
 *
 * A cookie and not localStorage, and that is the whole difference: the server
 * cannot read localStorage, so a choice kept there could only be applied after
 * hydration — the page would render the platform guessed from the user agent
 * and then swap to the one the visitor had chosen. A cookie goes out with every
 * request, so the server renders the right one and there is nothing to swap.
 */
export const PLATFORM_COOKIE = 'spiky-platform'

/**
 * The platform a stored choice names, or null if it names none.
 *
 * Anything unrecognised is treated as no choice at all. A stale or hand-edited
 * value must not be able to put the page into a state it cannot describe.
 */
export function normalizePlatform(value: unknown): 'windows' | 'linux' | null {
  return value === 'windows' || value === 'linux' ? value : null
}