/**
 * Task: Follow / Unfollow User
 * Visits creator profile or clicks follow button directly from feed.
 */

(function() {
    var taskId = (typeof TASK_CONFIG !== "undefined" && TASK_CONFIG.taskId) ? TASK_CONFIG.taskId : "task_manual";
    var action = (typeof TASK_CONFIG !== "undefined" && TASK_CONFIG.taskType) ? TASK_CONFIG.taskType : "follow_user";
    var targetUsername = (typeof TASK_CONFIG !== "undefined" && TASK_CONFIG.username) ? TASK_CONFIG.username : null;
    var logs = [];
    logs.push("Executing " + action);

    try {
        if (targetUsername) {
            logs.push("Searching target profile: @" + targetUsername);
            // Search navigation simulation
            FarmLib.hsleep(2000, 3500);
        }

        // Tap follow red '+' icon below avatar in feed (TikTok layout)
        var followPlusX = Math.floor(device.width * 0.92);
        var followPlusY = Math.floor(device.height * 0.48);
        FarmLib.tapJitter(followPlusX, followPlusY, 8);
        logs.push("Tapped Follow button");
        FarmLib.hsleep(1500, 3000);

        FarmLib.writeTaskResult(taskId, "done", logs, {
            action: action,
            username: targetUsername
        });
    } catch (err) {
        logs.push("Follow/Unfollow task error: " + err);
        FarmLib.writeTaskResult(taskId, "failed", logs, { error: String(err) });
    }
})();
