/**
 * Task: Scroll Feed
 * Performs N humanized swipes with organic dwell times.
 */

(function() {
    var taskId = (typeof TASK_CONFIG !== "undefined" && TASK_CONFIG.taskId) ? TASK_CONFIG.taskId : "task_manual";
    var scrollCount = (typeof TASK_CONFIG !== "undefined" && TASK_CONFIG.scroll_count) ? TASK_CONFIG.scroll_count : 10;
    var logs = [];
    logs.push("Starting scroll_feed task with target " + scrollCount + " swipes");

    try {
        for (var i = 1; i <= scrollCount; i++) {
            var dwellMs = FarmLib.hsleep(3000, 9000);
            FarmLib.swipeNextVideo();
            logs.push("Swiped to video #" + i + " (Dwell: " + Math.round(dwellMs / 1000) + "s)");
            FarmLib.hsleep(1000, 2000);
        }

        FarmLib.writeTaskResult(taskId, "done", logs, { swipedCount: scrollCount });
    } catch (err) {
        logs.push("Scroll feed error: " + err);
        FarmLib.writeTaskResult(taskId, "failed", logs, { error: String(err) });
    }
})();
