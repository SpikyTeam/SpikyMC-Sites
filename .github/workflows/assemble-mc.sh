set -euo pipefail
# Assemble mc.spiky.team: the prerendered landing page from gh-pages, the
# launcher's data trees from SpikyMC-Sites, the metadata bundle from its
# release asset.
site=$1
sources=$2
out=$3

mkdir -p "$out"
cp -a "$site"/. "$out"/
rm -rf "$out"/.git "$out"/wiki "$out"/i18n "$out"/maven "$out"/fmllibs \
       "$out"/successful-login "$out"/meta

for d in wiki i18n maven fmllibs successful-login; do
  cp -a "$sources/$d" "$out/$d"
done

# the metadata bundle is too big for git; the release asset carries it
meta="${META_REPO:-SpikyTeam/spiky-meta-staging}"
curl -fsSL --retry 3 \
  "https://github.com/$meta/releases/download/meta/meta-v1.zip" -o meta.zip
unzip -q -o meta.zip -d "$out"
rm -f meta.zip
# the bundle holds index.json + v1/, but the site serves them under /meta/
if [ ! -d "$out/meta" ]; then
  mkdir -p "$out/meta"
  for e in index.json v1; do
    [ -e "$out/$e" ] && mv "$out/$e" "$out/meta/"
  done
fi

touch "$out/.nojekyll"
printf 'mc.spiky.team\n' > "$out/CNAME"
