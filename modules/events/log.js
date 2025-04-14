module.exports.config = {
    name: "log",
    eventType: ["log:unsubscribe", "log:subscribe", "log:thread-name"],
    version: "1.3.0",
    credits: "Mirai Team",
    description: "Ghi lại thông báo các hoạt động của bot với tên nhóm chính xác",
    envConfig: {
        enable: true
    }
};

module.exports.run = async function({
    api,
    event,
    Users,
    Threads
}) {
    const logger = require("../../utils/log");
    if (!global.configModule[this.config.name].enable) return;

    const {
        threadID
    } = event;
    const botID = api.getCurrentUserID();
    const moment = require("moment-timezone");
    const time = moment.tz("Asia/Ho_Chi_Minh").format("D/MM/YYYY HH:mm:ss");

    try {
        // Lấy thông tin nhóm chính xác theo cách bạn đề xuất
        let threadInfo;
        try {
            threadInfo = await api.getThreadInfo(threadID);
        } catch (e) {
            threadInfo = {
                threadName: "Nhóm không xác định"
            };
        }

        const nameUser = global.data.userName.get(event.author) || await Users.getNameUser(event.author).catch(() => "Người dùng không xác định");

        // Tạo format thông báo đẹp mắt với tên nhóm chính xác
        const createNotification = (title, content) => {
            return `╭─── 𝗧𝗛𝗢̂𝗡𝗚 𝗕𝗔́𝗢 ────•
│
│ 𝗡𝗮𝗺𝗲 𝗻𝗵𝗼́𝗺: ${threadInfo.threadName}
│ 𝗜𝗗 𝗻𝗵𝗼́𝗺: ${threadID}
│
│ 𝗡𝗼̣̂𝗶 𝗱𝘂𝗻𝗴: ${title}
│ ${content}
│
│ 𝗧𝗵𝗼̛̀𝗶 𝗴𝗶𝗮𝗻: ${time}
╰───────────────────•`;
        };

        let title = "";
        let content = "";
        let shouldSend = true;

        switch (event.logMessageType) {
            case "log:thread-name": {
                const newName = event.logMessageData.name || "Không có tên";
                title = "𝗧𝗵𝗮𝘆 𝗱𝗼̂̉𝗶 𝘁𝗲̂𝗻 𝗻𝗵𝗼́𝗺";
                content = `𝗧𝗲̂𝗻 𝗺𝗼̛́𝗶: ${newName}`;
                await Threads.setData(threadID, {
                    name: newName
                });
                break;
            }

            case "log:subscribe": {
                if (event.logMessageData.addedParticipants.some(i => i.userFbId == botID)) {
                    title = "𝗕𝗼𝘁 𝗱𝘂̛𝗼̛̣𝗰 𝘁𝗵𝗲̂𝗺 𝘃𝗮̀𝗼 𝗻𝗵𝗼́𝗺 𝗺𝗼̛́𝗶";
                    content = `𝗡𝗴𝘂̛𝗼̛̀𝗶 𝘁𝗵𝗲̂𝗺: ${nameUser}`;

                    // Tự động đổi biệt danh
                    const botName = global.config.BOTNAME || "Bot";
                    await api.changeNickname(`[ ${global.config.PREFIX} ] • ${botName}`, threadID, botID);
                } else {
                    shouldSend = false;
                }
                break;
            }

            case "log:unsubscribe": {
                if (event.logMessageData.leftParticipantFbId == botID) {
                    if (event.senderID == botID) return;

                    title = "𝗕𝗼𝘁 𝗯𝗶̣ 𝗸𝗶𝗰𝗸 𝗸𝗵𝗼̉𝗶 𝗻𝗵𝗼́𝗺";
                    content = `𝗡𝗴𝘂̛𝗼̛̀𝗶 𝘁𝗵𝘂̛̣𝗰 𝗵𝗶𝗲̣̂𝗻: ${nameUser}`;

                    // Tự động cấm nhóm
                    const data = (await Threads.getData(threadID)).data || {};
                    data.banned = true;
                    data.reason = "Tự động cấm do kick bot";
                    data.dateAdded = time;
                    await Threads.setData(threadID, {
                        data
                    });
                    global.data.threadBanned.set(threadID, data);
                } else {
                    shouldSend = false;
                }
                break;
            }

            default:
                shouldSend = false;
        }

        if (!shouldSend) return;

        const finalMessage = createNotification(title, content);

        // Gửi đến tất cả admin
        for (const adminID of global.config.ADMINBOT) {
            await api.sendMessage(finalMessage, adminID, (error) => {
                if (error) logger(finalMessage, "[LOG ERROR]");
            });
            await new Promise(resolve => setTimeout(resolve, 300));
        }

    } catch (error) {
        logger(`[LOGGER ERROR] ${error.message}`, "ERROR");
    }
};
