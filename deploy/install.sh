#!/usr/bin/env bash
set -euo pipefail
# Operates exclusively in SpellWeaver paths. No Docker, other services, or Caddy global rewrites.
app_dir=/opt/spellweaver
revision="${1:?revision required}"
case "$revision" in *[!a-f0-9]*|'') echo 'Invalid revision' >&2;exit 1;; esac
release="$app_dir/releases/$revision"
mkdir -p "$app_dir/releases" "$app_dir/shared"
[ -d "$release" ] || { echo "Missing uploaded release $release" >&2; exit 1; }
[ -f "$release/index.html" ] && [ -f "$release/version.json" ] || { echo 'Release not built' >&2;exit 1; }
if [ ! -e "$app_dir/current" ];then
  ln -s "$release" "$app_dir/current"
else
  ln -sfn "$release" "$app_dir/.current-next"
  mv -Tf "$app_dir/.current-next" "$app_dir/current"
fi
# HTTP-only local backend, never binds the shared public 80/443 ports.
if command -v systemctl >/dev/null 2>&1;then
  systemctl is-active --quiet spellweaver.service && systemctl reload-or-restart spellweaver.service || systemctl restart spellweaver.service
fi
curl --fail --silent --show-error --max-time 15 http://127.0.0.1:18087/version.json
