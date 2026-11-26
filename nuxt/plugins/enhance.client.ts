/**
 * Loads the enhancement layer after hydration, off the critical path.
 *
 * The page is complete in the HTML the server sends; this only adds the
 * theme switch, the press circle on the two buttons, and the scroll-driven
 * flight of the word into the bar. It arrives on idle so it never competes
 * with the first paint.
 */

export default defineNuxtPlugin((nuxtApp) => {
  if (import.meta.server) return

  let mod: typeof import('~/utils/enhance') | null = null
  let loading: Promise<typeof import('~/utils/enhance')> | null = null

  const load = () => {
    if (mod) return Promise.resolve(mod)
    loading ??= import('~/utils/enhance').then((m) => {
      mod = m
      return m
    })
    return loading
  }

  const idle = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 200))
  idle(() => {
    void load().then((m) => {
      m.initEnhancements()
      bindThemeToggle(m)
    })
  }, { timeout: 1500 })

  // A NuxtLink replaces the DOM without a page load, so the flight must be
  // re-measured on the new elements.
  nuxtApp.hook('page:finish', () => {
    void load().then((m) => {
      m.enhancePage()
    })
  })

  // One delegated listener survives every swap: the nav buttons are re-rendered
  // per route, so attaching to them directly would not stick.
  let toggleBound = false
  function bindThemeToggle(m: typeof import('~/utils/enhance')) {
    if (toggleBound) return
    toggleBound = true
    document.addEventListener('click', (e) => {
      const target = e.target as Element | null
      const themeBtn = target?.closest('#themeBtn')
      if (themeBtn) {

        m.toggleTheme(e)
      }
      const langBtn = target?.closest('#langBtn')
    })
  }
})
