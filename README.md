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

1. Run `bash setup.sh` in Termux
2. Open Kiwi Browser → Menu → Extensions → ⋮ → Load unpacked extension
3. Select the ZIP from your Downloads folder

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
