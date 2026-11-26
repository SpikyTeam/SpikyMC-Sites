# SpikyMC-Sites

Everything the public Spiky Team sites are built from, except the launcher
metadata itself.

| path | published at |
|---|---|
| `site/index.html` | `https://mc.spiky.team/` |
| `wiki/` | `https://mc.spiky.team/wiki/` |
| `i18n/` | `https://mc.spiky.team/i18n/` |
| `maven/` | `https://mc.spiky.team/maven/` |
| `fmllibs/` | `https://mc.spiky.team/fmllibs/` |
| `successful-login/` | `https://mc.spiky.team/successful-login/` |
| `downloads.json` | checksums of the mirrored release assets |
| `spiky/` | published repo `spiky.team` |
| `shock/` | published repo `shock.spiky.team` |

## Related repositories

| repository | role |
|---|---|
| [`mc.spiky.team`](../mc.spiky.team) | assembles and publishes the site |
| [`spiky-meta`](../spiky-meta) | regenerates the launcher metadata daily |
| [`spiky-meta-staging`](../spiky-meta-staging) | receives the generated metadata and publishes it as `meta-v1.zip` |
| [`spiky.team`](../spiky.team) | landing page, built from `spiky/` here |
| [`shock.spiky.team`](../shock.spiky.team) | personal page, built from `shock/` here |

## Workflows here

- `sync-i18n.yml` — daily at 04:23 UTC, runs `infra/i18n/i18n_sync.py` from
  SpikyMC against `i18n/`, commits the result and republishes the site.
- `downloads.yml` — on release, records the new assets in `downloads.json`.

`PUBLISH_TOKEN` is a fine-grained personal access token with *Contents: read
and write* on the SpikyTeam repositories: it is what lets these workflows
start builds in the other repos and download release assets.
