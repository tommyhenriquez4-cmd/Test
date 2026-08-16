/**
 * Task: Watch Video
 * Watches the active video for a specific duration with micro-gestures.
 */

(function() {
    var taskId = (typeof TASK_CONFIG !== "undefined" && TASK_CONFIG.taskId) ? TASK_CONFIG.taskId : "task_manual";
    var durationSec = (typeof TASK_CONFIG !== "undefined" && TASK_CONFIG.duration_sec) ? TASK_CONFIG.duration_sec : 45;
    var logs = [];
    logs.push("Starting watch_video task for " + durationSec + " seconds");

    try {
        var elapsed = 0;
        while (elapsed < durationSec) {
            var chunk = Math.min(10, durationSec - elapsed);
            FarmLib.hsleep(chunk * 1000, chunk * 1000 + 500);
            elapsed += chunk;
            
            // Subtle slight screen tap / micro-shift to prevent screen timeout
            if (Math.random() < 0.3) {
                var randomX = Math.floor(device.width * (0.3 + Math.random() * 0.4));
                var randomY = Math.floor(device.height * (0.3 + Math.random() * 0.4));
                press(randomX, randomY, 40);
            }
            logs.push("Watched " + elapsed + "s / " + durationSec + "s");
        }

        FarmLib.writeTaskResult(taskId, "done", logs, { watchedSeconds: durationSec });
    } catch (err) {
        logs.push("Watch video error: " + err);
        FarmLib.writeTaskResult(taskId, "failed", logs, { error: String(err) });
    }
})();
