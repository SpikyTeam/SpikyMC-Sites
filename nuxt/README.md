# Nuxt sources for mc.spiky.team

The landing page at <https://mc.spiky.team/> is this Nuxt app, prerendered to
static HTML by `SpikyTeam/mc.spiky.team`. Before the page is generated the
workflow runs `fetch-releases.mjs`, which writes `data/releases.json` — the only
thing the page reads for releases, so nothing calls GitHub from a visitor's
browser and no server is needed at request time.

- `data/releases.json` is generated; commit it and a build works offline.
- `fetch-releases.mjs` keeps the previous file when the GitHub API is down.
- `mirror/<tag>/<file>` marks an asset as available from this origin when its
  size matches; absent means the button points at GitHub.

Edit the page here, not on a server. Pushes to `SpikyMC-Sites` rebuild
`mc.spiky.team` through the `nuxt-dist` workflow of that repository.
