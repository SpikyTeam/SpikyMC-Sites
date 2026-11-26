<script setup lang="ts">

const { t } = useLang()
/**
 * One build: which platform it is for, what it is, how big, and the link.
 *
 * Split out because the download section renders the same card in two places:
 * the recommended build above the fold and the rest behind the toggle.
 */

interface Asset {
  url: string
  size: number
  /** the same file on our own server, when it is verifiably complete */
  local?: string
}

const props = defineProps<{
  platform: string
  build: string
  kind: string
  /** the release tag this file belongs to */
  version?: string
  secondary?: boolean
  asset?: Asset
  /** the one the visitor was recognised as; drawn a size up */
  featured?: boolean
}>()

/**
 * The two brand marks, served from the site root: /windows.svg and
 * /linux.svg.
 *
 * They are files rather than inline SVG so they can be used from anywhere —
 * the README, another project, a post — without copying the path data around
 * a second time. Both carry literal colours, so <img> fits them and <use>
 * would not: a symbol would be forced onto currentColor and the penguin would
 * turn into a grey blob.
 */
const isWindows = computed(() => props.platform === 'Windows')

/**
 * The version suffix is not decoration. These two files are cached for a
 * month, which is right for a static mark and wrong the moment one of them
 * changes: a browser inside max-age never asks again, and a broken build
 * stays on screen for weeks. Bumping this is how a change reaches people who
 * already have the page cached.
 */
const MARK_VERSION = 'v2'

const mark = computed(() =>
  isWindows.value
    ? `/windows.svg?${MARK_VERSION}`
    : `/linux.svg?${MARK_VERSION}`,
)

/** Tux is black, and so is the dark theme. Without a plate it disappears. */
const plate = computed(() => (isWindows.value ? null : 'download-card-icon--plate'))

/** 22.8 MB → "22.8", so the unit can be typeset smaller next to the number. */
const size = computed(() => {
  const bytes = props.asset?.size
  if (bytes === undefined) return null
  return (bytes / 1048576).toFixed(1)
})

/**
 * Where this particular build actually goes.
 *
 * Our copy is the destination, full stop — there is no longer a switch to
 * turn. What is left is the one case that has to keep working: a release
 * published moments ago has not been mirrored yet, and a button pointing at a
 * file that is not there yet is a dead button. So `a.local` decides, and it is
 * only ever set after the mirrored file's size has been checked against the
 * release — meaning its absence means "not here yet", not "unknown".
 */
const target = computed(() => {
  const a = props.asset
  if (!a) return null
  const useLocal = !!a.local
  return { href: (useLocal ? a.local : a.url) as string, fromLocal: !!useLocal }
})
</script>

<template>
  <div class="download-card card" :class="{ 'download-card--featured': featured }">
    <div class="download-card-head">
      <span class="download-card-icon" :class="plate" aria-hidden="true">
        <img :src="mark" alt="" loading="lazy" decoding="async" />
      </span>
      <span class="download-card-meta">
        <span class="platform">{{ platform }}</span>
        <span class="build-name">{{ build }}</span>
      </span>
    </div>

    <!-- One line of everything that is known without opening the file: which
         release it is, what is inside, how big. The version leads because it is
         the only part of it that answers "is this the one I want". -->
    <span class="file-size">
      <template v-if="asset && size">
        <template v-if="version">
          <span class="file-version">{{ version }}</span>
          <span class="file-dot" aria-hidden="true">·</span>
        </template>
        <span class="file-kind">{{ kind }}</span>
        <span class="file-dot" aria-hidden="true">·</span>
        <span class="file-mb">{{ size }}</span>
        <span class="file-unit">MB</span>
      </template>
      <template v-else>{{ kind }}</template>
    </span>

    <a
      v-if="asset && target"
      class="btn download-link st"
      :class="{ 'btn--secondary': secondary }"
      :href="target.href"
      :data-from="target.fromLocal ? 'local' : 'github'"
    >
      <svg class="ic"><use href="#i-dl" /></svg>
      <span class="download-link-label">{{ t('dl.download') }}</span>
    </a>
    <span v-else class="btn download-link is-disabled" aria-disabled="true">
      {{ t('dl.noBuild') }}
    </span>
  </div>
</template>