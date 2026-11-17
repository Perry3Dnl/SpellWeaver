#!/usr/bin/env bash
set -euo pipefail
# Run only on the existing approved server, through authenticated GitHub Actions SSH.
# Docker container and shared-Caddy paths are deliberately fixed and narrow.
REVISION="${1:?Provide source commit SHA}"
[[ "$REVISION" =~ ^[0-9a-f]{40}$ ]] || { echo 'Invalid release SHA' >&2; exit 1; }
APP_DIR=/opt/spellweaver
STOCK_DIR=/opt/dummy-stock-simulator
CADDYFILE="$STOCK_DIR/deploy/Caddyfile"
NETWORK=dummy-stock-simulator_default
CADDY_CONTAINER=dummy-stock-caddy
RELEASE_DIR="$APP_DIR/releases/$REVISION"
ARCHIVE="$APP_DIR/.release-$REVISION.tar.gz"

# Docker privilege is established without changing any services.
if docker info >/dev/null 2>&1; then
  DOCKER=(docker)
elif sudo -n docker info >/dev/null 2>&1; then
  DOCKER=(sudo docker)
else
  echo 'Docker access unavailable for deployment identity' >&2
  exit 1
fi

[ -s "$ARCHIVE" ] || { echo 'Missing release archive' >&2; exit 1; }
"${DOCKER[@]}" container inspect "$CADDY_CONTAINER" >/dev/null || { echo 'Expected shared Caddy instance is unavailable; no changes made' >&2; exit 1; }
"${DOCKER[@]}" network inspect "$NETWORK" >/dev/null || { echo 'Expected shared network missing; no changes made' >&2; exit 1; }
[ -f "$CADDYFILE" ] || { echo 'Shared Caddyfile not found; no changes made' >&2; exit 1; }
"${DOCKER[@]}" inspect -f '{{range .Mounts}}{{if eq .Destination "/etc/caddy/Caddyfile"}}{{.Source}}{{end}}{{end}}' "$CADDY_CONTAINER" | grep -Fx "$CADDYFILE" >/dev/null || {
  echo 'Unexpected Caddyfile mount; refusing to modify shared proxy.' >&2;exit 1;
}
# Reserve a target namespace for SpellWeaver, never choose an arbitrary /opt path.
mkdir -p "$APP_DIR/releases"
if [ -e "$RELEASE_DIR" ];then
  test -f "$RELEASE_DIR/version.json" || { echo 'Incomplete existing release, refusing to overwrite' >&2;exit 1; }
else
  mkdir "$RELEASE_DIR"
  tar -xzf "$ARCHIVE" -C "$RELEASE_DIR" --no-same-owner --no-same-permissions
fi
rm -f "$ARCHIVE"
REVISION_SERVED="$(python3 - "$RELEASE_DIR/version.json" <<'PY'
import json,sys
try:
 print(json.load(open(sys.argv[1],encoding='utf-8'))['revision'])
except (KeyError,ValueError,OSError):
 print('')
PY
)"
[ "$REVISION_SERVED" = "$REVISION" ] || { echo 'Packaged revision does not match release' >&2;exit 1; }
[ -f "$RELEASE_DIR/index.html" ] || { echo 'Release missing homepage' >&2;exit 1; }
# A throwaway candidate is validated *before* touching the currently running SpellWeaver container.
CANDIDATE="spellweaver-candidate-${REVISION:0:12}"
if "${DOCKER[@]}" container inspect "$CANDIDATE" >/dev/null 2>&1; then
  echo 'Existing candidate found; refusing to reuse an unknown container' >&2
  exit 1
fi
cleanup_candidate(){
  "${DOCKER[@]}" rm -f "$CANDIDATE" >/dev/null 2>&1 || true
}
trap cleanup_candidate EXIT
"${DOCKER[@]}" run -d \
  --name "$CANDIDATE" \
  --network "$NETWORK" \
  --network-alias spellweaver-web \
  --read-only --cap-drop ALL --security-opt no-new-privileges \
  --user 65534:65534 \
  --pids-limit 100 --memory 128m \
  -v "$RELEASE_DIR:/site:ro" \
  --workdir /site \
  python:3.12-alpine \
  python3 -m http.server 8080 --bind 0.0.0.0 --directory /site >/dev/null

READY=false
for attempt in $(seq 1 20); do
  if "${DOCKER[@]}" exec "$CANDIDATE" python3 -c 'import json,urllib.request; assert json.load(urllib.request.urlopen("http://127.0.0.1:8080/version.json", timeout=3))["revision"]'" == '$REVISION'" 2>/dev/null;then
    READY=true;break
  fi
  sleep 1
done
[ "$READY" = true ] || { echo 'Candidate failed its isolated live revision check; original service unaffected' >&2;exit 1; }

# Add only the managed host block. Preserves existing content before and after it.
BACKUP="$CADDYFILE.bak-spellweaver-$(date -u +%Y%m%dT%H%M%SZ)"
cp -p "$CADDYFILE" "$BACKUP"
BEFORE_SHA="$(sha256sum "$CADDYFILE" | cut -d' ' -f1)"
python3 "$APP_DIR/deploy/caddy-update.py" "$CADDYFILE"
AFTER_SHA="$(sha256sum "$CADDYFILE" | cut -d' ' -f1)"
if ! "${DOCKER[@]}" exec "$CADDY_CONTAINER" caddy validate --config /etc/caddy/Caddyfile; then
  # Only restore if the file remains exactly our edit, not an interleaved other deployment.
  if [ "$(sha256sum "$CADDYFILE" | cut -d' ' -f1)" = "$AFTER_SHA" ];then cp -p "$BACKUP" "$CADDYFILE";fi
  echo 'Caddy validation failed, restored previous file; no reload performed' >&2
  exit 1
fi

if "${DOCKER[@]}" container inspect spellweaver-web >/dev/null 2>&1;then
  "${DOCKER[@]}" stop -t 10 spellweaver-web >/dev/null
  "${DOCKER[@]}" rm spellweaver-web >/dev/null
fi
"${DOCKER[@]}" rename "$CANDIDATE" spellweaver-web
trap - EXIT
"${DOCKER[@]}" update --restart unless-stopped spellweaver-web >/dev/null
if [ "$BEFORE_SHA" != "$AFTER_SHA" ];then
  if ! "${DOCKER[@]}" exec "$CADDY_CONTAINER" caddy reload --config /etc/caddy/Caddyfile; then
    if [ "$(sha256sum "$CADDYFILE" | cut -d' ' -f1)" = "$AFTER_SHA" ];then cp -p "$BACKUP" "$CADDYFILE";fi
    echo 'Caddy reload failed and existing proxy configuration was restored' >&2
    exit 1
  fi
fi
# The shared proxy is otherwise untouched, and only one container has been swapped.
"${DOCKER[@]}" exec spellweaver-web python3 -c 'import json,urllib.request; assert json.load(urllib.request.urlopen("http://127.0.0.1:8080/version.json", timeout=3))["revision"]'" == '$REVISION'"
printf '%s\n' "$REVISION" > "$APP_DIR/LAST_SUCCESSFUL_RELEASE"
echo "Isolated SpellWeaver deployment successful: $REVISION"
