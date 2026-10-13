#!/bin/sh
set -eu
# Run on the VPS from an extracted, audited Git commit (no production data in source).
# Example: RELEASE_SHA=<commit> APP_HOME=/opt/brand-watch EDGE_NETWORK=fanzone_default sh deploy/release.sh
: "${RELEASE_SHA:?Specify the exact source commit}"
APP_HOME=${APP_HOME:-/opt/brand-watch}
EDGE_NETWORK=${EDGE_NETWORK:-fanzone_default}
case "$RELEASE_SHA" in *[!a-f0-9]*|'') echo 'Invalid revision'; exit 1;; esac
test ${#RELEASE_SHA} -eq 40
test -d "$APP_HOME/data"
ROOT=$(pwd)
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
BACKUP="$APP_HOME/backups/$STAMP"
mkdir -p "$BACKUP"
chmod 700 "$BACKUP"
IMAGE="brand-watch:$RELEASE_SHA"
docker build --build-arg "RELEASE_SHA=$RELEASE_SHA" -t "$IMAGE" .
docker run --rm "$IMAGE" node tests/archive.mjs
docker run --rm "$IMAGE" node tests/integration.mjs
docker run --rm "$IMAGE" node tests/presentation.mjs
docker run --rm "$IMAGE" node tests/discovery.mjs
docker run --rm "$IMAGE" node tests/editorial.mjs
docker run --rm "$IMAGE" node tests/research.mjs
docker run --rm "$IMAGE" node --experimental-sqlite tests/participation.mjs
docker run --rm "$IMAGE" node --experimental-sqlite tests/growth.mjs
docker run --rm "$IMAGE" node --experimental-sqlite tests/event-dates.mjs
docker run --rm "$IMAGE" node --experimental-sqlite tests/propagation-dates.mjs
docker inspect brand-watch > "$BACKUP/container.json"
docker cp brand-watch:/app/dist "$BACKUP/runtime-dist"
docker stop brand-watch > /dev/null
trap 'docker start brand-watch >/dev/null 2>&1 || true' EXIT
tar -czf "$BACKUP/data.tar.gz" -C "$APP_HOME" data
chmod 600 "$BACKUP/data.tar.gz"
sha256sum "$BACKUP/data.tar.gz" > "$BACKUP/data.sha256"
docker rename brand-watch "brand-watch-old-$STAMP"
trap 'docker stop brand-watch >/dev/null 2>&1 || true; docker rename brand-watch "brand-watch-failed-'"$STAMP"'" >/dev/null 2>&1 || true; docker rename "brand-watch-old-'"$STAMP"'" brand-watch >/dev/null 2>&1 || true; docker start brand-watch >/dev/null 2>&1 || true' EXIT
ZIP="$APP_HOME/dist/assets/evidence-20261011-76-images.zip"
if test -f "$ZIP"; then set -- --mount "type=bind,src=$ZIP,dst=/app/dist/assets/evidence-20261011-76-images.zip,readonly"; else set --; fi
docker run -d --name brand-watch --restart unless-stopped --init --memory 384m --cpus 0.5 --pids-limit 64 --security-opt no-new-privileges:true --cap-drop ALL --log-opt max-size=5m --log-opt max-file=2 --network "$EDGE_NETWORK" --mount "type=bind,src=$APP_HOME/data,dst=/app/data" "$@" -e DATA_DIR=/app/data -e COOKIE_SECURE=true -e MAX_STORAGE_MB=1024 -e NODE_OPTIONS=--max-old-space-size=192 "$IMAGE" > /dev/null
for n in 1 2 3 4 5; do
 if docker exec brand-watch node -e "fetch('http://127.0.0.1:8787/healthz').then(async r=>{const d=await r.json();process.exit(r.ok&&d.version===process.env.RELEASE_SHA?0:1)}).catch(()=>process.exit(1))"; then break; fi
 sleep 1
done
docker exec brand-watch node -e "fetch('http://127.0.0.1:8787/healthz').then(async r=>{const d=await r.json();process.exit(r.ok&&d.version===process.env.RELEASE_SHA?0:1)}).catch(()=>process.exit(1))"
printf '%s\n' "$RELEASE_SHA" > "$APP_HOME/active-release.txt"
printf '%s\n' "image=$IMAGE" "source=$ROOT" "backup=$BACKUP" "previous_container=brand-watch-old-$STAMP" > "$APP_HOME/release-manifest.txt"
docker inspect brand-watch --format '{{.Image}}' >> "$APP_HOME/release-manifest.txt"
trap - EXIT
echo "Released $RELEASE_SHA; retained previous container and full data backup in $BACKUP"
