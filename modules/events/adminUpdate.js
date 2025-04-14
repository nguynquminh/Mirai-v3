module.exports.config = {
    name: "adminUpdate",
    eventType: ["log:thread-admins", "log:thread-name", "log:user-nickname", "log:thread-icon", "log:thread-color"],
    version: "2.0.0",
    credits: "Mirai Team",
    description: "Cập nhật thông tin nhóm",
    envConfig: {
        autoUnsend: true,
        sendNoti: true,
        timeToUnsend: 10,
        allowChangeNickname: [] // Danh sách threadID được phép đổi biệt danh
    }
};

module.exports.run = async function({
    event,
    api,
    Threads,
    Users
}) {
    const fs = require("fs-extra");
    const path = require("path");

    // Tạo file lưu trữ icon nếu chưa có
    const iconPath = path.join(__dirname, "cache", "thread_icons.json");
    if (!fs.existsSync(iconPath)) {
        fs.ensureFileSync(iconPath);
        fs.writeFileSync(iconPath, JSON.stringify({}));
    }

    const {
        threadID,
        logMessageType,
        logMessageData,
        author
    } = event;
    const {
        setData,
        getData
    } = Threads;

    // Kiểm tra có cho phép cập nhật trong nhóm này không
    const thread = global.data.threadData.get(threadID) || {};
    if (typeof thread["adminUpdate"] != "undefined" && thread["adminUpdate"] == false) return;

    try {
        let dataThread = (await getData(threadID)).threadInfo;
        if (!dataThread) dataThread = {
            adminIDs: [],
            nicknames: {}
        };

        // Hàm tạo thông báo đẹp
        const createNotification = (title, content) => {
            return `╭─── 𝗧𝗛𝗢̂𝗡𝗚 𝗕𝗔́𝗢 𝗖𝗔̣̂𝗣 𝗡𝗛𝗔̣̂𝗧 ────•
│
│ 𝗡𝗵𝗼́𝗺: ${dataThread.threadName || "Chưa đặt tên"}
│ 𝗜𝗗: ${threadID}
│
│ 𝗧𝗶𝗲̂𝗻 𝗶́𝗰𝗵: ${title}
│ ${content}
│
│ 𝗧𝗵𝗼̛̀𝗶 𝗴𝗶𝗮𝗻: ${new Date().toLocaleString("vi-VN")}
╰───────────────────•`;
        };

        // Hàm gửi thông báo có tự động gỡ
        const sendNotification = async (message) => {
            if (!global.configModule[this.config.name].sendNoti) return;

            const info = await api.sendMessage(message, threadID);
            if (global.configModule[this.config.name].autoUnsend) {
                setTimeout(() => {
                    api.unsendMessage(info.messageID);
                }, global.configModule[this.config.name].timeToUnsend * 1000);
            }
        };

        switch (logMessageType) {
            case "log:thread-admins": {
                const targetName = await Users.getNameUser(logMessageData.TARGET_ID).catch(() => logMessageData.TARGET_ID);
                if (logMessageData.ADMIN_EVENT == "add_admin") {
                    dataThread.adminIDs.push({
                        id: logMessageData.TARGET_ID
                    });
                    const msg = createNotification(
                        "𝗧𝗛𝗘̂𝗠 𝗤𝗨𝗔̉𝗡 𝗧𝗥𝗜̣ 𝗩𝗜𝗘̂𝗡",
                        `✅ 𝗡𝗴𝘂̛𝗼̛̀𝗶 𝗱𝘂̀𝗻𝗴: ${targetName}\n🆔 𝗜𝗗: ${logMessageData.TARGET_ID}`
                    );
                    await sendNotification(msg);
                } else if (logMessageData.ADMIN_EVENT == "remove_admin") {
                    dataThread.adminIDs = dataThread.adminIDs.filter(item => item.id != logMessageData.TARGET_ID);
                    const msg = createNotification(
                        "𝗚𝗢̛̃ 𝗤𝗨𝗔̉𝗡 𝗧𝗥𝗜̣ 𝗩𝗜𝗘̂𝗡",
                        `❌ 𝗡𝗴𝘂̛𝗼̛̀𝗶 𝗱𝘂̀𝗻𝗴: ${targetName}\n🆔 𝗜𝗗: ${logMessageData.TARGET_ID}`
                    );
                    await sendNotification(msg);
                }
                break;
            }

            case "log:user-nickname": {
                const participantName = await Users.getNameUser(logMessageData.participant_id).catch(() => logMessageData.participant_id);
                const authorName = await Users.getNameUser(author).catch(() => author);

                // Kiểm tra quyền thay đổi biệt danh
                const canChangeNickname = (
                    global.configModule["adminUpdate"].allowChangeNickname.includes(threadID) ||
                    dataThread.adminIDs.some(item => item.id == author) ||
                    author == api.getCurrentUserID()
                );

                if (!canChangeNickname) return;

                dataThread.nicknames[logMessageData.participant_id] = logMessageData.nickname;
                const newNickname = logMessageData.nickname || "tên gốc";

                const msg = createNotification(
                    "𝗧𝗛𝗔𝗬 𝗗𝗢̂̉𝗜 𝗕𝗜𝗘̣̂𝗧 𝗗𝗔𝗡𝗛",
                    `👤 𝗧𝗵𝗮̀𝗻𝗵 𝘃𝗶𝗲̂𝗻: ${participantName}\n🆔 𝗜𝗗: ${logMessageData.participant_id}\n✏️ 𝗕𝗶𝗲̣̂𝘁 𝗱𝗮𝗻𝗵 𝗺𝗼̛́𝗶: ${newNickname}\n👮 𝗡𝗴𝘂̛𝗼̛̀𝗶 𝘁𝗵𝗮𝘆 đ𝗼̂̉𝗶: ${authorName}`
                );
                await sendNotification(msg);
                break;
            }

            case "log:thread-name": {
                dataThread.threadName = event.logMessageData.name || "Không tên";
                const authorName = await Users.getNameUser(author).catch(() => author);

                const msg = createNotification(
                    "𝗧𝗛𝗔𝗬 𝗗𝗢̂̉𝗜 𝗧𝗘̂𝗡 𝗡𝗛𝗢́𝗠",
                    `🆔 𝗧𝗲̂𝗻 𝗺𝗼̛́𝗶: ${dataThread.threadName}\n👮 𝗡𝗴𝘂̛𝗼̛̀𝗶 𝘁𝗵𝗮𝘆 đ𝗼̂̉𝗶: ${authorName}`
                );
                await sendNotification(msg);
                break;
            }

            case "log:thread-icon": {
                const preIcon = fs.readJsonSync(iconPath);
                dataThread.threadIcon = event.logMessageData.thread_icon || "👍";
                const authorName = await Users.getNameUser(author).catch(() => author);

                const msg = createNotification(
                    "𝗧𝗛𝗔𝗬 𝗗𝗢̂̉𝗜 𝗜𝗖𝗢𝗡 𝗡𝗛𝗢́𝗠",
                    `🆕 𝗜𝗰𝗼𝗻 𝗺𝗼̛́𝗶: ${dataThread.threadIcon}\n🆔 𝗜𝗰𝗼𝗻 𝗰𝘂̃: ${preIcon[threadID] || "không rõ"}\n👮 𝗡𝗴𝘂̛𝗼̛̀𝗶 𝘁𝗵𝗮𝘆 đ𝗼̂̉𝗶: ${authorName}`
                );

                preIcon[threadID] = dataThread.threadIcon;
                fs.writeJsonSync(iconPath, preIcon);
                await sendNotification(msg);
                break;
            }

            case "log:thread-color": {
                dataThread.threadColor = event.logMessageData.thread_color || "🌤";
                const authorName = await Users.getNameUser(author).catch(() => author);

                const msg = createNotification(
                    "𝗧𝗛𝗔𝗬 𝗗𝗢̂̉𝗜 𝗠𝗔̀𝗨 𝗡𝗛𝗢́𝗠",
                    `🎨 𝗠𝗮̀𝘂 𝗺𝗼̛́𝗶: ${dataThread.threadColor}\n👮 𝗡𝗴𝘂̛𝗼̛̀𝗶 𝘁𝗵𝗮𝘆 đ𝗼̂̉𝗶: ${authorName}`
                );
                await sendNotification(msg);
                break;
            }
        }

        await setData(threadID, {
            threadInfo: dataThread
        });
    } catch (error) {
        console.error("AdminUpdate Error:", error);
    }
};
