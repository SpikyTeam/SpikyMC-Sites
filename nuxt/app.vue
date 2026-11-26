<script setup lang="ts">
import '~/assets/fonts.css'
import '~/assets/page.css'

/**
 * The language in view, and the two strings the browser chrome needs.
 *
 * A cookie rather than localStorage, unlike the theme: the server has to
 * render the visitor's language into the HTML it sends, or every load of a
 * Russian page would paint English first and swap after hydration. See
 * composables/useLang.ts.
 */
// `flashing` — не украшение: без него :class на кнопке читает undefined,
// класс is-flash не появляется никогда, и подсказка молчит. Именно так она и
// молчала, пока переменную забыли забрать отсюда.
const { lang, code, t, toggleLang, flashing, endFlash, status } = useLang()

/**
 * The title and the description follow the language too.
 *
 * They are written here rather than left in nuxt.config, where they would
 * stay English for every visitor: unhead matches meta by name and title by
 * slot, so this replaces the configured pair instead of adding a second one.
 */
useHead(() => ({
  htmlAttrs: { lang: lang.value },
  title: t('meta.title'),
  meta: [{ name: 'description', content: t('meta.description') }],
}))

/**
 * Chrome around the page: the sticky nav and the theme button.
 *
 * The button is a plain element with a data attribute rather than a reactive
 * component: swapping the theme is not state the Vue tree needs to know
 * about, and keeping it out means no re-render and no watcher. The click is
 * handled by the enhancement layer (plugins/enhance.client.ts), which also
 * runs after hydration.
 *
 * The two in-page links become real routes off the home page: "Download"
 * pointed at a #download anchor that does not exist here.
 */

/* One page means nothing to navigate between, so the menu is only ever the
   places that are not here: the source and the wiki. Internal sections need no
   entries — there is nowhere else to go.

   Both are icon buttons. The wording stays in the markup, hidden from sight but
   not from a screen reader: a book glyph says nothing about where the link goes,
   and neither does a GitHub mark to anyone who does not know it. */
const NAV_LINKS = [
  { href: 'https://github.com/SpikyTeam/SpikyMC', label: 'GitHub', icon: 'i-github', external: true },
  { href: '/wiki', label: 'Wiki', icon: 'i-wiki' },
]
</script>

<template>
  <div>
    <!-- the sprite is in the SSR markup too, so icons render before JS -->
    <svg xmlns="http://www.w3.org/2000/svg" class="sprite" aria-hidden="true">
      <defs>
        <symbol id="i-logo" viewBox="0 0 48 48">
          <rect width="44" height="44" transform="translate(2 2)" rx="14" ry="14" fill="#52A535" />
          <path d="M21.389 20.0556C21.389 23.0031 18.9916 25.3925 16.0343 25.3925C13.077 25.3925 10.6797 23.0031 10.6797 20.0556C10.6797 17.1081 13.077 14.7188 16.0343 14.7188C18.9916 14.7188 21.389 17.1081 21.389 20.0556Z" fill="#80D05D" />
          <path d="M37.2344 20.0556C37.2344 23.0031 34.837 25.3925 31.8797 25.3925C28.9224 25.3925 26.5251 23.0031 26.5251 20.0556C26.5251 17.1081 28.9224 14.7188 31.8797 14.7188C34.837 14.7188 37.2344 17.1081 37.2344 20.0556Z" fill="#80D05D" />
          <path d="M16.3622 30.0758C16.3622 32.6353 18.657 34.378 21.3344 34.8136C22.3725 35.0859 24.2849 35.227 26.6344 34.8136C28.4921 34.4869 31.5519 32.7987 31.5519 30.0758C31.5519 27.7299 29.3117 25.0113 26.6344 25.8281C23.957 26.645 23.957 26.645 21.3344 25.8281C18.7117 25.0113 16.1436 27.6797 16.3622 30.0758Z" fill="#80D05D" />
          <path d="M21.389 18.7665C21.389 21.714 18.9916 24.1034 16.0343 24.1034C13.077 24.1034 10.6797 21.714 10.6797 18.7665C10.6797 15.8191 13.077 13.4297 16.0343 13.4297C18.9916 13.4297 21.389 15.8191 21.389 18.7665Z" fill="#2A641C" />
          <path d="M37.2344 18.7665C37.2344 21.714 34.837 24.1034 31.8797 24.1034C28.9224 24.1034 26.5251 21.714 26.5251 18.7665C26.5251 15.8191 28.9224 13.4297 31.8797 13.4297C34.837 13.4297 37.2344 15.8191 37.2344 18.7665Z" fill="#2A641C" />
          <path d="M16.3622 28.7868C16.3622 31.3463 18.657 33.0889 21.3344 33.5246C22.3725 33.7969 24.2849 33.9379 26.6344 33.5246C28.4921 33.1978 31.5519 31.5096 31.5519 28.7868C31.5519 26.4408 29.3117 23.7222 26.6344 24.5391C23.957 25.3559 23.957 25.3559 21.3344 24.5391C18.7117 23.7222 16.1436 26.3906 16.3622 28.7868Z" fill="#2A641C" />
          <path d="M21.389 19.1962C21.389 22.1437 18.9916 24.5331 16.0343 24.5331C13.077 24.5331 10.6797 22.1437 10.6797 19.1962C10.6797 16.2488 13.077 13.8594 16.0343 13.8594C18.9916 13.8594 21.389 16.2488 21.389 19.1962Z" fill="black" />
          <path d="M37.2344 19.1962C37.2344 22.1437 34.837 24.5331 31.8797 24.5331C28.9224 24.5331 26.5251 22.1437 26.5251 19.1962C26.5251 16.2488 28.9224 13.8594 31.8797 13.8594C34.837 13.8594 37.2344 16.2488 37.2344 19.1962Z" fill="black" />
          <path d="M16.3622 29.2165C16.3622 31.776 18.657 33.5186 21.3344 33.9543C22.3725 34.2266 24.2849 34.3676 26.6344 33.9543C28.4921 33.6275 31.5519 31.9393 31.5519 29.2165C31.5519 26.8705 29.3117 24.1519 26.6344 24.9687C23.957 25.7856 23.957 25.7856 21.3344 24.9687C18.7117 24.1519 16.1436 26.8203 16.3622 29.2165Z" fill="black" />
        </symbol>
        <symbol id="i-dl" viewBox="0 0 24 24">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </symbol>
        <symbol id="i-ext" viewBox="0 0 24 24">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </symbol>
        <symbol id="i-shield" viewBox="0 0 24 24">
          <path d="M12 2.7 19 5.6v5.6c0 4.4-2.9 8.4-7 9.7-4.1-1.3-7-5.3-7-9.7V5.6l7-2.9Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
          <path d="m8.8 11.8 2.2 2.2 4.2-4.4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </symbol>
        <symbol id="i-box" viewBox="0 0 24 24">
          <path d="m12 2.9 8.6 4.4v9.4L12 21.1l-8.6-4.4V7.3L12 2.9Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
          <path d="m3.4 7.3 8.6 4.4 8.6-4.4M12 21.1v-9.4" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
        </symbol>
        <symbol id="i-server" viewBox="0 0 24 24">
          <rect x="3" y="3.4" width="18" height="7" rx="2" fill="none" stroke="currentColor" stroke-width="2" />
          <rect x="3" y="13.6" width="18" height="7" rx="2" fill="none" stroke="currentColor" stroke-width="2" />
          <path d="M6.8 6.9h.01M6.8 17.1h.01" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" />
        </symbol>
        <!-- The GitHub mark, at its own 16-unit grid so the curves are not
             resampled: .ic paints it with fill:currentColor. -->
        <symbol id="i-github" viewBox="0 0 16 16">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.65 7.65 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
        </symbol>
        <!-- An open book: two pages meeting at a spine, so it reads as a
             reference rather than as a generic document. -->
        <symbol id="i-wiki" viewBox="0 0 24 24">
          <path d="M12 6.5C10.6 5.2 8.8 4.5 6.8 4.5H4v14h2.8c2 0 3.8.7 5.2 2V6.5Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
          <path d="M20 4.5h-2.8c-2 0-3.8.7-5.2 2v14c1.4-1.3 3.2-2 5.2-2H20v-14Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
        </symbol>
        <symbol id="i-sun" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="2" />
          <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </symbol>
        <symbol id="i-moon" viewBox="0 0 24 24">
          <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
        </symbol>
        <!-- A globe: the limb, the equator and both meridians. Drawn rather
             than a letter in a circle, because the letter is what it would
             become the moment the language is chosen. -->
        <symbol id="i-globe" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2" />
          <path d="M3 12h18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          <path d="M12 3c2.6 3 2.6 15 0 18M12 3c-2.6 3-2.6 15 0 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </symbol>
      </defs>
    </svg>

    <header class="nav" id="nav">
      <!-- The bar's fill, behind everything in it. Its opacity is written from
           the scroll handler; being its own layer is what keeps that from
           repainting the bar. -->
      <span class="nav-fill" aria-hidden="true"></span>
      <div class="nav-inner">

        <!-- Left group: GitHub and Wiki. -->
        <div class="nav-left">
          <ul class="nav-links">
            <li v-for="link in NAV_LINKS" :key="link.href">
              <a
                class="st nav-link--icon"
                :href="link.href"
                :title="link.label"
                :rel="link.external ? 'noopener' : undefined"
                :target="link.external ? '_blank' : undefined"
              >
                <svg class="ic" aria-hidden="true"><use :href="`#${link.icon}`" /></svg>
                <span class="visually-hidden">{{ link.label }}</span>
              </a>
            </li>
          </ul>
        </div>

        <!-- Right group: theme and language controls. -->
        <div class="nav-right">
          <button
            id="themeBtn"
            class="theme-btn st"
            type="button"
            :title="t('nav.themeLabel')"
            :aria-label="t('nav.themeLabel')"
            aria-pressed="false"
          >
            <!-- The ripple is added by the enhancement layer at the point of
                 the click. Empty here, so the button is the same shape with or
                 without a script. -->
            <svg class="ic theme-icon--sun"><use href="#i-sun" /></svg>
            <svg class="ic theme-icon--moon"><use href="#i-moon" /></svg>
          </button>

          <!-- To the right of the theme button, and anchored off the same base:
               the word's half-width, one gap, the theme button's own width, and
               the small gap that pairs two controls together.

               On a press the globe turns aside and out, the language that was
               just set stands in its place for a moment, and the globe comes
               back. The code is a report rather than a promise: "RU" after the
               press, not "EN" before it.

               The globe is what the control looks like when nobody is pressing
               it, which is why it is the thing that returns. A button that
               cannot be recognised between presses is a button nobody knows
               what they pressed. -->
          <button
            id="langBtn"
            class="lang-btn st"
            type="button"
            :class="{ 'is-flash': flashing }"
            :title="t('nav.langLabel')"
            :aria-label="t('nav.langLabel')"
            @click="toggleLang"
            @animationend="endFlash"
          >
            <!-- Ключ по языку — не для списка, а чтобы движение начиналось
                 заново на каждом нажатии. Анимация запускается классом, класс
                 снимается в animationend; второе нажатие внутри тех же 1.6 с не
                 меняло бы в разметке ничего, и подсказка не перезапустилась бы.
                 Смена языка туда-обратно — ровно этот случай. Ключ меняется
                 вместе с языком, и Vue пересоздаёт оба элемента. -->
            <svg :key="lang" class="ic" aria-hidden="true"><use href="#i-globe" /></svg>
            <!-- Не скрыт от чтения: это установленный язык, а не украшение, и без
                 него кнопка не сказала бы, что нажатие сделало. -->
            <span :key="lang" class="lang-code">{{ code }}</span>
          </button>
        </div>
      </div>
    </header>

    <!-- The flying word starts at the hero title and docks in the centre of
         the bar on scroll. It is a sibling of the header (not inside it), so
         fixed positioning lands it against the viewport and the word never
         gets clipped by the bar. -->
    <span class="fly-title" id="flyTitle" aria-hidden="true">Spiky<span>MC</span></span>

    <!-- Everything that speaks. The bar stays where it is: it carries the
         brand and three round buttons, none of which changes with the
         language, and taking it down too would read as the page going away
         rather than as the words changing. -->
    <div class="page-body">
      <NuxtPage />
    </div>

    <!-- The switch changes every word on the page and says nothing about it.
         This says it, once, in the language the reader is now in. Hidden from
         sight and not from a screen reader. -->
    <p v-if="status" class="visually-hidden" role="status">{{ status }}</p>
  </div>
</template>