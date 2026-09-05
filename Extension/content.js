console.log("FeedPilot AI is running!");

const AI_ENDPOINT = "http://127.0.0.1:8000/classify";
const pending = new Set();

function extractVideo(card) {
    const link = card.querySelector('a[href*="/watch?v="]');
    if (!link) return null;

    let id;
    try { id = new URL(link.href).searchParams.get("v"); }
    catch { return null; }
    if (!id) return null;

    const titleEl = card.querySelector("#video-title");
    const title = titleEl?.getAttribute("title") ||
                  titleEl?.textContent?.trim() || "";
    const channel = card.querySelector("ytd-channel-name")
        ?.textContent?.trim() || "";

    if (!title) return null;
    return { id, title, channel };
}

function hide(card, reason) {
    card.style.display = "none";
    card.dataset.feedpilotBlocked = "true";
    console.log("🚫 FeedPilot:", reason);
}

function show(card) {
    if (card.dataset.feedpilotBlocked === "true") {
        card.style.display = "";
        delete card.dataset.feedpilotBlocked;
    }
}

async function classifyVideo(card, video) {
    if (pending.has(video.id)) return;
    pending.add(video.id);

    try {
        const response = await fetch(AI_ENDPOINT, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                title: video.title,
                channel: video.channel
            })
        });

        if (!response.ok) throw new Error(`AI server: ${response.status}`);

        const result = await response.json();
        console.log("🤖 FeedPilot AI:", video.title, result);

        // High-confidence BLOCK only. Uncertain results stay visible.
        if (result.label === "BLOCK" && result.confidence >= 0.70) {
            hide(card, `AI BLOCK (${result.confidence.toFixed(2)})`);
        } else {
            show(card);
        }
    } catch (error) {
        // AI server is unavailable: don't break YouTube.
        console.warn("FeedPilot AI unavailable:", error);
    } finally {
        pending.delete(video.id);
    }
}

function scan() {
    const cards = document.querySelectorAll(
        "ytd-rich-item-renderer, ytd-video-renderer, " +
        "ytd-grid-video-renderer, ytd-compact-video-renderer"
    );

    cards.forEach(card => {
        const video = extractVideo(card);
        if (video) classifyVideo(card, video);
    });
}

let timer;
const observer = new MutationObserver(() => {
    clearTimeout(timer);
    timer = setTimeout(scan, 300);
});

function start() {
    if (!document.body) return setTimeout(start, 500);
    observer.observe(document.body, {childList: true, subtree: true});
    scan();
    setTimeout(scan, 1500);
    setTimeout(scan, 4000);
}

start();
