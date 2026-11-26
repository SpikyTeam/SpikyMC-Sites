/**
 * Progressive enhancement, loaded after hydration.
 *
 * The server already rendered the whole page, so nothing here is needed to
 * read it. Three things remain: the stored theme, the flight of the word into
 * the bar, and the press circle on the two buttons. Content is not animated
 * as it is read and the document is not watched for changes.
 */

import { resolveTheme, setThemeColor, THEME_KEY } from './theme'

let initialised = false

export function initEnhancements() {
  if (typeof document === 'undefined') return
  if (initialised) return
  initialised = true
  document.documentElement.dataset.enhanced = '1'

  applyStoredTheme()
  setupAppBar()
}

export function enhancePage() {
  if (typeof document === 'undefined' || !initialised) return
  setupAppBar()
}

/* ── theme ─────────────────────────────────────────────────────────────── */

function applyStoredTheme() {
  const theme = resolveTheme()
  const html = document.documentElement
  if (html.dataset.theme === theme) return

  html.dataset.theme = theme
  setThemeColor(theme)
}

export function themeOrigin(
  rect: { left: number; top: number; width: number; height: number },
  viewport: { width: number; height: number },
  at?: { x: number; y: number },
): { x: number; y: number; r: number } {
  const x = at?.x ?? rect.left + rect.width / 2
  const y = at?.y ?? rect.top + rect.height / 2
  const { width, height } = viewport
  const r = Math.max(
    Math.hypot(x, y),
    Math.hypot(width - x, y),
    Math.hypot(x, height - y),
    Math.hypot(width - x, height - y),
  )
  return { x, y, r }
}

function pressPoint(
  btn: Element,
  event?: Event,
): { x: number; y: number } | undefined {
  const ev = event as MouseEvent | undefined
  if (typeof ev?.clientX !== 'number' || typeof ev?.clientY !== 'number') return undefined
  const rect = btn.getBoundingClientRect()
  const sx = (btn as HTMLElement).offsetWidth / rect.width || 1
  const sy = (btn as HTMLElement).offsetHeight / rect.height || 1
  return {
    x: rect.left + (ev.clientX - rect.left) * sx,
    y: rect.top + (ev.clientY - rect.top) * sy,
  }
}

function setThemeOrigin(btn: Element | null, event?: Event) {
  if (!btn) return
  const { x, y, r } = themeOrigin(
    btn.getBoundingClientRect(),
    { width: window.innerWidth, height: window.innerHeight },
    pressPoint(btn, event),
  )
  const html = document.documentElement
  html.style.setProperty('--theme-x', `${Math.round(x)}px`)
  html.style.setProperty('--theme-y', `${Math.round(y)}px`)
  html.style.setProperty('--theme-r', `${Math.round(r)}px`)
}

export function toggleTheme(event?: Event) {
  const html = document.documentElement
  const next = html.dataset.theme === 'light' ? 'dark' : 'light'
  const button = document.querySelector('#themeBtn')

  const apply = () => {
    html.dataset.theme = next
    setThemeColor(next)
    try {
      localStorage.setItem(THEME_KEY, next)
    } catch {
      /* ignore */
    }
    button?.setAttribute('aria-pressed', String(next === 'dark'))
  }

  const view = document as Document & {
    startViewTransition?: (cb: () => void) => { finished: Promise<void> }
  }

  // A full-viewport snapshot is what makes a phone's address bar hide and show
  // mid-transition, and a fixed header jumps with it. The animation only runs
  // where there is a hover-capable pointer: on a touch screen the theme
  // changes at once, which is what the reader expects there anyway.
  const canAnimate = !!view.startViewTransition
    && !prefersReducedMotion()
    && window.matchMedia('(hover: hover)').matches

  if (canAnimate) {
    setThemeOrigin(button, event)
    view.startViewTransition(apply)
  } else {
    apply()
  }
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/* ── ripple on the theme button ──────────────────────────────────────────── */

export function ripple(btn: HTMLElement, event?: Event): void {
  if (prefersReducedMotion()) return

  const rect = btn.getBoundingClientRect()
  const point = pressPoint(btn, event)

  const from = point ?? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
  const R =
    Math.max(
      Math.hypot(from.x - rect.left, from.y - rect.top),
      Math.hypot(rect.right - from.x, from.y - rect.top),
      Math.hypot(from.x - rect.left, rect.bottom - from.y),
      Math.hypot(rect.right - from.x, rect.bottom - from.y),
    ) * 1.05

  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2

  const el = document.createElement('span')
  el.className = 'theme-ripple is-rippling'
  el.style.cssText =
    `left:${cx - R}px;top:${cy - R}px;` +
    `width:${2 * R}px;height:${2 * R}px`
  btn.appendChild(el)

  const dx = (from.x - cx).toFixed(1)
  const dy = (from.y - cy).toFixed(1)

  const anim = el.animate(
    [
      { transform: `translate(${dx}px, ${dy}px) scale(.08)` },
      { transform: 'translate(0, 0) scale(1)' },
    ],
    {
      duration: Math.min(480, 210 + R * 0.85),
      easing: 'cubic-bezier(.2, 0, 0, 1)',
      fill: 'forwards',
    },
  )

  anim.onfinish = () => el.remove()
  window.setTimeout(() => el.remove(), 900)
}

/* ── the collapsing bar ──────────────────────────────────────────────────── */

interface BarPlan {
  x0: number
  y0: number
  x1: number
  yDock: number
  travel: number
}

const SLIDE_DELAY = 0.35

let barPlan: BarPlan | null = null
let barEl: HTMLElement | null = null
let barTitle: HTMLElement | null = null
let barFill: HTMLElement | null = null
let lastE = -1
let barTicking = false
let barBound = false

function measureBar(): BarPlan | null {
  if (!barEl || !barTitle) return null

  const hero = document.querySelector<HTMLElement>('#heroTitle')
  hero?.getAnimations?.().forEach((a) => {
    if (a.playState !== 'finished') a.finish()
  })

  const barH = barEl.getBoundingClientRect().height
  const viewW = document.documentElement.clientWidth || window.innerWidth
  const textW = barTitle.offsetWidth
  const x1 = (viewW - textW) / 2

  document.documentElement.style.setProperty(
    '--nav-half',
    `${(textW / 2).toFixed(1)}px`,
  )

  const lh = parseFloat(getComputedStyle(barTitle).lineHeight) || 24
  const yDock = (barH - lh) / 2

  // Try to get hero metrics; if not ready, fall back to top-of-page approximation
  let x0 = viewW / 2
  let y0 = 0
  const h = document.querySelector<HTMLElement>('#heroTitle')
  if (h) {
    h.getAnimations?.().forEach((a) => {
      if (a.playState !== 'finished') a.finish()
    })
    const head = h.getBoundingClientRect()
    const fs = parseFloat(getComputedStyle(h).fontSize)
    if (head.width && head.height && fs) {
      x0 = head.left + (head.width - textW) / 2
      y0 = head.top + window.scrollY
    }
  }

  return { x0, y0, x1, yDock, travel: 0 }
}

function setupAppBar() {
  const nav = document.querySelector<HTMLElement>('.nav')
  const title = document.querySelector<HTMLElement>('#flyTitle')
  const fill = document.querySelector<HTMLElement>('.nav-fill')
  if (!nav || !title || !fill) return

  barEl = nav
  barTitle = title
  barFill = fill

  if (prefersReducedMotion()) return

  const compositor = typeof CSS !== 'undefined'
    && typeof CSS.supports === 'function'
    && CSS.supports('animation-timeline', 'scroll()')

  const apply = () => {
    const plan = measureBar()
    if (!plan) return
    plan.travel = Math.max(1, plan.y0 - plan.yDock)
    barPlan = plan
    lastE = -1

    if (compositor) writeFlight(plan)
    else renderBar()
  }

  apply()

  let resizing = false
  window.addEventListener('resize', () => {
    if (resizing) return
    resizing = true
    requestAnimationFrame(() => {
      resizing = false
      apply()
    })
  }, { passive: true })
  document.fonts?.ready.then(apply)

  if (!compositor && !barBound) {
    barBound = true
    window.addEventListener('scroll', onBarScroll, { passive: true })
  }
  document.documentElement.classList.add('has-flight')
}

function writeFlight(plan: BarPlan) {
  const root = document.documentElement
  const range = Math.max(1, root.scrollHeight - root.clientHeight)
  const end = ((plan.travel / range) * 100).toFixed(3)

  root.style.setProperty('--x0', `${plan.x0.toFixed(2)}px`)
  root.style.setProperty('--y0', `${plan.y0.toFixed(2)}px`)
  root.style.setProperty('--x1', `${plan.x1.toFixed(2)}px`)
  root.style.setProperty('--yDock', `${plan.yDock.toFixed(2)}px`)
  root.style.setProperty('--fly-end', `${end}%`)

  const span = `0% ${end}%`
  barTitle?.style.setProperty('animation-range', span)
  barFill?.style.setProperty('animation-range', span)
}

function onBarScroll() {
  if (barTicking) return
  barTicking = true
  requestAnimationFrame(renderBar)
}

function renderBar() {
  barTicking = false
  const plan = barPlan
  if (!plan || !barTitle || !barEl || !barFill) return

  const scroll = window.scrollY
  const travel = plan.travel

  const startAt = travel * SLIDE_DELAY
  const q = Math.min(1, Math.max(0, (scroll - startAt) / (travel - startAt || 1)))
  const e = q * q * (3 - 2 * q)

  if (e === lastE) return
  lastE = e

  const x = plan.x0 + (plan.x1 - plan.x0) * e
  const y = Math.max(plan.yDock, plan.y0 - scroll)

  barTitle.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`
  barFill.style.opacity = e.toFixed(3)
}
