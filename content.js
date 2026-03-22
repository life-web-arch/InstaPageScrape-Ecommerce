//  --- STATE MANAGEMENT ---
let isGathering = false;

async function init() {
    const url = window.location.href;
    const { scrapeState, scrapeQueue = [], scrapedData = [] } = await chrome.storage.local.get(['scrapeState', 'scrapeQueue', 'scrapedData']);

    if (url.includes('/p/') || url.includes('/reel/')) {
        if (scrapeState === 'SCRAPING') {
            injectPostUI(scrapeQueue.length, scrapedData.length);
            setTimeout(() => extractPostData(scrapeQueue, scrapedData), 3000);
        }
    } else {
        if (scrapeState === 'SCRAPING') {
            chrome.storage.local.set({ scrapeState: 'IDLE' });
        }
        injectProfileUI();
    }
}

// --- DRAGGABLE UI LOGIC ---
function makeDraggable(element, handle) {
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;

    function dragStart(e) {
        if (e.type === "touchstart") { startX = e.touches[0].clientX; startY = e.touches[0].clientY; }
        else { startX = e.clientX; startY = e.clientY; }
        const rect = element.getBoundingClientRect();
        element.style.bottom = 'auto'; element.style.right = 'auto';
        element.style.left = rect.left + 'px'; element.style.top = rect.top + 'px';
        initialLeft = rect.left; initialTop = rect.top;
        isDragging = true;
    }

    function drag(e) {
        if (!isDragging) return;
        e.preventDefault();
        let currentX, currentY;
        if (e.type === "touchmove") { currentX = e.touches[0].clientX; currentY = e.touches[0].clientY; }
        else { currentX = e.clientX; currentY = e.clientY; }
        element.style.left = (initialLeft + (currentX - startX)) + "px";
        element.style.top = (initialTop + (currentY - startY)) + "px";
    }

    function dragEnd() { isDragging = false; }

    handle.addEventListener("touchstart", dragStart, { passive: false });
    document.addEventListener("touchmove", drag, { passive: false });
    document.addEventListener("touchend", dragEnd);
    handle.addEventListener("mousedown", dragStart);
    document.addEventListener("mousemove", drag);
    document.addEventListener("mouseup", dragEnd);
    handle.style.cursor = "grab"; handle.style.touchAction = "none";
}

// --- PROFILE PAGE UI ---
function injectProfileUI() {
    if (document.getElementById('ig-scraper-panel')) return;
    const panel = document.createElement('div');
    panel.id = 'ig-scraper-panel';
    panel.style.cssText = `position: fixed; bottom: 80px; right: 20px; z-index: 999999; background: rgba(0, 0, 0, 0.9); padding: 0 15px 15px 15px; border-radius: 12px; color: white; font-family: sans-serif; box-shadow: 0 4px 10px rgba(0,0,0,0.5); border: 1px solid #00ffcc; display: flex; flex-direction: column; gap: 10px; width: 200px; min-width: 160px; max-width: 360px;`;

    panel.innerHTML = `
        <div id="drag-handle-profile" style="background:#111; margin:0 -15px 10px -15px; padding:10px; border-radius:12px 12px 0 0; text-align:center; border-bottom:1px solid #333; cursor:grab;"><b id="profile-header-text" style="color:#00ffcc; font-size:13px; transition:opacity 0.3s;">InstaPageScrape</b></div>
        <button id="btn-gather" style="background:#444; color:white; padding:10px; border-radius:8px; border:none; cursor:pointer;">1. Scroll & Gather Links</button>
        <div id="gather-status" style="font-size:12px; text-align:center; color:#aaa;">Links found: 0</div>
        <button id="btn-start" style="background:#ff007f; color:white; padding:10px; border-radius:8px; border:none; cursor:pointer; font-weight:bold; display:none;">2. Start Auto-Scrape</button>
        <button id="btn-clear" style="background:#ff4444; color:white; padding:5px; border-radius:8px; border:none; cursor:pointer; font-size:10px; margin-top:10px;">Clear Memory</button>
    `;

    document.body.appendChild(panel);
    makeDraggable(panel, document.getElementById('drag-handle-profile'));
    // Touch resize handle
    (function() {
        const resizeHandle = document.createElement('div');
        resizeHandle.style.cssText = 'width:30px;height:6px;background:#00ffcc;border-radius:3px;margin:6px auto 0 auto;cursor:ns-resize;opacity:0.5;';
        panel.appendChild(resizeHandle);
        let startY, startH;
        function onStart(e) { startY = (e.touches ? e.touches[0].clientY : e.clientY); startH = panel.offsetWidth; }
        function onMove(e) {
            e.preventDefault();
            const dy = (e.touches ? e.touches[0].clientY : e.clientY) - startY;
            const newW = Math.min(360, Math.max(160, startH + dy));
            panel.style.width = newW + 'px';
        }
        resizeHandle.addEventListener('touchstart', onStart, { passive: true });
        resizeHandle.addEventListener('touchmove', onMove, { passive: false });
        resizeHandle.addEventListener('mousedown', onStart);
        document.addEventListener('mousemove', (e) => { if (startY !== undefined) onMove(e); });
        document.addEventListener('mouseup', () => { startY = undefined; });
    })();
    // Alternate header text between brand name and drag hint
    (function() {
        const el = document.getElementById('profile-header-text');
        const msgs = ['InstaPageScrape', '↕ Drag to Move'];
        let i = 0;
        if (el) setInterval(() => {
            el.style.opacity = '0';
            setTimeout(() => { i = (i + 1) % msgs.length; el.textContent = msgs[i]; el.style.opacity = '1'; }, 300);
        }, 3000);
    })();

    const btnGather = document.getElementById('btn-gather');
    const btnStart = document.getElementById('btn-start');
    const status = document.getElementById('gather-status');
    let collectedLinks = new Set();

    document.getElementById('btn-clear').onclick = () => { chrome.storage.local.clear(); alert('Memory Cleared! Refresh page.'); };

    btnGather.onclick = async () => {
        if (isGathering) { isGathering = false; btnGather.innerText = "1. Scroll & Gather Links"; btnStart.style.display = "block"; return; }
        isGathering = true; btnGather.innerText = "Stop Gathering";

        while (isGathering) {
            window.scrollBy(0, 800);
            document.querySelectorAll('a[href*="/p/"], a[href*="/reel/"]').forEach(a => collectedLinks.add(a.href.split('?')[0]));
            status.innerText = `Links found: ${collectedLinks.size}`;
            await new Promise(r => setTimeout(r, 1500));
        }
    };

    btnStart.onclick = async () => {
        const queue = Array.from(collectedLinks);
        if (queue.length === 0) return alert("Gather links first!");
        const choice = await showOutputDialog();
        if (!choice) return;
        await chrome.storage.local.set({ scrapeState: 'SCRAPING', scrapeQueue: queue, scrapedData: [], outputMode: choice });
        window.location.href = queue[0];
    };
}

// --- POST PAGE UI ---
function injectPostUI(queueLen, dataLen) {
    if (document.getElementById('ig-post-panel')) return;
    const panel = document.createElement('div');
    panel.id = 'ig-post-panel';
    panel.style.cssText = `position: fixed; top: 20px; left: 20px; z-index: 999999; background: rgba(0, 0, 0, 0.9); padding: 0 15px 15px 15px; border-radius: 12px; color: white; font-family: sans-serif; border: 1px solid #ff007f; min-width: 160px; max-width: 360px;`;

    panel.innerHTML = `
        <div id="drag-handle-post" style="background:#111; margin:0 -15px 10px -15px; padding:10px; border-radius:12px 12px 0 0; text-align:center; border-bottom:1px solid #333;"><b style="color:#ff007f; font-size:14px;">↕ Drag to Move</b></div>
        <span style="font-size:12px;">Scraped: ${dataLen} | Remaining: ${queueLen}</span><br><br>
        <button id="btn-stop-export" style="background:#00ffcc; color:black; padding:8px; border-radius:5px; border:none; cursor:pointer; font-weight:bold; width:100%;">Stop & Export HTML</button>
    `;

    document.body.appendChild(panel);
    makeDraggable(panel, document.getElementById('drag-handle-post'));

    document.getElementById('btn-stop-export').onclick = async () => {
        const { scrapedData } = await chrome.storage.local.get(['scrapedData']);
        await chrome.storage.local.set({ scrapeState: 'IDLE' });
        exportToHTML(scrapedData);
    };
}

// ============================================================
// METHOD 1: Dig video URLs out of Instagram's embedded JSON
// ============================================================
function extractVideoFromPageJSON() {
    const results = [];
    try {
        const pageSource = document.documentElement.innerHTML;

        const regex = /"video_url"\s*:\s*"([^"]+\.mp4[^"]*)"/g;
        let match;
        while ((match = regex.exec(pageSource)) !== null) {
            const url = match[1].replace(/\\u0026/g, '&').replace(/\\/g, '');
            if (url.startsWith('http')) results.push(url);
        }

        const regex2 = /"playback_url"\s*:\s*"([^"]+)"/g;
        while ((match = regex2.exec(pageSource)) !== null) {
            const url = match[1].replace(/\\u0026/g, '&').replace(/\\/g, '');
            if (url.startsWith('http') && url.includes('.mp4')) results.push(url);
        }

        const regex3 = /"(https:\\\/\\\/[^"]*\.mp4[^"]*)"/g;
        while ((match = regex3.exec(pageSource)) !== null) {
            const url = match[1].replace(/\\u0026/g, '&').replace(/\\\//g, '/');
            if (url.startsWith('http')) results.push(url);
        }
    } catch (e) {
        console.log('[InstaPageScrape] JSON extraction error:', e);
    }
    return [...new Set(results)];
}

// ============================================================
// METHOD 2: Poll the <video> element src directly.
// ============================================================
async function extractVideoFromDOMPolling(container) {
    const results = [];

    container.querySelectorAll('video').forEach(vid => {
        try { vid.play().catch(() => {}); } catch (e) {}
    });

    for (let i = 0; i < 16; i++) {
        await new Promise(r => setTimeout(r, 500));
        container.querySelectorAll('video').forEach(vid => {
            [vid.src, vid.currentSrc, vid.querySelector?.('source')?.src].forEach(src => {
                if (src && !src.includes('blob:') && src.startsWith('http')) results.push(src);
            });
        });
        if (results.length > 0) break;
    }

    return [...new Set(results)];
}

// ============================================================
// METHOD 3: Poster image fallback — post is NEVER blank.
// ============================================================
function extractVideoPosters(container) {
    const results = [];
    container.querySelectorAll('video').forEach(vid => {
        if (vid.poster && vid.poster.startsWith('http')) results.push(vid.poster);
    });
    return results;
}

// ============================================================
// DEDUPLICATION: Remove near-duplicate URLs (same file,
// different query string tokens). Groups by base path,
// keeps the longest URL in each group.
// ============================================================
function deduplicateMedia(urlArray) {
    const groups = {};
    urlArray.forEach(url => {
        try {
            const base = url.split('?')[0];
            if (!groups[base] || url.length > groups[base].length) {
                groups[base] = url;
            }
        } catch (e) {
            groups[url] = url;
        }
    });
    return Object.values(groups);
}

// --- CORE DATA EXTRACTION LOGIC ---
async function extractPostData(queue, scrapedData) {
    let container;

    let retries = 20;
    while (retries > 0) {
        container = document.querySelector('article') || document.querySelector('main') || document.body;
        const vids = container.querySelectorAll('video');
        const imgs = Array.from(container.querySelectorAll('img')).filter(img =>
            !img.alt?.toLowerCase().includes('profile') && img.clientWidth > 100
        );
        if (vids.length > 0 || imgs.length > 0) break;
        await new Promise(r => setTimeout(r, 500));
        retries--;
    }

    container.querySelectorAll('span[dir="auto"], div[role="button"]').forEach(btn => {
        if (btn.innerText && btn.innerText.trim().toLowerCase() === 'more') try { btn.click(); } catch (e) {}
    });
    await new Promise(r => setTimeout(r, 600));

    const mediaSet = new Set();
    let hasVideo = false;

    // ---- IMAGES + CAROUSEL NAVIGATION ----
    let keepClicking = true;
    let slideCount = 0;
    const MAX_SLIDES = 20;

    while (keepClicking && slideCount < MAX_SLIDES) {
        container.querySelectorAll('img').forEach(img => {
            if (img.alt && img.alt.toLowerCase().includes('profile')) return;
            if (img.closest('a[href*="/p/"]') || img.closest('a[href*="/reel/"]')) return;
            if (img.clientWidth > 0 && img.clientWidth < 100) return;
            if (img.src && !img.src.includes('data:')) mediaSet.add(img.src);
        });

        container.querySelectorAll('video').forEach(vid => {
            const src = vid.src || vid.currentSrc || (vid.querySelector('source')?.src);
            if (src && !src.includes('blob:') && src.startsWith('http')) {
                mediaSet.add(src);
                hasVideo = true;
            }
        });

        const nextBtn =
            container.querySelector('button[aria-label="Next"]') ||
            container.querySelector('button[aria-label="Next slide"]') ||
            container.querySelector('[aria-label*="Next"]');

        if (nextBtn) {
            nextBtn.click();
            await new Promise(r => setTimeout(r, 1200));
            slideCount++;
        } else {
            keepClicking = false;
        }
    }

    // ---- VIDEO EXTRACTION (three-method cascade) ----
    if (!hasVideo && container.querySelectorAll('video').length > 0) {

        const jsonVideos = extractVideoFromPageJSON();
        if (jsonVideos.length > 0) {
            // Reels always have exactly one video — pick best quality only.
            // Carousel /p/ posts may have multiple genuine videos — keep all.
            const isReel = window.location.href.includes('/reel/');
            if (isReel) {
                const best = jsonVideos.reduce((a, b) => a.length >= b.length ? a : b);
                mediaSet.add(best);
            } else {
                jsonVideos.forEach(url => mediaSet.add(url));
            }
            hasVideo = true;
        }

        if (!hasVideo) {
            const domVideos = await extractVideoFromDOMPolling(container);
            if (domVideos.length > 0) {
                domVideos.forEach(url => { mediaSet.add(url); hasVideo = true; });
            }
        }

        if (!hasVideo) {
            const posters = extractVideoPosters(container);
            posters.forEach(url => mediaSet.add(url));
            if (posters.length > 0) hasVideo = true;
        }
    }

    // ---- CAPTION & PRICE ----
    let caption = "";
    const h1Block = container.querySelector('h1[dir="auto"]');
    if (h1Block) caption = h1Block.innerText;
    else {
        container.querySelectorAll('span[dir="auto"]').forEach(span => {
            if (span.innerText.length > caption.length && span.innerText.length > 20) caption = span.innerText;
        });
    }

    // ---- POST DATE ----
    // Instagram puts the post date in a <time> element with a datetime attribute.
    let postDate = "";
    const timeEl = document.querySelector('time[datetime]');
    if (timeEl) {
        const dt = new Date(timeEl.getAttribute('datetime'));
        postDate = dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    let finalPrice = "Price not mentioned";
    const priceRegex = /((?:₹|rs\.?|inr)\s*[\d,]+|[\d,]+\s*(?:rs\.?|inr|₹|\/-))/i;
    const priceMatch = caption.match(priceRegex);
    if (priceMatch && priceMatch[0]) finalPrice = "Price: " + priceMatch[0].trim();

    // ---- DEDUPLICATE ----
    const dedupedMedia = deduplicateMedia(Array.from(mediaSet));

    // ---- SAVE ----
    if (dedupedMedia.length > 0) {
        scrapedData.push({ url: window.location.href, media: dedupedMedia, caption: caption, price: finalPrice, date: postDate });
    } else {
        scrapedData.push({ url: window.location.href, media: [], caption: caption || "(no caption)", price: finalPrice, date: postDate });
    }

    queue.shift();
    await chrome.storage.local.set({ scrapeQueue: queue, scrapedData: scrapedData });

    if (queue.length > 0) window.location.href = queue[0];
    else {
        const { outputMode = 'html' } = await chrome.storage.local.get(['outputMode']);
        await chrome.storage.local.set({ scrapeState: 'IDLE' });
        if (outputMode === 'html') exportToHTML(scrapedData);
        else if (outputMode === 'zip') await exportToZip(scrapedData, false);
        else if (outputMode === 'both') await exportToZip(scrapedData, true);
    }
}

// --- OUTPUT TYPE DIALOG ---
function showOutputDialog() {
    return new Promise((resolve) => {
        const existing = document.getElementById('ig-output-dialog');
        if (existing) existing.remove();
        const overlay = document.createElement('div');
        overlay.id = 'ig-output-dialog';
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:9999999;display:flex;align-items:center;justify-content:center;font-family:sans-serif;';
        overlay.innerHTML = `
        <div style="background:#1a1a1a;border-radius:16px;padding:28px 24px;max-width:340px;width:90%;border:1px solid #ff007f;box-shadow:0 0 40px rgba(255,0,127,0.3);">
            <h2 style="color:#ff007f;margin:0 0 6px 0;font-size:18px;text-align:center;">Choose Output Format</h2>
            <p style="color:#aaa;font-size:12px;text-align:center;margin:0 0 20px 0;">How would you like to save your scraped data?</p>
            <div id="opt-html" class="ig-opt" style="border:2px solid #444;border-radius:10px;padding:12px;margin-bottom:10px;cursor:pointer;transition:border-color 0.2s;">
                <div style="color:white;font-weight:bold;font-size:14px;">🌐 HTML Catalog</div>
                <div style="color:#aaa;font-size:11px;margin-top:4px;">Single HTML file with all media embedded. <span style="color:#f59e0b;font-weight:bold;">⚠ Media links expire in hours — open and download soon.</span></div>
            </div>
            <div id="opt-zip" class="ig-opt" style="border:2px solid #444;border-radius:10px;padding:12px;margin-bottom:10px;cursor:pointer;transition:border-color 0.2s;">
                <div style="color:white;font-weight:bold;font-size:14px;">📦 ZIP Folder</div>
                <div style="color:#aaa;font-size:11px;margin-top:4px;">Downloads all media permanently. Each post gets its own folder with images, videos and caption. No expiry.</div>
            </div>
            <div id="opt-both" class="ig-opt" style="border:2px solid #444;border-radius:10px;padding:12px;margin-bottom:18px;cursor:pointer;transition:border-color 0.2s;">
                <div style="color:white;font-weight:bold;font-size:14px;">✨ Both <span style="background:#ff007f;color:white;font-size:10px;padding:2px 6px;border-radius:4px;margin-left:6px;">RECOMMENDED</span></div>
                <div style="color:#aaa;font-size:11px;margin-top:4px;">Export both the HTML catalog and the ZIP folder.</div>
            </div>
            <div style="display:flex;gap:10px;">
                <button style="flex:1;background:#333;color:white;border:none;padding:10px;border-radius:8px;cursor:pointer;font-size:13px;">Cancel</button>
                <button style="flex:2;background:#ff007f;color:white;border:none;padding:10px;border-radius:8px;cursor:pointer;font-weight:bold;font-size:13px;">Start Scraping ▶</button>
            </div>
        </div>`;
        window._igResolve = resolve;
        window._igChoice = null;
        document.body.appendChild(overlay);

        // Mobile-friendly touch+click handlers for option selection
        function attachOptHandler(id, value, borderColor) {
            const el = document.getElementById(id);
            if (!el) return;
            function selectOpt(e) {
                e.preventDefault();
                e.stopPropagation();
                window._igChoice = value;
                document.querySelectorAll('.ig-opt').forEach(o => o.style.borderColor = '#444');
                el.style.borderColor = borderColor;
            }
            el.addEventListener('click', selectOpt);
            el.addEventListener('touchend', selectOpt, { passive: false });
        }
        attachOptHandler('opt-html', 'html', '#ff007f');
        attachOptHandler('opt-zip',  'zip',  '#00ffcc');
        attachOptHandler('opt-both', 'both', '#7c3aed');

        // Cancel button
        const cancelBtn = overlay.querySelector('button:first-of-type');
        function doCancel(e) { e.preventDefault(); overlay.remove(); resolve(null); }
        cancelBtn.addEventListener('click', doCancel);
        cancelBtn.addEventListener('touchend', doCancel, { passive: false });

        // Start button
        const startBtn = overlay.querySelector('button:last-of-type');
        function doStart(e) {
            e.preventDefault();
            const c = window._igChoice;
            if (!c) { alert('Please select an option first.'); return; }
            overlay.remove();
            resolve(c);
        }
        startBtn.addEventListener('click', doStart);
        startBtn.addEventListener('touchend', doStart, { passive: false });
    });
}

// --- ZIP EXPORTER ---
async function exportToZip(data, includeHTML = false) {
    if (!data || data.length === 0) return alert("No data to zip!");
    // JSZip is bundled via manifest content_scripts — use directly, not via window
    if (typeof JSZip === 'undefined') return alert("JSZip not loaded. Please reload the page and try again.");
    const zip = new JSZip();
    const _ts = new Date().toISOString().slice(0,10);
    const rootFolder = zip.folder('InstaPageScrape_' + _ts);
    const prog = document.createElement('div');
    prog.id = 'ig-zip-progress';
    prog.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:9999999;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:sans-serif;color:white;';
    prog.innerHTML = '<div style="font-size:32px;margin-bottom:16px;">📦</div>'
        + '<div style="font-size:18px;font-weight:bold;color:#ff007f;margin-bottom:8px;">Building ZIP...</div>'
        + '<div id="zip-prog-text" style="font-size:13px;color:#aaa;margin-bottom:20px;">Starting...</div>'
        + '<div style="width:280px;height:8px;background:#333;border-radius:4px;overflow:hidden;">'
        + '<div id="zip-prog-bar" style="height:100%;background:linear-gradient(90deg,#ff007f,#7c3aed);width:0%;transition:width 0.3s;border-radius:4px;"></div></div>';
    document.body.appendChild(prog);
    const updateProg = (text, pct) => {
        const t = document.getElementById('zip-prog-text');
        const b = document.getElementById('zip-prog-bar');
        if (t) t.textContent = text;
        if (b) b.style.width = pct + '%';
    };
    for (let i = 0; i < data.length; i++) {
        const post = data[i];
        updateProg('Downloading Post ' + (i+1) + ' of ' + data.length + '...', Math.round((i/data.length)*90));
        let imgCount = 0, vidCount = 0;
        post.media.forEach(m => { if (m.includes('.mp4') || m.includes('video')) vidCount++; else imgCount++; });
        const postType = post.media.length > 1 ? 'Carousel' : vidCount > 0 ? 'Reel' : 'Image';
        const dateStr = post.date ? post.date.replace(/ /g, '-') : 'Unknown-Date';
        const folderName = 'Post ' + (i+1) + '_' + postType + '_' + dateStr;
        const postFolder = rootFolder.folder(folderName);
        const captionText = [
            'Post #' + (i+1),
            'URL: ' + post.url,
            'Type: ' + postType,
            'Date: ' + (post.date || 'Unknown'),
            'Price: ' + post.price,
            '',
            '--- Caption ---',
            post.caption || '(no caption)'
        ].join('\n');
        postFolder.file('caption.txt', captionText);
        let mediaIndex = 1;
        for (const mediaUrl of post.media) {
            const ext = (mediaUrl.includes('.mp4') || mediaUrl.includes('video')) ? '.mp4' : '.jpg';
            const filename = 'media_' + String(mediaIndex).padStart(2, '0') + ext;
            let blob = null;
            try {
                const r = await fetch(mediaUrl, { credentials: 'include', mode: 'cors', headers: { 'Referer': 'https://www.instagram.com/' } });
                if (r.ok) blob = await r.blob();
            } catch(e1) {}
            if (!blob) {
                try {
                    blob = await new Promise((res, rej) => {
                        const xhr = new XMLHttpRequest();
                        xhr.open('GET', mediaUrl, true);
                        xhr.responseType = 'blob';
                        xhr.withCredentials = true;
                        xhr.setRequestHeader('Referer', 'https://www.instagram.com/');
                        xhr.onload = () => xhr.status === 200 ? res(xhr.response) : rej();
                        xhr.onerror = rej;
                        xhr.send();
                    });
                } catch(e2) {}
            }
            if (!blob) {
                try {
                    blob = await new Promise((res, rej) => {
                        const id = 'igfetch_' + Date.now() + '_' + mediaIndex;
                        const script = document.createElement('script');
                        const urlJson = JSON.stringify(mediaUrl);
                        const idJson = JSON.stringify(id);
                        script.textContent = 'fetch(' + urlJson + ',{credentials:"include"}).then(r=>r.blob()).then(b=>{const rd=new FileReader();rd.onload=()=>window.dispatchEvent(new CustomEvent(' + idJson + ',{detail:rd.result}));rd.readAsDataURL(b);}).catch(()=>window.dispatchEvent(new CustomEvent(' + idJson + ',{detail:null})));';
                        const timeout = setTimeout(() => { window.removeEventListener(id, handler); rej('timeout'); }, 30000);
                        const handler = (e) => {
                            clearTimeout(timeout);
                            window.removeEventListener(id, handler);
                            if (!e.detail) return rej('no data');
                            const parts = e.detail.split(',');
                            const mime = parts[0].match(/:(.*?);/)[1];
                            const bin = atob(parts[1]);
                            const arr = new Uint8Array(bin.length);
                            for (let x = 0; x < bin.length; x++) arr[x] = bin.charCodeAt(x);
                            res(new Blob([arr], { type: mime }));
                        };
                        window.addEventListener(id, handler);
                        document.head.appendChild(script);
                        script.remove();
                    });
                } catch(e3) {}
            }
            if (blob) {
                postFolder.file(filename, blob);
            } else {
                postFolder.file('media_' + String(mediaIndex).padStart(2,'0') + '_url.txt', 'Could not download.\nOpen manually: ' + mediaUrl);
            }
            mediaIndex++;
        }
    }
    // If Both was selected, generate the HTML and add it into the ZIP too
    if (includeHTML) {
        updateProg('Adding HTML catalog to ZIP...', 93);
        const htmlStr = generateHTMLString(data);
        const _now2 = new Date();
        const _ts2 = _now2.toISOString().slice(0,10) + '_' + _now2.toTimeString().slice(0,8).replace(/:/g,'');
        rootFolder.file('InstaPageScrape_Catalog_' + _ts2 + '.html', htmlStr);
    }

    updateProg('Compressing ZIP...', 95);
    const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' }, (meta) => {
        updateProg('Compressing... ' + Math.round(meta.percent) + '%', 95 + Math.round(meta.percent * 0.05));
    });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    const _now = new Date();
    const _fts = _now.toISOString().slice(0,10) + '_' + _now.toTimeString().slice(0,8).replace(/:/g,'');
    a.href = url;
    a.download = 'InstaPageScrape_ZIP_' + _fts + '.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    const p = document.getElementById('ig-zip-progress');
    if (p) p.remove();
    alert('ZIP export complete! ' + data.length + ' posts saved.');
}

// --- HTML STRING GENERATOR (shared by HTML export and ZIP both-mode) ---
function generateHTMLString(data) {
    let pricedPosts = [];
    data.forEach((post, index) => {
        if (post.price !== "Price not mentioned") {
            let numStr = post.price.replace(/[^0-9]/g, '');
            let val = numStr ? parseInt(numStr) : 0;
            pricedPosts.push({ ...post, numericPrice: val, originalIndex: index + 1 });
        }
    });
    pricedPosts.sort((a, b) => b.numericPrice - a.numericPrice);

    let rankHtml = '';
    if (pricedPosts.length > 0) {
        rankHtml = `<div class="ranking-box"><h3>🏆 Items with Prices (${pricedPosts.length} out of ${data.length} posts)</h3><ul id="rank-list" class="collapsed-rank">`;
        pricedPosts.forEach((p) => {
            rankHtml += `<li><a href="#post-${p.originalIndex}">Post #${p.originalIndex} - <b>${p.price}</b></a></li>`;
        });
        rankHtml += `</ul>`;
        if (pricedPosts.length > 3) {
            rankHtml += `<button onclick="toggleRank()" class="toggle-btn" id="btn-rank">Show All ${pricedPosts.length} Items</button>`;
        }
        rankHtml += `</div>`;
    }

    let htmlContent = `
    <!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>InstaPageScrape — Catalog</title><style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f0f2f5; padding: 15px; color: #333; margin: 0;}
    h1 { text-align: center; color: #ff007f; margin-bottom: 5px; } .stats { text-align: center; color: #666; font-size: 14px; margin-bottom: 20px; }
    .ranking-box { background: white; border-radius: 12px; padding: 15px; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-left: 5px solid #f1c40f;}
    .ranking-box h3 { margin: 0 0 10px 0; font-size: 16px; } .ranking-box ul { list-style: none; padding: 0; margin: 0; }
    .ranking-box li { padding: 8px 0; border-bottom: 1px solid #eee; font-size: 14px; } .ranking-box a { color: #0066cc; text-decoration: none; font-weight: 500;}
    .collapsed-rank { max-height: 110px; overflow: hidden; } .expanded-rank { max-height: 2000px; }
    .filter-container { position: sticky; top: 10px; z-index: 100; display: flex; flex-direction: column; align-items: center; pointer-events: none;}
    .toggle-btn { pointer-events: auto; background: #222; color: white; border: none; padding: 8px 20px; border-radius: 20px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 10px rgba(0,0,0,0.3); z-index: 101; font-size: 13px; margin-bottom: 5px;}
    .filter-bar { pointer-events: auto; background: white; padding: 15px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border: 2px solid #ff007f; display: flex; gap: 15px; flex-wrap: wrap; justify-content: center; max-height: 200px; overflow: hidden; transition: all 0.3s ease; opacity: 1;}
    .filter-bar.hidden { max-height: 0; padding: 0 15px; border-width: 0; opacity: 0; margin: 0; }
    .filter-label { font-weight: bold; font-size: 13px; display: flex; align-items: center; gap: 5px; cursor: pointer;}
    .post-card { scroll-margin-top: 100px; background: white; border-radius: 12px; padding: 20px; margin-bottom: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .badge-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; flex-wrap: wrap; gap: 10px;}
    .price-found { font-size: 1.3rem; font-weight: bold; color: #fff; padding: 6px 15px; background: linear-gradient(45deg, #00b16a, #00d27f); border-radius: 8px; animation: glowingPrice 1.5s infinite alternate; text-shadow: 1px 1px 2px rgba(0,0,0,0.2); }
    @keyframes glowingPrice { 0% { box-shadow: 0 0 5px #00b16a; } 100% { box-shadow: 0 0 20px #00ffcc, 0 0 10px #00b16a; } }
    .price-missing { font-size: 1rem; font-weight: bold; color: #e74c3c; padding: 5px 10px; background: #fadbd8; border-radius: 6px;}
    .media-badges { display: flex; gap: 8px; } .badge-count { font-size: 11px; font-weight: bold; padding: 4px 8px; border-radius: 6px; color: white;}
    .badge-img { background: #f39c12; } .badge-vid { background: #9b59b6; }
    .media-gallery { display: flex; gap: 15px; overflow-x: auto; padding-bottom: 10px; -webkit-overflow-scrolling: touch; }
    .media-item { display: flex; flex-direction: column; align-items: center; min-width: 280px; }
    img, video { max-width: 280px; max-height: 350px; border-radius: 8px; object-fit: cover; border: 1px solid #ddd; }
    .download-btn { margin-top: 10px; background: #222; color: #fff; border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: bold; width: 100%;}
    .caption-box { margin-top: 20px; background: #f9f9f9; padding: 15px; border-radius: 8px; border-left: 4px solid #ff007f;}
    .caption-text { white-space: pre-wrap; font-size: 14px; line-height: 1.5; color: #444; }
    .caption-text.collapsed { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
    .read-more-btn { color: #0066cc; font-size: 13px; font-weight: bold; cursor: pointer; margin-top: 8px; display: inline-block; user-select: none;}
    .post-link { font-size: 13px; color: #0066cc; text-decoration: none; font-weight: 600; margin-bottom: 15px; display: block;}
    .no-media { color: #999; font-style: italic; font-size: 13px; padding: 20px 0; text-align: center; }
    .caption-box-header { display: flex; justify-content: flex-end; margin-bottom: 6px; }
    .post-date { font-size: 11px; color: #888; background: #efefef; padding: 3px 8px; border-radius: 20px; }
    </style><script>
    function applyFilters(){const a=document.getElementById("chk-img").checked,b=document.getElementById("chk-vid").checked,c=document.getElementById("chk-car").checked,d=document.getElementById("chk-price").checked;document.querySelectorAll(".post-card").forEach(e=>{const f=e.getAttribute("data-category"),g="true"===e.getAttribute("data-has-price");let h=!1;"image"===f&&a&&(h=!0),"video"===f&&b&&(h=!0),"carousel"===f&&c&&(h=!0),d&&!g&&(h=!1),e.style.display=h?"block":"none"})}
    function toggleFilters(){document.getElementById("filter-bar").classList.toggle("hidden")}
    function toggleRank(){const a=document.getElementById("rank-list"),b=document.getElementById("btn-rank");a.classList.contains("collapsed-rank")?(a.classList.remove("collapsed-rank"),a.classList.add("expanded-rank"),b.innerText="Show Less"):(a.classList.remove("expanded-rank"),a.classList.add("collapsed-rank"),b.innerText="Show All Items")}
    function toggleText(a){const b=a.previousElementSibling;b.classList.contains("collapsed")?(b.classList.remove("collapsed"),a.innerText="Show Less"):(b.classList.add("collapsed"),a.innerText="Show More")}
    async function forceDownload(a,b){try{const c=await fetch(a),d=await c.blob(),e=document.createElement("a");e.href=URL.createObjectURL(d),e.download="InstaPageScrape_"+Date.now()+b,document.body.appendChild(e),e.click(),document.body.removeChild(e)}catch(c){window.open(a,"_blank")}}
    </script></head><body><h1>InstaPageScrape — Catalog</h1><div class="stats">Total Items Scraped: ${data.length}</div>${rankHtml}
    <div class="filter-container"><button class="toggle-btn" onclick="toggleFilters()">⚙️ Toggle Filters</button><div class="filter-bar hidden" id="filter-bar">
    <label class="filter-label"><input type="checkbox" id="chk-img" checked onchange="applyFilters()"> 🖼️ Images</label>
    <label class="filter-label"><input type="checkbox" id="chk-vid" checked onchange="applyFilters()"> 🎥 Reels</label>
    <label class="filter-label"><input type="checkbox" id="chk-car" checked onchange="applyFilters()"> 📚 Carousels</label>
    <label class="filter-label" style="color:#00b16a;"><input type="checkbox" id="chk-price" onchange="applyFilters()"> 💰 Price Found Only</label>
    </div></div>`;

    data.forEach((post, i) => {
        let imgCount = 0; let vidCount = 0;
        post.media.forEach(m => { if (m.includes('.mp4') || m.includes('video')) vidCount++; else imgCount++; });
        let postCategory = (post.media.length > 1) ? "carousel" : (vidCount > 0) ? "video" : "image";
        const hasPrice = post.price !== "Price not mentioned";
        const priceClass = hasPrice ? "price-found" : "price-missing";
        htmlContent += `<div class="post-card" id="post-${i + 1}" data-category="${postCategory}" data-has-price="${hasPrice}"><a href="${post.url}" target="_blank" class="post-link">🔗 View Original Post #${i + 1}</a><div class="badge-row"><div class="${priceClass}">${post.price}</div><div class="media-badges"><span class="badge-count badge-img">📷 IMG : ${imgCount}</span><span class="badge-count badge-vid">🎥 VID : ${vidCount}</span></div></div><div class="media-gallery">`;
        if (post.media.length === 0) {
            htmlContent += `<div class="no-media">⚠️ Media could not be captured. <a href="${post.url}" target="_blank">Open original post</a></div>`;
        } else {
            post.media.forEach((m) => {
                if (m.includes('.mp4') || m.includes('video')) {
                    htmlContent += `<div class="media-item"><video src="${m}" controls playsinline></video><button class="download-btn" onclick="forceDownload('${m}', '.mp4')">⬇ Download Video</button></div>`;
                } else {
                    htmlContent += `<div class="media-item"><img src="${m}" loading="lazy"><button class="download-btn" onclick="forceDownload('${m}', '.jpg')">⬇ Download Image</button></div>`;
                }
            });
        }
        const dateHtml = post.date ? `<div class="post-date">📅 ${post.date}</div>` : "";
        htmlContent += `</div><div class="caption-box"><div class="caption-box-header">${dateHtml}</div><div class="caption-text collapsed">${post.caption || "No caption provided."}</div><div class="read-more-btn" onclick="toggleText(this)">Show More</div></div></div>`;
    });

    htmlContent += `</body></html>`;
    return htmlContent;
}

// --- HTML FILE EXPORTER ---
function exportToHTML(data) {
    if (!data || data.length === 0) return alert("No data scraped!");
    const htmlContent = generateHTMLString(data);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const _now = new Date(); const _ts = _now.toISOString().slice(0,10) + '_' + _now.toTimeString().slice(0,8).replace(/:/g,'');
    a.href = url; a.download = `InstaPageScrape_Catalog_${_ts}.html`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert("Export complete! Your catalog HTML has been saved.");
}

window.addEventListener('load', init);
setTimeout(init, 2000);
