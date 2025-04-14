const {
    join
} = require("path");
const {
    createReadStream,
    existsSync,
    mkdirSync,
    readdirSync
} = require("fs-extra");
const moment = require("moment-timezone");

module.exports.config = {
    name: "joinNoti",
    eventType: ["log:subscribe"],
    version: "1.1.0",
    credits: "Mirai Team",
    description: "Thông báo khi có thành viên mới tham gia nhóm",
    dependencies: {
        "fs-extra": "",
        "moment-timezone": ""
    }
};

module.exports.run = async function({
    api,
    event,
    Users
}) {
    const {
        threadID
    } = event;
    const botID = api.getCurrentUserID();
    const addedParticipants = event.logMessageData.addedParticipants;

    // Handle bot joining group
    if (addedParticipants.some(p => p.userFbId === botID)) {
        const botName = global.config.BOTNAME || "Kết nối thành công :<";
        await api.changeNickname(`[ ${global.config.PREFIX} ] • ${botName}`, threadID, botID);
        return api.sendMessage("✨ Kết nối thành công! Gõ {prefix}help để xem các lệnh có sẵn ✨"
            .replace(/{prefix}/g, global.config.PREFIX), threadID);
    }

    try {
        // Get thread information
        const {
            threadName,
            participantIDs
        } = await api.getThreadInfo(threadID);
        const threadData = global.data.threadData.get(parseInt(threadID)) || {};

        // Prepare welcome message
        const mentions = [];
        const nameArray = [];
        const memberPositions = [];

        // Process each new member
        for (const [id, participant] of Object.entries(addedParticipants)) {
            const userName = participant.fullName;
            nameArray.push(userName);
            mentions.push({
                tag: userName,
                id
            });
            memberPositions.push(participantIDs.length - Object.keys(addedParticipants).length + parseInt(id) + 1);

            // Create user data if not exists
            if (!global.data.allUserID.includes(id)) {
                await Users.createData(id, {
                    name: userName,
                    data: {}
                });
                global.data.allUserID.push(id);
                console.log(`New user added to database: ${id}`); // Replaced logger with console.log
            }
        }

        memberPositions.sort((a, b) => a - b);

        // Format current time
        const time = moment.tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY ⏰ HH:mm:ss");

        // Custom welcome message
        const defaultMsg = `🌟 Chào mừng {name} đến với {threadName}!\n\n` +
            `🎉 {type} là thành viên thứ {soThanhVien} của nhóm\n` +
            `⏰ Thời gian tham gia: {time}\n\n` +
            `Chúc {type} có những trải nghiệm vui vẻ! 💖`;

        const msg = (threadData.customJoin || defaultMsg)
            .replace(/\{name}/g, nameArray.join(', '))
            .replace(/\{type}/g, (nameArray.length > 1) ? 'các bạn' : 'bạn')
            .replace(/\{soThanhVien}/g, memberPositions.join(', '))
            .replace(/\{threadName}/g, threadName)
            .replace(/\{time}/g, time);

        // Prepare media attachment
        const mediaPath = join(__dirname, "cache", "joinGif");
        const customGifPath = join(mediaPath, `${threadID}.gif`);

        // Create directory if not exists
        if (!existsSync(mediaPath)) mkdirSync(mediaPath, {
            recursive: true
        });

        // Try to send with custom gif if available
        if (existsSync(customGifPath)) {
            return api.sendMessage({
                body: msg,
                attachment: createReadStream(customGifPath),
                mentions
            }, threadID);
        }

        // Fallback to random gif from directory
        const randomGifs = readdirSync(mediaPath).filter(file => [".gif", ".png", ".jpg", ".jpeg", ".mp4"].some(ext => file.toLowerCase().endsWith(ext)));

        if (randomGifs.length > 0) {
            const randomFile = randomGifs[Math.floor(Math.random() * randomGifs.length)];
            return api.sendMessage({
                body: msg,
                attachment: createReadStream(join(mediaPath, randomFile)),
                mentions
            }, threadID);
        }

        // Final fallback to text only
        return api.sendMessage({
            body: msg,
            mentions
        }, threadID);

    } catch (error) {
        console.error("Join notification error:", error);
    }
};
