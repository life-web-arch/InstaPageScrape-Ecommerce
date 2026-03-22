# InstaPageScrape — Dham Clothing

A Chrome/Kiwi Browser extension that auto-navigates an Instagram profile's posts and exports a single, self-contained HTML catalog with all images, reels, captions, prices, and post dates.

---

## Features

- **Auto-scrapes** all gathered post links one by one without manual interaction
- **Images + Reels** — captures both; uses Instagram's embedded page JSON for reliable video URL extraction (no network interception required)
- **Carousel posts** — navigates all slides and captures every image/video
- **Price detection** — automatically extracts ₹/Rs prices from captions and ranks them
- **Post date** — shown as a pill in the top-right of each caption box
- **Draggable UI** — the scraper panel can be repositioned on screen
- **Filter bar** — filter by Images / Reels / Carousels / Price Found
- **Download buttons** — per-media download for every image and video
- **Unique filenames** — exported HTML named with full date + time (`DhamClothing_Catalog_YYYY-MM-DD_HHMMSS.html`)
- Works on **Kiwi Browser (Android)** and any extension-supported Chromium browser

---

## Files

| File | Purpose |
|------|---------|
| `manifest.json` | Extension manifest (MV3) |
| `background.js` | Service worker — secondary video capture via webRequest |
| `content.js` | Main logic — UI injection, scraping, HTML export |
| `setup.sh` | One-shot Termux script — writes all files, zips, saves to Downloads |

---

## Quick Start

```bash
# Clone and build in one go
gh repo clone InstaPageScrape-dham_clothing
cd InstaPageScrape-dham_clothing
bash setup.sh
```

---

## Installation

### Android (Kiwi Browser + Termux)

**Option A — Download release ZIP (easiest, no Termux needed):**
1. Download `dham_auto_scraper.zip` from the [Latest Release](https://github.com/life-web-arch/InstaPageScrape-dham_clothing/releases/latest)
2. Open Kiwi Browser → Menu → Extensions → ⋮ → Load unpacked extension → select the ZIP

**Option B — via Termux + git:**
```bash
gh repo clone InstaPageScrape-dham_clothing
cd InstaPageScrape-dham_clothing
bash setup.sh
```
Then open Kiwi Browser → Menu → Extensions → ⋮ → Load unpacked extension → select the ZIP from Downloads

### iOS (iPhone / iPad)

iOS Safari does not support extensions, but **Orion Browser** by Kagi supports Chrome extensions natively on iOS with no sideloading required.

1. Install [Orion Browser](https://apps.apple.com/app/orion-browser-by-kagi/id1484498200) from the App Store (free)
2. Get the ZIP onto your iPhone — easiest options:
   - **Download directly:** grab `dham_auto_scraper.zip` from the [Latest Release](https://github.com/YOUR_USERNAME/InstaPageScrape-dham_clothing/releases/latest) in Safari, then open with Orion
   - AirDrop it from a Mac where you ran `bash setup.sh`
   - Upload to iCloud Drive / Google Drive from another device and open on iPhone
   - Use [a-Shell](https://apps.apple.com/app/a-shell/id1473805438) (free terminal app for iOS) — run `bash setup.sh` after cloning with `gh`
3. In Orion → Settings → Extensions → tap **"+"** → **Load unpacked extension** → select the ZIP
4. Navigate to an Instagram profile and the **✥ V5.3 ✥** panel will appear

> **Note:** Safari extensions via the App Store cannot run Chrome extension APIs (`chrome.storage`, `chrome.webRequest`) so they won't work. Orion is currently the only iOS browser with full Chrome extension support.

---

### Desktop (Chrome / Edge)

1. Run `bash setup.sh`
2. Open `chrome://extensions` → Enable Developer Mode
3. Click **Load unpacked** → select `~/dham_scraper_auto/`

---

## Usage

1. Open an Instagram profile page in Kiwi Browser
2. Tap **"1. Scroll & Gather Links"** — scroll down to load posts, tap again to stop
3. Tap **"2. Start Auto-Scrape"** — the extension navigates each post automatically
4. When done, the HTML catalog downloads automatically
5. Open the HTML file in any browser to browse the catalog

> To stop early and export what's scraped so far, tap **"Stop & Export HTML"**.

---

## Updating

```bash
cd InstaPageScrape-dham_clothing
git pull
bash setup.sh
```

Then reload the extension in Kiwi Browser → Extensions → Reload.

---

## How Video Capture Works

Instagram serves reel videos as `blob:` URLs in the DOM, making direct src extraction unreliable. This extension uses three cascading methods:

1. **Page JSON extraction** — parses Instagram's embedded `<script>` JSON for `"video_url"` fields (primary, most reliable)
2. **DOM polling** — forces video playback and polls `video.currentSrc` for up to 8 seconds
3. **Poster fallback** — saves the video thumbnail so posts are never blank

For reels, only the single highest-quality URL is kept. For carousel posts, all distinct video URLs are kept.

---

## Notes

- Instagram CDN URLs expire — download media soon after scraping
- No data leaves your device; everything is processed locally
- Tested on Kiwi Browser (Android) v131+
