/**
 * Task: Warmup Session (Прогрев аккаунта)
 * Algorithm:
 * - Loops N video views (default 8 - 15)
 * - Watches each video 20-45 seconds (or randomized retention)
 * - 40% chance to like the video with human jitter
 * - 15% chance to peek into comment section and scroll
 * - Human bezier swipe to the next video
 */

(function() {
    var taskId = (typeof TASK_CONFIG !== "undefined" && TASK_CONFIG.taskId) ? TASK_CONFIG.taskId : "task_manual";
    var platform = (typeof TASK_CONFIG !== "undefined" && TASK_CONFIG.platform) ? TASK_CONFIG.platform : "tiktok";
    var totalVideos = (typeof TASK_CONFIG !== "undefined" && TASK_CONFIG.video_count) ? TASK_CONFIG.video_count : (Math.floor(Math.random() * 6) + 8);
    var likeProbability = (typeof TASK_CONFIG !== "undefined" && TASK_CONFIG.like_probability) ? TASK_CONFIG.like_probability : 0.40;

    var logs = [];
    logs.push("Starting warmup session for platform: " + platform + " (" + totalVideos + " videos target)");

    try {
        // 1. Launch target social app
        if (platform === "tiktok") {
            FarmLib.launchAppSafe("TikTok", "com.zhiliaoapp.musically");
        } else if (platform === "instagram") {
            FarmLib.launchAppSafe("Instagram", "com.instagram.android");
        } else {
            FarmLib.launchAppSafe("YouTube", "com.google.android.youtube");
        }

        var likesCount = 0;
        var commentsViewed = 0;

        for (var i = 1; i <= totalVideos; i++) {
            // Watch video for randomized 18 to 42 seconds
            var watchTimeMs = FarmLib.hsleep(18000, 42000);
            logs.push("Watched video #" + i + " for " + Math.round(watchTimeMs / 1000) + "s");

            // Random chance to like video
            if (Math.random() < likeProbability) {
                // Double tap near center of screen with jitter
                var centerX = device.width / 2;
                var centerY = device.height / 2;
                FarmLib.tapJitter(centerX, centerY, 20);
                FarmLib.hsleep(120, 200);
                FarmLib.tapJitter(centerX, centerY, 20);
                likesCount++;
                logs.push("Liked video #" + i + " (Double tap)");
                FarmLib.hsleep(1000, 2500);
            }

            // 15% chance to open comments and scroll briefly
            if (Math.random() < 0.15) {
                // Tap comment icon area (approx right sidebar)
                var commentX = Math.floor(device.width * 0.92);
                var commentY = Math.floor(device.height * 0.65);
                FarmLib.tapJitter(commentX, commentY, 10);
                FarmLib.hsleep(2000, 3500);
                
                // Scroll comments once
                FarmLib.humanSwipe(device.width * 0.5, device.height * 0.7, device.width * 0.5, device.height * 0.3);
                FarmLib.hsleep(2500, 4000);
                
                // Close comments with Back press
                back();
                commentsViewed++;
                FarmLib.hsleep(1200, 2000);
            }

            // Swipe to next video
            FarmLib.swipeNextVideo();
            FarmLib.hsleep(1500, 3000);
        }

        logs.push("Warmup completed. Total watched: " + totalVideos + ", Likes: " + likesCount + ", Comments peeked: " + commentsViewed);
        FarmLib.writeTaskResult(taskId, "done", logs, {
            totalWatched: totalVideos,
            totalLikes: likesCount,
            commentsViewed: commentsViewed
        });

    } catch (err) {
        logs.push("Warmup task failed with error: " + err);
        FarmLib.writeTaskResult(taskId, "failed", logs, { error: String(err) });
    }
})();
