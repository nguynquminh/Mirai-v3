const {
    createReadStream,
    existsSync,
    mkdirSync,
    readdirSync
} = require("fs-extra");
const path = require("path");
const moment = require("moment-timezone");

// Track recently processed leave events to prevent duplicates
const processedLeaves = new Set();

module.exports.config = {
    name: "leaveNoti",
    eventType: ["log:unsubscribe"],
    version: "1.1.0",
    credits: "Ranz",
    description: "Thông báo khi người dùng rời khỏi nhóm",
    dependencies: {
        "fs-extra": "",
        "path": "",
        "moment-timezone": ""
    }
};

module.exports.onLoad = function() {
    const cachePaths = [
        path.join(__dirname, "cache", "leaveGif"),
        path.join(__dirname, "cache", "leaveGif", "randomgif")
    ];

    cachePaths.forEach(cachePath => {
        if (!existsSync(cachePath)) {
            mkdirSync(cachePath, {
                recursive: true
            });
        }
    });
};

module.exports.run = async function({
    api,
    event,
    Users,
    Threads
}) {
    try {
        const {
            threadID,
            messageID
        } = event;
        const botID = api.getCurrentUserID();
        const iduser = event.logMessageData.leftParticipantFbId;

        // Create a unique identifier for this leave event
        const eventIdentifier = `${threadID}_${iduser}_${event.timestamp}`;

        // Check if we've already processed this event
        if (processedLeaves.has(eventIdentifier)) {
            return;
        }
        processedLeaves.add(eventIdentifier);

        // Clean up old entries to prevent memory leaks
        if (processedLeaves.size > 1000) {
            const oldest = Array.from(processedLeaves).slice(0, 100);
            oldest.forEach(id => processedLeaves.delete(id));
        }

        // Ignore if bot leaves
        if (iduser === botID) return;

        // Get thread and user data
        const threadDataCache = global.data.threadData.get(parseInt(threadID)) ||
            (await Threads.getData(threadID)).data;
        const userData = await Users.getData(event.author);
        const nameAuthor = userData.name || "";
        const name = global.data.userName.get(iduser) || await Users.getNameUser(iduser);

        // Determine leave type
        const leaveType = (event.author == iduser) ?
            "đã tự rời khỏi nhóm" :
            `đã bị ${nameAuthor} kick khỏi nhóm`;

        // Format current time
        const time = moment.tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY ⏰ HH:mm:ss");

        // Custom message handling
        const defaultMsg = `{name} {type}\n\n🔗 Link FB: https://www.facebook.com/profile.php?id={iduser}\n⏰ Thời gian: {time}`;
        const msg = (threadDataCache.customLeave || defaultMsg)
            .replace(/\{name}/g, name)
            .replace(/\{type}/g, leaveType)
            .replace(/\{iduser}/g, iduser)
            .replace(/\{author}/g, nameAuthor)
            .replace(/\{time}/g, time);

        // Try to send media attachment if available
        try {
            const mediaPath = path.join(__dirname, "cache", "leaveGif", "randomgif");
            if (existsSync(mediaPath)) {
                const files = readdirSync(mediaPath).filter(file => [".gif", ".png", ".jpg", ".jpeg", ".mp4"].some(ext => file.toLowerCase().endsWith(ext)));

                if (files.length > 0) {
                    const randomFile = files[Math.floor(Math.random() * files.length)];
                    const attachment = createReadStream(path.join(mediaPath, randomFile));

                    return api.sendMessage({
                        body: msg,
                        attachment: attachment
                    }, threadID, () => {
                        // Mark as successfully sent
                        processedLeaves.delete(eventIdentifier);
                    });
                }
            }
        } catch (mediaError) {
            console.log("Media error, sending text only:", mediaError);
        }

        // Fallback to text message
        return api.sendMessage(msg, threadID, () => {
            // Mark as successfully sent
            processedLeaves.delete(eventIdentifier);
        });

    } catch (error) {
        console.error("Leave notification error:", error);
    }
};
