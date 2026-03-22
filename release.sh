#!/bin/bash
# ============================================================
# InstaPageScrape — Release Script
# Usage:
#   bash release.sh           → auto-increments by 0.1
#   bash release.sh 3.5       → creates specific version
#   bash release.sh 3.5 "my release notes"
# ============================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# ── Get current version from manifest.json ──────────────────
CURRENT=$(python3 -c "import json; print(json.load(open('manifest.json'))['version'])")
echo "Current version: v$CURRENT"

# ── Determine new version ────────────────────────────────────
if [ -n "$1" ]; then
    NEW_VERSION="$1"
    echo "Target version:  v$NEW_VERSION"
else
    # Auto-increment by 0.1
    NEW_VERSION=$(python3 -c "v='$CURRENT'.split('.'); v[-1]=str(int(v[-1])+1) if len(v)==3 else v; major=v[0]; minor=str(float('.'.join(v[1:]))+0.1) if len(v)==2 else v[1]; print(f'{major}.{minor}')" 2>/dev/null || python3 -c "
parts = '$CURRENT'.split('.')
if len(parts) == 1:
    new = str(float('$CURRENT') + 0.1)
elif len(parts) == 2:
    new = parts[0] + '.' + str(int(parts[1]) + 1)
else:
    new = parts[0] + '.' + parts[1] + '.' + str(int(parts[2]) + 1)
print(new)
")
    echo "Auto version:    v$NEW_VERSION"
fi

# ── Confirm ──────────────────────────────────────────────────
echo ""
echo "This will:"
echo "  1. Bump manifest.json + content.js to v$NEW_VERSION"
echo "  2. Commit and push to GitHub"
echo "  3. Build the ZIP via setup.sh"
echo "  4. Create GitHub release v$NEW_VERSION"
echo ""
read -p "Continue? (y/n): " CONFIRM
if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo "Aborted."
    exit 0
fi

# ── Get release notes ─────────────────────────────────────────
if [ -n "$2" ]; then
    NOTES="$2"
else
    echo ""
    echo "Enter release notes (press Enter twice when done):"
    NOTES=""
    while IFS= read -r line; do
        [ -z "$line" ] && break
        NOTES="$NOTES$line\n"
    done
fi

# ── Bump version in manifest.json ────────────────────────────
python3 -c "
import json
m = json.load(open('manifest.json'))
m['version'] = '$NEW_VERSION'
m['name'] = 'InstaPageScrape v$NEW_VERSION'
json.dump(m, open('manifest.json', 'w'), indent=2)
print('manifest.json updated')
"

# ── Bump version in content.js ───────────────────────────────
python3 -c "
import re
c = open('content.js').read()
c = re.sub(r'InstaPageScrape v[\d.]+', 'InstaPageScrape v$NEW_VERSION', c)
open('content.js', 'w').write(c)
print('content.js updated')
"

# ── Commit and push ───────────────────────────────────────────
echo ""
echo "▶ Committing..."
git add manifest.json content.js
git commit -m "chore: bump to v$NEW_VERSION"
git pull --rebase
git push
echo "▶ Pushed to GitHub"

# ── Build ZIP ─────────────────────────────────────────────────
echo ""
echo "▶ Building ZIP..."
bash setup.sh

# ── Create GitHub release ─────────────────────────────────────
echo ""
echo "▶ Creating GitHub release v$NEW_VERSION..."

ZIP_PATH="$HOME/instascraper_auto/instapagescrape.zip"

if [ -z "$NOTES" ]; then
    NOTES="- Version $NEW_VERSION"
fi

gh release create "v$NEW_VERSION" "$ZIP_PATH" \
    --title "v$NEW_VERSION" \
    --notes "$(printf "$NOTES")"

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║  ✅ Released v$NEW_VERSION successfully!        ║"
echo "╚══════════════════════════════════════════╝"
echo ""
echo "View at: https://github.com/life-web-arch/InstaPageScrape-Ecommerce/releases/tag/v$NEW_VERSION"
