<script setup lang="ts">

const { t } = useLang()
/**
 * The Windows / Linux switch, shared by the download page and each release.
 *
 * A pill that slides between the two tabs rather than two backgrounds fading
 * in and out: a segmented control reads as one object moving between two
 * places, and that is what a finger pressing it expects to see.
 *
 * These are buttons, not links. There is one page, so a platform is a choice
 * about what to look at rather than a place to go — and an href here would
 * have been a link to this same page wearing a costume.
 *
 * They used to also write the choice into ?p=, which quietly turned them into
 * navigation: every switch called router.replace() with no hash in it, so it
 * discarded the #download the hero button had just scrolled to and moved the
 * router's scroll position with it. The page remembers the choice now; this
 * control only emits.
 */

const props = defineProps<{
  modelValue: 'windows' | 'linux'
}>()

const emit = defineEmits<{ 'update:modelValue': [value: 'windows' | 'linux'] }>()

const PLATFORMS = [
  { key: 'windows' as const, title: 'Windows', mark: '/windows.svg' },
  { key: 'linux' as const, title: 'Linux', mark: '/linux.svg' },
]

const index = computed(() => PLATFORMS.findIndex((p) => p.key === props.modelValue))

function choose(key: 'windows' | 'linux') {
  if (key === props.modelValue) return
  emit('update:modelValue', key)
}
</script>

<template>
  <nav class="platform-tabs" :aria-label="t('tabs.label')">
    <span class="platform-tabs-pill" :style="{ '--i': index }" aria-hidden="true" />
    <button
      v-for="p in PLATFORMS"
      :key="p.key"
      type="button"
      class="platform-tab"
      :class="{ 'is-on': p.key === modelValue }"

      @click="choose(p.key)"
    >
      <img
        class="platform-tab-mark"
        :src="`${p.mark}?v2`"
        alt=""
        width="15"
        height="15"
        loading="lazy"
        decoding="async"
      />
      {{ p.title }}
    </button>
  </nav>
</template>