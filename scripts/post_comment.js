/**
 * Task: Post Comment / Reply Comment
 * Opens comments, focuses input, enters AI-generated text character-by-character, and submits.
 */

(function() {
    var taskId = (typeof TASK_CONFIG !== "undefined" && TASK_CONFIG.taskId) ? TASK_CONFIG.taskId : "task_manual";
    var commentText = (typeof TASK_CONFIG !== "undefined" && TASK_CONFIG.comment_text) ? TASK_CONFIG.comment_text : "Great content! 🔥 Keep it up!";
    var isReply = (typeof TASK_CONFIG !== "undefined" && TASK_CONFIG.is_reply) ? true : false;
    var logs = [];
    logs.push("Starting " + (isReply ? "reply_comment" : "post_comment") + " task");

    try {
        // 1. Tap comments icon
        var commentIconX = Math.floor(device.width * 0.92);
        var commentIconY = Math.floor(device.height * 0.65);
        FarmLib.tapJitter(commentIconX, commentIconY, 12);
        logs.push("Opened comment sheet");
        FarmLib.hsleep(2000, 3500);

        // 2. Tap 'Add comment...' input bar (bottom of sheet)
        var inputBarX = Math.floor(device.width * 0.35);
        var inputBarY = Math.floor(device.height * 0.94);
        FarmLib.tapJitter(inputBarX, inputBarY, 15);
        logs.push("Focused comment input field");
        FarmLib.hsleep(1500, 2500);

        // 3. Humanized typing
        FarmLib.typeTextCharByChar(commentText, 70, 190);
        logs.push("Typed comment: '" + commentText + "'");
        FarmLib.hsleep(1500, 3000);

        // 4. Tap Send button (Right arrow on keyboard or comment bar)
        var sendBtnX = Math.floor(device.width * 0.92);
        var sendBtnY = Math.floor(device.height * 0.58);
        FarmLib.tapJitter(sendBtnX, sendBtnY, 12);
        logs.push("Submitted comment");
        FarmLib.hsleep(2000, 4000);

        // Close comments
        back();
        FarmLib.hsleep(1000, 2000);

        FarmLib.writeTaskResult(taskId, "done", logs, {
            comment: commentText,
            timestamp: new Date().toISOString()
        });

    } catch (err) {
        logs.push("Comment task error: " + err);
        FarmLib.writeTaskResult(taskId, "failed", logs, { error: String(err) });
    }
})();
