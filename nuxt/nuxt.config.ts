// Nuxt config for the SpikyMC site.
//
// The site is server-rendered by Nuxt and served by nginx through a reverse
// proxy. Only the landing page is rendered here; the launcher's data trees
// (meta/v1, i18n, wiki, fmllibs, maven) are plain files on disk that nginx
// serves itself, so they never pass through Node/Bun.

export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  ssr: true,
  telemetry: false,
  devtools: { enabled: false },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'SpikyMC вЂ” Custom Minecraft Launcher',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        {
          name: 'description',
          content:
            'SpikyMC is a custom Minecraft launcher that lets you easily manage multiple Minecraft installations at once. Download for Windows and Linux.',
        },
        // the server has no way to know the visitor's theme and renders dark;
        // the inline script below corrects this before the first paint
        { name: 'theme-color', content: '#0f140e' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'SpikyMC' },
        { property: 'og:title', content: 'SpikyMC вЂ” Custom Minecraft Launcher' },
        {
          property: 'og:description',
          content: 'A custom Minecraft launcher for managing multiple installations at once.',
        },
        { property: 'og:url', content: 'https://mc.spiky.team/' },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
      script: [
        {
          /**
           * Runs before the first paint, which is the entire point.
           *
           * The theme used to be applied from an idle callback after
           * hydration, so every load began dark and then flipped: a flash for
           * anyone whose stored theme was light, and a dark page for anyone
           * whose operating system is light вЂ” because prefers-color-scheme was
           * never consulted at all. An inline head script is parser-blocking,
           * so it has run before a pixel exists to be wrong about.
           *
           * Self-contained by necessity: it cannot import, and it cannot wait
           * for hydration. The colours must match THEME_COLOR in utils/theme
           * and --bg in page.css; test-theme.cjs fails if they stop matching.
           */
          innerHTML:
            '(function(){try{' +
            'var s=localStorage.getItem("spiky-theme");' +
            'var t=(s==="light"||s==="dark")?s:(matchMedia("(prefers-color-scheme: light)").matches?"light":"dark");' +
            'document.documentElement.setAttribute("data-theme",t);' +
            'var m=document.querySelector(\'meta[name="theme-color"]\')||function(){var n=document.createElement("meta");' +
            'n.setAttribute("name","theme-color");document.head.appendChild(n);return n;}();' +
            'm.setAttribute("content",t==="light"?"#f6faf3":"#0f140e");' +
            '}catch(e){}})()',
          tagPosition: 'head',
        },
      ],
      link: [
        { rel: 'canonical', href: 'https://mc.spiky.team/' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        // The two faces the first screen needs, fetched next to the HTML.
        // They are local now (see assets/fonts.css), immutable, and small
        // after subsetting, so preloading them costs nothing and removes the
        // last thing that could hold up the first paint.
        {
          rel: 'preload',
          as: 'font',
          type: 'font/woff2',
          href: '/fonts/onest-latin.woff2',
          crossorigin: '',
        },
        {
          rel: 'preload',
          as: 'font',
          type: 'font/woff2',
          href: '/fonts/unbounded-latin.woff2',
          crossorigin: '',
        },
      ],
    },
  },

  // The site is a static build, prerendered at publish time and served by
  // GitHub Pages: there is no server at request time. Everything the page
  // needs is in the HTML nuxt generate writes.
  nitro: {
    prerender: {
      // the page links to trees Pages serves itself (wiki, i18n), so only
      // routes that are nuxt pages are prerendered
      crawlLinks: false,
      routes: ['/'],
      failOnError: true,
    },
  },

  runtimeConfig: {
    public: {
      siteUrl: 'https://mc.spiky.team/',
    },
  },

})