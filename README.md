#  InstaPageScrape-Ecommerce

A Chrome/Kiwi/Orion Browser extension that auto-navigates any Instagram ecom brand profile and exports a single, self-contained HTML catalog with all images, reels, captions, prices, and post dates. Useful for cataloging products from any clothing, jewellery, or lifestyle brand on Instagram.

## Table of Contents

- [How It Works](#how-it-works)
- [Features](#features)
- [Files](#files)
- [Quick Start](#quick-start)
- [Installation](#installation-tap--to-expand-the-corresponding-section)
  - [Android — Kiwi Browser](#android--kiwi-browser)
  - [iOS — Orion Browser](#ios--orion-browser)
  - [Desktop — Chrome / Edge](#desktop--chrome--edge)
- [Usage](#usage)
- [Updating](#updating)
- [How Video Capture Works](#how-video-capture-works)
- [Safety Recommendation](#safety-recommendation)
- [Notes](#notes)

<p align="center">
  <a href="https://github.com/life-web-arch/InstaPageScrape-Ecommerce/releases/latest/download/instapagescrape.zip">
    <img src="https://raw.githubusercontent.com/life-web-arch/InstaPageScrape-Ecommerce/main/assets/download_btn.svg" alt="Download InstaPageScrape (LATEST)" width="420"/>
  </a>
</p>


> **Quickest install:** Download the ZIP directly from the [Latest Release](https://github.com/life-web-arch/InstaPageScrape-Ecommerce/releases/latest) — no Termux/Terminal or git required.

---

## How It Works

<p align="center">
  <img src="https://raw.githubusercontent.com/life-web-arch/InstaPageScrape-Ecommerce/main/assets/how_it_works.svg" width="760" alt="How It Works"/>
</p>

---

## Features

<p align="center">
  <img src="https://raw.githubusercontent.com/life-web-arch/InstaPageScrape-Ecommerce/main/assets/features.svg" width="760" alt="Features"/>
</p>

- **Auto-scrapes** all gathered post links one by one without manual interaction
- **Images + Reels** — captures both; uses Instagram's embedded page JSON for reliable video URL extraction (no network interception required)
- **Carousel posts** — navigates all slides and captures every image/video
- **Price detection** — automatically extracts ₹/Rs prices from captions and ranks them
- **Post date** — shown as a pill in the top-right of each caption box
- **Draggable UI** — the scraper panel can be repositioned on screen
- **Filter bar** — filter by Images / Reels / Carousels / Price Found
- **Download buttons** — per-media download for every image and video
- **Unique filenames** — exported HTML named with full date + time (`InstaPageScrape_Catalog_YYYY-MM-DD_HHMMSS.html`)
- Works on **Kiwi Browser (Android)**, **Orion Browser (iOS)**, and any Chromium browser with extension support

---

## Files

| File | Purpose |
|------|---------|
| `manifest.json` | Extension manifest (MV3) |
| `background.js` | Service worker — secondary video capture via webRequest |
| `content.js` | Main logic — UI injection, scraping, HTML export |
| `setup.sh` | One-shot script — writes all files, zips, saves to Downloads |

---

## Quick Start

```bash
gh repo clone InstaPageScrape-Ecommerce
cd InstaPageScrape-Ecommerce
bash setup.sh
```

---

## Installation (Tap "▶" to expand the corresponding section) 

<details>
<summary><b>📱 Android — Kiwi Browser (or any browser with extension support)</b></summary>

#### Android — Kiwi Browser

**Option A — Download release ZIP (easiest, no Termux needed):**
- 1. Download `instapagescrape.zip` from the [Latest Release](https://github.com/life-web-arch/InstaPageScrape-Ecommerce/releases/latest)
- 2. Open Kiwi Browser → ⋮ → Extensions → + (from zip/.crx/.user.js) → select the ZIP

**📸 Visual guide:**

<p align="center">
  <img src="https://raw.githubusercontent.com/life-web-arch/InstaPageScrape-Ecommerce/main/assets/screenshots/kiwi_step1_menu.png" width="260" alt="Step 1 — Tap three dots menu then Extensions"/>
  &nbsp;&nbsp;
  <img src="https://raw.githubusercontent.com/life-web-arch/InstaPageScrape-Ecommerce/main/assets/screenshots/kiwi_step2_extensions.png" width="260" alt="Step 2 — Tap + from zip then reload"/>
</p>

- **Step 1:** Tap **⋮ menu** → Extensions &nbsp;|&nbsp; 
- **Step 2:** Tap **+ (from .zip/.crx/.user.js)** → select ZIP → tap **🔄 reload**
- **Step 3:** Navigate to any Instagram brand profile and the **InstaPageScrape** panel will appear
(⚠️keep refreshing the Insta profile page, until the extension panel popup shows up) 

**Option B — via [Termux](https://f-droid.org/packages/com.termux) + git:**
```bash
gh repo clone InstaPageScrape-Ecommerce
cd InstaPageScrape-Ecommerce
bash setup.sh
```
Then open Kiwi Browser → Menu → Extensions → ⋮ → Load unpacked extension / '+ (from zip/.crx/.user.js)' → select the ZIP from Downloads

</details>

<details>
<summary><b>🍎 iOS — Orion Browser (or any browser with extension support)</b></summary>

#### iOS — Orion Browser

iOS Safari does not support extensions, but **Orion Browser** by Kagi supports Chrome extensions natively on iOS with no sideloading required.

1. Install [Orion Browser](https://apps.apple.com/app/orion-browser-by-kagi/id1484498200) from the App Store (free)
2. Get the ZIP onto your iPhone — easiest options:
   - **Download directly:** grab `instapagescrape.zip` from the [Latest Release](https://github.com/life-web-arch/InstaPageScrape-Ecommerce/releases/latest) in Safari, then open with Orion
   - AirDrop it from a Mac where you ran `bash setup.sh`
   - Upload to iCloud Drive / Google Drive from another device and open on iPhone
   - Use [a-Shell](https://apps.apple.com/app/a-shell/id1473805438) (free terminal app for iOS) — run `bash setup.sh` after cloning with `gh`
3. In Orion → Settings → Extensions → tap **"+"** → **Load unpacked extension** or look for options to select/import the extension as a ZIP file e.g. "+ (from zip/.crx/.user.js)" → select the ZIP
4. Navigate to any Instagram brand profile and the **InstaPageScrape** panel will appear
(⚠️keep refreshing the Insta profile page, until the extension panel popup shows up) 

> **Note:** Safari extensions via the App Store cannot run Chrome extension APIs so they will not work. Orion is currently the only iOS browser with full Chrome extension support.

</details>

<details>
<summary><b>🖥️ Desktop — Chrome / Edge</b></summary>

#### Desktop — Chrome / Edge

1. Run `bash setup.sh` or download the latest extension ZIP directly from here [Latest Release](https://github.com/life-web-arch/InstaPageScrape-Ecommerce/releases/latest)
2. Open `chrome://extensions` → Enable Developer Mode
3. Click **Load unpacked** or "+ (from zip/.crx/.user.js)" → select `~/instascraper_auto/`

</details>

---

## Usage

<p align="center">
  <img src="https://raw.githubusercontent.com/life-web-arch/InstaPageScrape-Ecommerce/main/assets/usage_guide.svg" width="760" alt="Usage Guide"/>
</p>

1. Open any Instagram brand/ecom profile page in Kiwi or Orion Browser
2. Tap **"1. Scroll & Gather Links"** — scroll down to load posts, tap again to stop
3. Tap **"2. Start Auto-Scrape"** — the extension navigates each post automatically
4. When done, the HTML catalog downloads automatically
5. Open the HTML file in any browser to browse, filter, and download media

> To stop early and export what has been scraped so far, tap **"Stop & Export HTML"**.

---

## Updating

**Via release (easiest):**
1. Download the new ZIP from [Releases](https://github.com/life-web-arch/InstaPageScrape-Ecommerce/releases)
2. In Kiwi / Orion → Extensions → Remove the old extension → Load unpacked / '+ (from zip/.crx/.user.js)' → select the new updated version's ZIP

**Via git:**
```bash
cd InstaPageScrape-Ecommerce
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

## Safety Recommendation

> ⚠️ To reduce the risk of your Instagram account being flagged for **suspicious or automated behavior**:
> - Use a **throwaway Instagram account** when scraping
> - Or scrape while **not logged in** (works on public profiles)
> - Scrape in **small batches** — avoid scraping hundreds of posts in one session
>
> This warning is also shown the first time you install the extension.

---

## Notes

- Works with any public Instagram ecom/brand profile
- Instagram CDN URLs expire — download media soon after scraping
- No data leaves your device; everything is processed locally
- Tested on Kiwi Browser (Android)
