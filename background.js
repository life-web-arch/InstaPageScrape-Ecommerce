const capturedVideoUrls = {};

chrome.webRequest.onCompleted.addListener(
    (details) => {
        if (
            details.tabId > 0 &&
            details.type === "media" &&
            (details.url.includes(".mp4") || details.url.includes("video"))
        ) {
            if (!capturedVideoUrls[details.tabId]) {
                capturedVideoUrls[details.tabId] = [];
            }
            const alreadyExists = capturedVideoUrls[details.tabId].some(v => v.url === details.url);
            if (!alreadyExists) {
                capturedVideoUrls[details.tabId].push({ url: details.url, timestamp: details.timeStamp });
            }
        }
    },
    { urls: ["*://*.cdninstagram.com/*", "*://*.instagram.com/*", "*://*.fbcdn.net/*"] }
);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (!sender.tab || !sender.tab.id) return;
    const tabId = sender.tab.id;

    if (request.action === "get_captured_videos") {
        const videoArray = capturedVideoUrls[tabId] || [];
        sendResponse({ videoUrls: videoArray.map(v => v.url) });
        delete capturedVideoUrls[tabId];
        return true;
    }

    if (request.action === "clear_video_cache") {
        if (capturedVideoUrls[tabId]) delete capturedVideoUrls[tabId];
        sendResponse({ status: "cleared" });
        return true;
    }
});

chrome.tabs.onRemoved.addListener((tabId) => {
    if (capturedVideoUrls[tabId]) delete capturedVideoUrls[tabId];
});
