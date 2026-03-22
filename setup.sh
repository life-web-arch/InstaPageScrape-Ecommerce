#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD_DIR="$HOME/instascraper_auto"
ZIP_NAME="instapagescrape.zip"

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   InstaPageScrape — Ecom Brand        ║"
echo "║   Extension Builder                      ║"
echo "╚══════════════════════════════════════════╝"
echo ""

mkdir -p "$BUILD_DIR"
echo "▶ Build directory: $BUILD_DIR"

cp "$SCRIPT_DIR/manifest.json" "$BUILD_DIR/manifest.json"
cp "$SCRIPT_DIR/background.js" "$BUILD_DIR/background.js"
cp "$SCRIPT_DIR/content.js"    "$BUILD_DIR/content.js"
cp "$SCRIPT_DIR/jszip.min.js" "$BUILD_DIR/jszip.min.js"
echo "▶ Files copied successfully"

cd "$BUILD_DIR"
rm -f "$ZIP_NAME"
zip -r "$ZIP_NAME" manifest.json background.js content.js jszip.min.js
echo "▶ ZIP created: $BUILD_DIR/$ZIP_NAME"

if [ -d "$HOME/storage/downloads" ]; then
    cp -f "$ZIP_NAME" "$HOME/storage/downloads/$ZIP_NAME"
    echo ""
    echo "✅ Saved to Android Downloads: ~/storage/downloads/$ZIP_NAME"
    echo ""
    echo "Next steps:"
    echo "  1. Open Kiwi Browser"
    echo "  2. Menu → Extensions → ⋮ → Load unpacked extension"
    echo "  3. Select the ZIP from your Downloads folder"
elif [ -d "$HOME/Downloads" ]; then
    cp -f "$ZIP_NAME" "$HOME/Downloads/$ZIP_NAME"
    echo ""
    echo "✅ Saved to: ~/Downloads/$ZIP_NAME"
    echo ""
    echo "Next steps:"
    echo "  1. Open Chrome/Edge → chrome://extensions"
    echo "  2. Enable Developer Mode"
    echo "  3. Click 'Load unpacked' → select ~/instascraper_auto/"
else
    echo ""
    echo "✅ ZIP saved at: $BUILD_DIR/$ZIP_NAME"
    echo "   (Could not detect Downloads folder — copy manually)"
fi

echo ""
