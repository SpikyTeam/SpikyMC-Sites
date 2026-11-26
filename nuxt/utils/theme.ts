/**
 * The two theme colours, and the rule for deciding which one applies.
 *
 * These duplicate `--bg` from assets/page.css and they have to: `theme-color`
 * is a meta tag the browser reads before a single stylesheet rule has been
 * applied, so it cannot ask the cascade what colour the page currently is.
 * That leaves two copies of one value, which is precisely the shape of bug in
 * which the copies drift — and they already had. The values in use were
 * #12151a and #f6f7f9: leftovers from the palette the site had before it turned
 * green, so the browser chrome matched neither theme in either theme.
 *
 * test-theme.cjs reads --bg out of the stylesheet and fails if this file, the
 * inline head script and nuxt.config stop agreeing with it.
 */

export const THEME_COLOR = {
  dark: '#0f140e',
  light: '#f6faf3',
} as const

export type Theme = keyof typeof THEME_COLOR

export const THEME_KEY = 'spiky-theme'

/**
 * Which theme the page should be, in order of authority: a choice the visitor
 * made and still has, then their operating system, then dark.
 *
 * Dark is the fallback and not light because the page is built around it. The
 * stylesheet's base rules are the dark ones and `[data-theme="light"]` is the
 * override, so a light default would leave every visitor without a preference
 * waiting for a repaint to get the page they asked for.
 */
export function resolveTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    // private mode and blocked storage both throw rather than returning null
  }
  try {
    return matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

/**
 * Point the browser chrome at the page. `theme-color` is what paints the
 * address bar and the notch on a phone, so a stale value is the page wearing
 * one colour and its surroundings wearing another.
 */
export function setThemeColor(theme: Theme) {
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', THEME_COLOR[theme])
}