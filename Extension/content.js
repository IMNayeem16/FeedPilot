console.log("FeedPilot AI is running!");

const processedVideos = new Set();


// ==========================================
// USER POLICY
// ==========================================

const userPolicy = {

    preferredTopics: [
        "programming",
        "game development",
        "godot",
        "python"
    ],

    blockedTopics: [
        "reaction",
        "prank",
        "clickbait",
        "pokemon"
    ],

    preferLongVideos: true,
    allowShorts: false
};


// ==========================================
// EXTRACT VIDEO INFORMATION
// ==========================================

function extractVideo(videoCard) {

    const link = videoCard.querySelector(
        'a[href*="/watch?v="]'
    );

    if (!link) {
        return null;
    }

    const url = link.href;

    let videoId;

    try {

        const urlObject = new URL(url);

        videoId = urlObject.searchParams.get("v");

    } catch (error) {

        return null;
    }

    if (!videoId) {
        return null;
    }


    // TITLE

    const titleElement =
        videoCard.querySelector("#video-title") ||
        videoCard.querySelector('[title]');

    const title =
        titleElement?.getAttribute("title") ||
        titleElement?.textContent?.trim() ||
        "Unknown title";


    // CHANNEL

    const channelElement =
        videoCard.querySelector("ytd-channel-name");

    const channel =
        channelElement?.textContent?.trim() ||
        "Unknown channel";


    // THUMBNAIL

    const thumbnailElement =
        videoCard.querySelector("img");

    const thumbnail =
        thumbnailElement?.src ||
        "";


    // DURATION

    const durationElement =
        videoCard.querySelector(
            "ytd-thumbnail-overlay-time-status-renderer"
        );

    const duration =
        durationElement?.textContent?.trim() ||
        "Unknown";


    return {

        id: videoId,

        title: title,

        channel: channel,

        url: url,

        thumbnail: thumbnail,

        duration: duration

    };
}


// ==========================================
// CALCULATE RECOMMENDATION SCORE
// ==========================================

function calculateScore(video) {

    let score = 50;

    const text = (
        video.title +
        " " +
        video.channel
    ).toLowerCase();


    // --------------------------------------
    // PREFERRED TOPICS
    // --------------------------------------

    userPolicy.preferredTopics.forEach((topic) => {

        if (text.includes(topic.toLowerCase())) {

            score += 15;

        }

    });


    // --------------------------------------
    // BLOCKED TOPICS
    // --------------------------------------

    userPolicy.blockedTopics.forEach((topic) => {

        if (text.includes(topic.toLowerCase())) {

            score -= 40;

        }

    });


    // --------------------------------------
    // SHORTS
    // --------------------------------------

    if (!userPolicy.allowShorts) {

        if (video.duration !== "Unknown") {

            const parts = video.duration.split(":");

            let seconds = 0;

            if (parts.length === 2) {

                seconds =
                    Number(parts[0]) * 60 +
                    Number(parts[1]);

            }

            if (seconds <= 60) {

                score -= 40;

            }
        }
    }


    // Keep score between 0 and 100

    score = Math.max(
        0,
        Math.min(100, score)
    );

    return score;
}


// ==========================================
// CHECK SEARCH QUERY
// ==========================================

function isBlockedSearch() {

    const url = new URL(window.location.href);

    if (url.pathname !== "/results") {
        return false;
    }

    const searchQuery =
        url.searchParams
            .get("search_query")
            ?.toLowerCase() || "";


    return userPolicy.blockedTopics.some((topic) => {

        return searchQuery.includes(
            topic.toLowerCase()
        );

    });
}


// ==========================================
// HIDE VIDEO
// ==========================================

function hideVideo(videoCard, reason) {

    videoCard.style.display = "none";

    console.log(
        "🚫 FeedPilot blocked video:",
        reason
    );
}


// ==========================================
// SCAN VIDEOS
// ==========================================

function scanVideos() {

    const videoCards = document.querySelectorAll(
        "ytd-rich-item-renderer, ytd-video-renderer"
    );


    console.log(
        `FeedPilot found ${videoCards.length} video cards.`
    );


    // --------------------------------------
    // BLOCK ENTIRE SEARCH
    // --------------------------------------

    const blockedSearch = isBlockedSearch();


    videoCards.forEach((card) => {

        const video = extractVideo(card);

        if (!video) {
            return;
        }


        // ----------------------------------
        // SEARCH QUERY BLOCK
        // ----------------------------------

        if (blockedSearch) {

            hideVideo(
                card,
                "Blocked search topic"
            );

            return;
        }


        // ----------------------------------
        // DON'T PROCESS TWICE
        // ----------------------------------

        if (processedVideos.has(video.id)) {

            return;

        }

        processedVideos.add(video.id);


        // ----------------------------------
        // SCORE VIDEO
        // ----------------------------------

        const score =
            calculateScore(video);


        console.log(
            "🎬 Video analyzed:",
            {
                ...video,
                recommendationScore: score
            }
        );


        // ----------------------------------
        // HIDE LOW-SCORING VIDEOS
        // ----------------------------------

        if (score < 40) {

            hideVideo(
                card,
                `Low recommendation score: ${score}`
            );

        }

    });
}


// ==========================================
// INITIAL SCANS
// ==========================================

setTimeout(scanVideos, 1000);

setTimeout(scanVideos, 3000);

setTimeout(scanVideos, 5000);


// ==========================================
// WATCH FOR DYNAMIC CONTENT
// ==========================================

const observer =
    new MutationObserver(() => {

        scanVideos();

    });


observer.observe(document.body, {

    childList: true,

    subtree: true

});