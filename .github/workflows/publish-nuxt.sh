set -euo pipefail
# put the prerendered page on the gh-pages branch, next to the trees Pages
# serves as files (wiki, i18n, meta, fmllibs, maven, successful-login)
dist=$1
out=$2

find "$out" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
cp -a "$dist"/. "$out"/

cd "$out"
touch .nojekyll
git config user.name "github-actions[bot]"
git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
git add -A
git diff --cached --quiet && echo "nothing changed" && exit 0
git commit -m "publish the landing page"
git push
