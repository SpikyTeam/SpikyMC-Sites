set -euo pipefail
mkdir -p "$I18N_OVERLAY_DIR"
# only the overlay files; base-<code>.ts are the input lconvert merges into
find .spikymc/infra/i18n -maxdepth 1 -name '*.ts' ! -name 'base-*' -exec cp {} "$I18N_OVERLAY_DIR/" \;
python3 .spikymc/infra/i18n/i18n_sync.py
