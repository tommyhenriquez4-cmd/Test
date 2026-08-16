/**
 * Task: Like Post
 * Likes currently open post via double tap or heart icon selector with jitter.
 */

(function() {
    var taskId = (typeof TASK_CONFIG !== "undefined" && TASK_CONFIG.taskId) ? TASK_CONFIG.taskId : "task_manual";
    var method = (typeof TASK_CONFIG !== "undefined" && TASK_CONFIG.method) ? TASK_CONFIG.method : "double_tap";
    var logs = [];
    logs.push("Executing like_post task (Method: " + method + ")");

    try {
        if (method === "double_tap") {
            var centerX = device.width / 2;
            var centerY = device.height / 2;
            FarmLib.tapJitter(centerX, centerY, 25);
            FarmLib.hsleep(110, 180);
            FarmLib.tapJitter(centerX, centerY, 25);
            logs.push("Performed double tap like");
        } else {
            // Heart button coordinate
            var heartX = Math.floor(device.width * 0.92);
            var heartY = Math.floor(device.height * 0.55);
            FarmLib.tapJitter(heartX, heartY, 12);
            logs.push("Tapped heart icon directly");
        }

        FarmLib.hsleep(1500, 3000);
        FarmLib.writeTaskResult(taskId, "done", logs, { liked: true });
    } catch (err) {
        logs.push("Like post error: " + err);
        FarmLib.writeTaskResult(taskId, "failed", logs, { error: String(err) });
    }
})();
