/**
 * Autox.js Farm Automation Anti-Detection & Core Utility Library
 * Provides humanized touch, randomized delays, bezier swipes,
 * and robust task result writing.
 */

var FarmLib = {
    // 1. Humanized Sleep with Gaussian / Uniform jitter
    hsleep: function(minMs, maxMs) {
        if (!maxMs) maxMs = minMs * 1.3;
        var duration = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
        sleep(duration);
        return duration;
    },

    // 2. Randomized Tap with Coordinate Jitter (Prevents pinpoint macro detection)
    tapJitter: function(x, y, radius) {
        radius = radius || 8;
        var offsetX = Math.floor((Math.random() - 0.5) * 2 * radius);
        var offsetY = Math.floor((Math.random() - 0.5) * 2 * radius);
        var targetX = Math.max(10, Math.min(device.width - 10, x + offsetX));
        var targetY = Math.max(10, Math.min(device.height - 10, y + offsetY));
        
        // Touch down with slight human press duration (50ms - 130ms)
        var pressTime = Math.floor(Math.random() * 80) + 50;
        press(targetX, targetY, pressTime);
        this.hsleep(150, 300);
        return { x: targetX, y: targetY };
    },

    // 3. Humanized Bezier Curve Swipe (Simulates real thumb gestures)
    humanSwipe: function(x1, y1, x2, y2, durationMs) {
        durationMs = durationMs || (Math.floor(Math.random() * 200) + 350);
        
        // Add random control point for organic curved trajectory
        var deviation = (Math.random() - 0.5) * 80;
        var midX = (x1 + x2) / 2 + deviation;
        var midY = (y1 + y2) / 2;

        var points = [];
        var steps = 25;
        for (var i = 0; i <= steps; i++) {
            var t = i / steps;
            // Quadratic Bezier formula: B(t) = (1-t)^2 * P0 + 2(1-t)t * P1 + t^2 * P2
            var bx = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * midX + t * t * x2;
            var by = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * midY + t * t * y2;
            points.push([Math.round(bx), Math.round(by)]);
        }

        gesture(durationMs, points);
        this.hsleep(200, 450);
    },

    // 4. Swipe Up to Next Video (Social media feed swipe)
    swipeNextVideo: function() {
        var startX = Math.floor(device.width * (0.45 + Math.random() * 0.1));
        var startY = Math.floor(device.height * (0.75 + Math.random() * 0.08));
        var endX = Math.floor(device.width * (0.45 + Math.random() * 0.1));
        var endY = Math.floor(device.height * (0.2 + Math.random() * 0.08));
        this.humanSwipe(startX, startY, endX, endY);
    },

    // 5. Type text character-by-character with variable keystroke cadence
    typeTextCharByChar: function(targetText, minDelay, maxDelay) {
        minDelay = minDelay || 80;
        maxDelay = maxDelay || 220;
        
        for (var i = 0; i < targetText.length; i++) {
            var ch = targetText.charAt(i);
            // Autox.js input or key simulation
            input(ch);
            this.hsleep(minDelay, maxDelay);
            
            // Random micro-pause as if user is thinking (every ~8 chars)
            if (Math.random() < 0.12) {
                this.hsleep(300, 700);
            }
        }
    },

    // 6. Safe App Launch
    launchAppSafe: function(appName, pkgName) {
        if (pkgName) {
            app.launchPackage(pkgName);
        } else {
            app.launchApp(appName);
        }
        this.hsleep(3000, 5000);
    },

    // 7. Write Structured JSON Result back to Device SDCard
    // CRITICAL: Uses files.ensureDir(files.getDirName(path)) to avoid directory naming bug
    writeTaskResult: function(taskId, status, logs, data) {
        var resultFilePath = "/sdcard/laixi/results/task_" + taskId + ".json";
        try {
            var dirPath = files.getDirName(resultFilePath);
            files.ensureDir(dirPath);

            var payload = {
                taskId: taskId,
                status: status || "done",
                timestamp: new Date().toISOString(),
                logs: logs || [],
                data: data || {}
            };

            files.write(resultFilePath, JSON.stringify(payload, null, 2));
            log("Task result written to " + resultFilePath);
        } catch (e) {
            log("Error writing task result: " + e);
        }
    }
};
