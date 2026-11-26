<script setup lang="ts">
import { useReleases, fmtDate, fmtSize } from '~/composables/useReleases'

/**
 * The whole site is this page: what it is, why to use it, every build, and
 * every changelog.
 *
 * It started as three pages. Merging them was the right call — a visitor
 * arrives wanting a download and leaves having to click through a menu to find
 * out whether the launcher suits them. One page, one scroll, no menus to read.
 *
 * The only anchor on it leads to the download section below. The platform switch
 * is a control rather than navigation and writes nothing to the URL, so the
 * address bar is the same whatever the visitor is looking at.
 *
 * Rendered on the server: the version, the download links, the file sizes and
 * the whole changelog are in the HTML the server sends.
 */

const { releases, latest } = await useReleases()

/** The language, and the function every sentence below goes through. */
const { t, locale } = useLang()

interface BuildCard {
  key: 'windows-setup' | 'windows-portable' | 'linux-appimage' | 'linux-portable'
  platform: string
  build: string
  kind: string
  secondary?: boolean
  asset?: { url: string; size: number; local?: string }
}

const version = computed(() => latest.value?.tag ?? '')


/**
 * Which platform this visitor is most likely on.
 *
 * Read from the request headers on the server, so the right builds are already
 * in the HTML the browser gets — no flash of the wrong platform, no second
 * request. Mobile browsers carry their platform in the UA, which is what makes
 * an iPhone land on "both, you pick" rather than being pushed at a Windows
 * installer.
 *
 * Deliberately conservative: anything unrecognised, including bots and curl,
 * gets the plain default rather than a wrong guess.
 */
const platform = useState('spiky:platform', () => {
  const ua = useRequestHeaders(['user-agent'])['user-agent'] ?? ''
  return detectPlatform(ua)
})

/**
 * The platform in view, and the choice the visitor made about it.
 *
 * It comes from the request's user agent, read on the server, so the first
 * paint is already the right one. A visitor who has chosen a platform before
 * carries it in a cookie, and the server reads that first: the page they get
 * is the page they chose, and there is no second render to get there.
 *
 * The choice is a cookie rather than localStorage for exactly that reason. In
 * localStorage the server could not see it, so every return visit began by
 * rendering the user agent's guess and then swapping to the remembered choice —
 * a visible change on the download cards, paid for nothing.
 *
 * The address bar is left alone: no ?p=, so a link handed over months ago
 * cannot put somebody on the wrong platform's build. A cookie is not a URL.
 */
const platformCookie = useCookie<string | null>(PLATFORM_COOKIE, {
  maxAge: 60 * 60 * 24 * 365,
  sameSite: 'lax',
  path: '/',
})

const selected = ref<'windows' | 'linux'>(
  normalizePlatform(platformCookie.value) ?? recommendedGroup(platform.value) ?? 'windows',
)

// Only on the client: writing the cookie on the server would send a Set-Cookie
// with every response, for a choice the request already carried.
if (import.meta.client) {
  watch(selected, (value) => { platformCookie.value = value })
}

const builds = computed(() => {
  const a = latest.value?.assets ?? {}
  return selected.value === 'windows'
    ? ([
        { key: 'windows-setup', platform: 'Windows', build: t('dl.cardSetup'), kind: 'EXE', asset: a.setup },
        { key: 'windows-portable', platform: 'Windows', build: t('dl.cardPortable'), kind: 'ZIP', secondary: true, asset: a.windowsPortable },
      ] as BuildCard[])
    : ([
        { key: 'linux-appimage', platform: 'Linux', build: 'AppImage', kind: 'AppImage', asset: a.appImage },
        { key: 'linux-portable', platform: 'Linux', build: t('dl.cardPortable'), kind: 'tar.gz', secondary: true, asset: a.linuxPortable },
      ] as BuildCard[])
})

const visible = computed(() => builds.value.filter((b) => b.asset))

/**
 * What the hero's one button does.
 *
 * It is the file, not a jump down the page. On a single page the only reason
 * to keep scrolling is to find something you did not see, and a person who came
 * to download should not have to. When the platform is unknown the primary
 * build is still there, so the button is always there.
 */
const primary = computed(() => visible.value.find((b) => !b.secondary) ?? visible.value[0])


const sorted = computed(() =>
  [...releases.value].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1)),
)

const tagClass = (index: number, prerelease: boolean) => {
  if (prerelease) return 'release-tag release-tag--prerelease'
  return index === 0 ? 'release-tag release-tag--latest' : 'release-tag release-tag--stable'
}

const tagLabel = (index: number, prerelease: boolean) => {
  if (prerelease) return t('rel.preview')
  return index === 0 ? t('rel.latest') : t('rel.stable')
}

/**
 * What separates SpikyMC from the launcher it was forked from.
 *
 * Seven claims the project stands behind: three unique to SpikyMC,
 * four inherited from Prism Launcher (which itself forked MultiMC).
 *
 * Deliberately short list. The things a person can see on the page — which
 * platforms there are, what each build is, how big it is — are not repeated here
 * a second time in prose; the section answers "why", and only "why".
 */
const FEATURES = computed(() => [
  {
    icon: 'i-shield',
    title: t('why.e1.title'),
    body: t('why.e1.body'),
  },
  {
    icon: 'i-box',
    title: t('why.e2.title'),
    body: t('why.e2.body'),
  },
  {
    icon: 'i-server',
    title: t('why.e3.title'),
    body: t('why.e3.body'),
  },
  {
    icon: 'i-box',
    title: t('why.e4.title'),
    body: t('why.e4.body'),
  },
  {
    icon: 'i-shield',
    title: t('why.e5.title'),
    body: t('why.e5.body'),
  },
  {
    icon: 'i-server',
    title: t('why.e6.title'),
    body: t('why.e6.body'),
  },
])

</script>

<template>
  <div class="page">
    <main>
      <!-- Hero -->
      <section class="hero">
        <div class="container">
          <div class="hero-icon rise" :style="{ '--i': 0 }">
            <svg class="ic ic--logo"><use href="#i-logo" /></svg>
          </div>
          <h1 id="heroTitle" class="hero-title rise" :style="{ '--i': 1 }">Spiky<span>MC</span></h1>
          <!-- Both lines said, in smaller type, what is written further down the
               page in larger type. The second one was very nearly a retelling of
               the cards in Why, which the reader reaches after scrolling past all
               of it. What is left is what this part actually has to say: what the
               thing is, and that the reasons come next. -->
          <p class="hero-lead rise" :style="{ '--i': 2 }">
            {{ t('hero.lead') }}
          </p>
          <div class="hero-cta rise" :style="{ '--i': 3 }">
            <!-- Leads to the builds rather than to a file. It used to be the
                 file, because a visitor comes here for a file and one click is
                 the right answer; that stopped being true when the source switch
                 went away and there is nothing left above the fold to decide.
                 Platform, build and mirror are all picked one screen down, and a
                 button that jumps there cannot be the wrong one. -->
            <a class="btn btn--lg st" href="#download">
              <svg class="ic"><use href="#i-dl" /></svg>
              {{ t('hero.cta') }}
            </a>
          </div>
        </div>
      </section>

      <!-- Why -->
      <section id="why" class="section-why">
        <div class="container">
          <div>
            <h2 class="section-title">{{ t('why.title') }}</h2>
            <p class="section-subtitle">{{ t('why.sub') }}</p>
          </div>

          <div class="feature-grid">
            <!-- Keyed by the icon, not by the title: the title is translated,
                 and a translated key is a different key on every switch, so Vue
                 tore the card down and built it again. The text had been on the
                 screen a moment before and would have jumped. The icon is the
                 same picture in every language, which is what a key has to be. -->
            <article
              v-for="f in FEATURES"
              :key="f.icon"
              class="feature-card card"
              :class="{ 'feature-card--wide': f.wide }"
            >
              <span class="feature-icon">
                <svg class="ic"><use :href="`#${f.icon}`" /></svg>
              </span>
              <!-- the wrapper is what lets the wide card lie down: without it
                   the heading and the text would sit side by side next to the
                   icon instead of stacked under it -->
              <div class="feature-text">
                <h3 class="feature-title">{{ f.title }}</h3>
                <p class="feature-body">{{ f.body }}</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <!-- Download: every build, for the platform you are on -->
      <!-- the one target on the page: the hero button and nothing else
           leads here -->
      <section id="download" class="section-download">
        <div class="container">
          <!-- Title and switch share a line: the heading says what the section
               is, the switch says which platform, and putting them apart made
               the eye travel down and back for a relationship that is already
               obvious. On a phone, where the two tabs are the full width, they
               stack rather than squeezing the heading into two words. -->
          <div class="section-head">
            <h2 class="section-title">{{ t('dl.title') }}</h2>
            <PlatformTabs v-model="selected" />
          </div>

          <Transition name="swap" mode="out-in">
            <div :key="selected" class="download-swap">
              <div class="download-list">
                <DownloadCard
                  v-for="card in visible"
                  :key="card.key"
                  :featured="!card.secondary"
                  :platform="card.platform"
                  :build="card.build"
                  :kind="card.kind"
                  :version="version"
                  :secondary="card.secondary"
                  :asset="card.asset"
                />
              </div>

              <!-- what the two builds actually mean, and the one step Linux
                   needs on top of them -->
              <div class="notes">
                <div v-if="selected === 'windows'" class="note card">
                  <h3 class="note-title">{{ t('dl.noteSetup') }}</h3>
                  <p class="note-body">{{ t('dl.noteSetupBody') }}</p>
                </div>
                <div v-if="selected === 'windows'" class="note card">
                  <h3 class="note-title">{{ t('dl.notePortable') }}</h3>
                  <p class="note-body">{{ t('dl.notePortableBody') }}</p>
                </div>
                <div v-if="selected === 'linux'" class="note card">
                  <h3 class="note-title">{{ t('dl.noteAppImage') }}</h3>
                  <p class="note-body">{{ t('dl.noteAppImageBody') }}</p>
                </div>
                <div v-if="selected === 'linux'" class="note card">
                  <h3 class="note-title">{{ t('dl.notePortable') }}</h3>
                  <p class="note-body">{{ t('dl.notePortableBodyLinux') }}</p>
                </div>

                <!-- Spans both columns, which is what note--wide is for. It sits
                     inside the grid because grid-column means nothing outside
                     one — and it gets air of its own on top, so the step after
                     downloading does not read as a third build. -->
                <div v-if="selected === 'linux'" class="note card note--wide">
                <h3 class="note-title">{{ t('dl.noteFirstRun') }}</h3>
                <pre class="note-code"><code>chmod +x SpikyMC-*.AppImage && ./SpikyMC-*.AppImage</code></pre>
                <p class="note-body">{{ t('dl.noteFirstRunBody') }}</p>
                </div>
              </div>

            </div>
          </Transition>
        </div>
      </section>

      <!-- Every release, with the full notes -->
      <section id="releases" class="section-releases">
        <div class="container">
          <div>
            <h2 class="section-title">{{ t('rel.title') }}</h2>
            <p class="section-subtitle">{{ t('rel.sub') }}</p>
          </div>

          <div class="release-list">
            <article
              v-for="(r, i) in sorted"
              :key="r.tag"
              class="release-card card"
            >
              <div class="release-header">
                <span class="release-version">{{ r.tag }}</span>
                <span class="release-date">{{ fmtDate(r.publishedAt, locale) }}</span>
                <span :class="tagClass(i, r.prerelease)">{{ tagLabel(i, r.prerelease) }}</span>
              </div>
              <ReleaseBody :body="r.body" />
              <!--
                Only the notes and the upstream link. Downloading happens in the
                Download section, which is where the current release is; a
                second download control next to a changelog says two things are
                the way in, and only one of them is.
              -->
              <div class="release-actions">
                <a class="btn btn--tonal st" :href="r.url" rel="noopener">
                  <svg class="ic"><use href="#i-ext" /></svg>
                  {{ t('rel.view') }}
                </a>
              </div>
            </article>

            <p v-if="!sorted.length" class="status">{{ t('rel.empty') }}</p>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>