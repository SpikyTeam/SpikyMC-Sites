/**
 * Which language the page is in, and the function that answers in it.
 *
 * The choice is a cookie rather than localStorage, and that is the one real
 * difference from the theme. localStorage lives in the browser and the server
 * cannot see it: it would render English into the HTML it sends, and every
 * load of a Russian page would start by painting English and swapping after
 * hydration — the same flash the theme had, except that a colour swap is a
 * flicker and a text swap is the reader reading two languages.
 *
 * So the cookie goes out with the request, the server renders the right
 * strings, and the first paint is the finished page. Writing the cookie is
 * also what makes a reload keep the choice; the state itself is reactive, so
 * switching does not reload anything and the reader does not lose their place
 * on the page.
 */

import {
  LANG_CODE,
  LOCALE,
  detectLang,
  normalizeLang,
  translate,
  type Lang,
  type StringKey,
} from '~/utils/i18n'

export const LANG_COOKIE = 'spiky-lang'

/** A year, in seconds. Long enough that nobody has to think about it again. */
const MAX_AGE = 60 * 60 * 24 * 365

/** How long the page takes to go down. Its way back up lives in the stylesheet
 *  and is longer: the reader waits through the return, not through the exit. */
const FADE_OUT = 170

/** Whose switch is running. Only the newest one may bring the page back up. */
let swapToken = 0

export function useLang() {
  const cookie = useCookie<string | null>(LANG_COOKIE, {
    maxAge: MAX_AGE,
    sameSite: 'lax',
    path: '/',
  })

  /**
   * What the page is written in, decided before a single string is rendered.
   *
   * The cookie first: a language the reader chose, and that choice outranks
   * anything the browser might say about itself. Then the language the browser
   * asks for on every request — Accept-Language is a header, the server can
   * read it, and rendering it means the first paint is already the right one.
   * There is nothing to swap, nothing to fade, and nobody watches their own
   * language arrive late.
   *
   * The detection itself is not stored anywhere. It is recomputed per request,
   * so a reader who changes their browser's language gets that language, and
   * the button remains the only way to make a choice that outlives it.
   */
  const headers = useRequestHeaders(['accept-language'])

  const picked = useState<Lang | null>('spiky:lang', () => {
    const chosen = normalizeLang(cookie.value)
    if (chosen) return chosen
    return detectLang(headers['accept-language'])
  })

  /** What the page is written in. English until somebody says otherwise. */
  const lang = computed<Lang>(() => picked.value ?? 'en')

  /**
   * The language that was just set — what the hint names.
   *
   * Read after the switch, never before: `code` follows `lang`, so a caller
   * that looked at it during the switch would name the language being left,
   * and the hint would answer a question nobody asked.
   */
  const code = computed(() => LANG_CODE[lang.value])

  const locale = computed(() => LOCALE[lang.value])

  const t = (key: StringKey) => translate(lang.value, key)

  /** The hint is up. Only the stylesheet's own animationend may take it down. */
  const flashing = ref(false)

  /**
   * What the last switch said, for a page reader rather than for the eye.
   *
   * The switch takes the words and the page fades and comes back in another
   * language. Nothing about that announces itself: a screen reader hears a
   * press and then silence, and the whole page has changed under it. The
   * message is raised in the language that was just set, because that is the
   * language the reader is now in.
   */
  const status = ref('')

  /**
   * Put the page down, change every word on it, and bring it back up.
   *
   * The words are not the whole of it. They change length, so the lines
   * re-wrap under them, a button takes a different width, and everything
   * below is standing somewhere else — all of it in a single frame. That is
   * what read as a jump, and it is not motion, so there is nothing to
   * animate: layout has no keyframes.
   *
   * So it is hidden instead of smoothed over. The change happens while the
   * page cannot be seen, and the reader is shown one page at rest rather than
   * two states fighting over the same half second.
   */
  function setLang(next: Lang) {
    const apply = () => {
      picked.value = next
      cookie.value = next
      // With the language, never before it: `code` follows `lang`, and a hint
      // raised while the words are still the old ones would name the language
      // being left.
      flashing.value = true
      // And after it, never before: the message is written in the language
      // that is now in force.
      status.value = t('nav.langChanged')
    }

    if (typeof document === 'undefined' || prefersReducedMotion()) return apply()

    const body = document.querySelector('.page-body')
    if (!(body instanceof HTMLElement)) return apply()

    const html = document.documentElement
    const token = ++swapToken
    let done = false

    const up = () => {
      apply()

      // Not a timer: the DOM has to have the new words in it before the page
      // starts rising, and Vue paints them on a microtask. Removing the class
      // in the same tick would bring the page up still wearing the old text.
      nextTick(() => {
        // Only the newest press may raise the page. A second press while this
        // one is still down would otherwise have its own rise cancelled by a
        // listener that has already been answered.
        if (token === swapToken) html.classList.remove('is-lang-swap')
      })
    }

    const end = (event?: TransitionEvent) => {
      if (done) return
      // The bar is not in this, and neither is anything else on the page that
      // happens to be transitioning. Only the layer's own fade may answer.
      if (event && (event.target !== body || event.propertyName !== 'opacity')) return
      done = true
      body.removeEventListener('transitionend', end)
      clearTimeout(guard)
      up()
    }

    // The floor, not the clock. transitionend does not arrive when the fade
    // never ran — a page already at rest, a tab in the background — and a
    // switch that leaves the page down is a page gone for good.
    const guard = window.setTimeout(end, FADE_OUT + 120)

    body.addEventListener('transitionend', end)
    html.classList.add('is-lang-swap')
  }

  /**
   * Take the hint down.
   *
   * Filtered by animation name rather than left open: the button also carries
   * the theme's ripple, and a press there must not end the hint early.
   */
  const endFlash = (event?: AnimationEvent) => {
    if (event && event.animationName !== 'lang-flash') return
    flashing.value = false
  }

  /** Two languages: the other one is the only possible choice. */
  const toggleLang = () => setLang(picked.value === 'ru' ? 'en' : 'ru')

  return { lang, code, picked, locale, t, setLang, toggleLang, flashing, endFlash, status }
}

/** True when the reader has asked for less motion. Nothing here is animation,
 *  but the fade that hides the swap is, and it is the whole answer. */
function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
