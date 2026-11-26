<script setup lang="ts">

const { t } = useLang()
/**
 * Renders a release changelog body.
 *
 * The body arrives from the server already as plain text, and it is turned
 * into DOM nodes here rather than into an HTML string, so a release note can
 * never inject markup into the page.
 */

interface Group {
  heading: string | null
  paragraphs: string[]
  bullets: string[]
}

const props = defineProps<{ body: string }>()

const clean = (s: string) => s.replace(/\*\*/g, '').trim()

function parse(markdown: string): Group[] {
  const lines = String(markdown || '').replace(/\r/g, '').split('\n')
  const groups: Group[] = []
  let current: Group | null = null
  let lastBullet: string | null = null

  const group = (): Group => {
    if (!current) {
      current = { heading: null, paragraphs: [], bullets: [] }
      groups.push(current)
    }
    return current
  }

  for (const raw of lines) {
    const line = raw.trim()

    if (!line) {
      current = null
      lastBullet = null
      continue
    }

    const heading = /^#{1,6}\s+(.*)$/.exec(line)
    if (heading) {
      current = { heading: clean(heading[1]).replace(/:$/, ''), paragraphs: [], bullets: [] }
      groups.push(current)
      lastBullet = null
      continue
    }

    const bullet = /^[-*]\s+(.*)$/.exec(line)
    if (bullet) {
      const g = group()
      lastBullet = { group: g, index: g.bullets.push(clean(bullet[1])) - 1 }
      continue
    }

    // An indented line continues the bullet above it. The text has to be
    // written back into the array: appending to a local string would leave
    // the pushed copy untouched and silently drop the continuation.
    if (lastBullet !== null && /^\s{2,}\S/.test(raw)) {
      lastBullet.group.bullets[lastBullet.index] += ` ${clean(line)}`
      continue
    }

    group().paragraphs.push(clean(line))
    lastBullet = null
  }

  return groups.filter((g) => g.heading || g.paragraphs.length || g.bullets.length)
}

const groups = computed(() => parse(props.body))
</script>

<template>
  <div class="release-body">
    <template v-if="groups.length">
      <div v-for="(g, i) in groups" :key="i" class="release-group">
        <p v-if="g.heading"><strong>{{ g.heading }}:</strong></p>
        <p v-for="(p, j) in g.paragraphs" :key="`p${j}`">{{ p }}</p>
        <ul v-if="g.bullets.length">
          <li v-for="(b, j) in g.bullets" :key="`b${j}`" :style="{ '--li': j }">{{ b }}</li>
        </ul>
      </div>
    </template>
    <p v-else>{{ t('rel.noBody') }}</p>
  </div>
</template>