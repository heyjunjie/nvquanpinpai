#!/bin/sh
set -eu
: "${BACKUP_FILE:?Specify the existing data tar.gz}"
: "${IMAGE:?Specify the release image}"
RESTORE_ROOT=${RESTORE_ROOT:-/opt/brand-watch/restore-check}
mkdir -p "$RESTORE_ROOT"
chmod 700 "$RESTORE_ROOT"
# Extract into a fresh directory only. Never overwrite production data.
TARGET=$(mktemp -d "$RESTORE_ROOT/check.XXXXXX")
tar -xzf "$BACKUP_FILE" -C "$TARGET"
docker run --rm --network none --mount "type=bind,src=$TARGET/data,dst=/app/data" --env DATA_DIR=/app/data "$IMAGE" node --experimental-sqlite --input-type=module -e "import{DatabaseSync}from'node:sqlite';import fs from'node:fs';import crypto from'node:crypto';const db=new DatabaseSync('/app/data/feedback.sqlite');if(db.prepare('PRAGMA integrity_check').get().integrity_check!=='ok')throw Error('SQLite integrity failure');console.log(JSON.stringify({integrity:'ok',records:db.prepare('SELECT COUNT(*) n FROM feedback').get().n,visitors:db.prepare('SELECT COUNT(*) n FROM visitors').get().n,users:db.prepare('SELECT COUNT(*) n FROM users').get().n,visitorKeySHA:crypto.createHash('sha256').update(fs.readFileSync('/app/data/visitor-key')).digest('hex'),uploadsPresent:fs.existsSync('/app/data/uploads')}));"
echo "Restored copy preserved at $TARGET; production untouched"
