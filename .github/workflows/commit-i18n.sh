set -euo pipefail
git config user.name "github-actions[bot]"
git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
git add i18n
if git diff --cached --quiet; then
  echo "translations unchanged"
  exit 0
fi
git commit -m "i18n: refresh from i18n.prismlauncher.org"
git push
gh workflow run pages.yml --repo SpikyTeam/mc.spiky.team
