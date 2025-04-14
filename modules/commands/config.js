const fs = require("fs-extra");
const moment = require("moment-timezone");
const axios = require("axios");

module.exports.config = {
    name: "config",
    version: "1.0.3",
    hasPermssion: 2,
    credits: "Thiệu Trung Kiên",
    description: "Command Prompt",
    commandCategory: "Hệ thống admin-bot",
    cooldowns: 5,
    dependencies: {
        axios: ""
    }
};

module.exports.languages = {
    vi: {
        returnResult: "Đây là kết quả phù hợp: \n",
        returnNull: "Không tìm thấy kết quả dựa vào tìm kiếm của bạn!"
    },
    en: {
        returnResult: "This is your result: \n",
        returnNull: "There is no result with your input!"
    }
};

module.exports.handleEvent = async function({
    api,
    event
}) {
    const moment = require("moment-timezone");
    const currentTime = moment.tz("Asia/Ho_Chi_Minh").format("HH:mm:ss");
    const seconds = moment.tz("Asia/Ho_Chi_Minh").format("ss");
    const adminList = global.config.ADMINBOT;

    if (currentTime === `12:00:${seconds}` && seconds < 6) {
        for (const adminID of adminList) {
            setTimeout(() => {
                api.sendMessage(
                    `〉Bây giờ là: ${currentTime}\n[❗] Bot sẽ tiến hành khởi động lại !`,
                    adminID,
                    () => process.exit(1)
                );
            }, 1000);
        }
    }
};

module.exports.run = async function({
    api,
    event,
    args
}) {
    if (!args[0]) {
        const message =
            "🛠 | Đây là toàn bộ cài đặt của bot | 🛠\n" +
            "=== Quản Lý Cài Đặt ===\n" +
            "[1] Prefix.\n" +
            "[2] Tên bot.\n" +
            "[3] Danh sách Admin.\n" +
            "[4] Ngôn ngữ.\n" +
            "[5] Tự khởi động lại.\n" +
            "=== Quản Lý Hoạt Động ===\n" +
            "[6] Kiểm tra cập nhật.\n" +
            "[7] Lấy danh sách người dùng bị cấm.\n" +
            "[8] Lấy danh sách nhóm bị cấm.\n" +
            "[9] Gửi thông báo tới tất cả các nhóm.\n" +
            "[10]. Tìm kiếm UID thông qua tên người dùng.\n" +
            "[11]. Tìm kiếm TID box qua tên box\n" +
            "[12]. Đổi emoji box\n" +
            "[13]. Đổi tên box\n" +
            "[14]. Xem info box\n" +
            "-> Để chọn, hãy reply tin nhắn này với số <-";

        return api.sendMessage(message, event.threadID, (err, info) => {
            global.client.handleReply.push({
                name: module.exports.config.name,
                messageID: info.messageID,
                author: event.senderID,
                type: "choose"
            });
        }, event.messageID);
    }
};

module.exports.handleReply = async function({
    api,
    event,
    handleReply,
    Currencies,
    Users,
    Threads
}) {
    const {
        threadID,
        messageID,
        senderID,
        body
    } = event;

    // Kiểm tra người trả lời có phải là người đã gọi lệnh không
    if (senderID !== handleReply.author) return;

    const userInput = body.trim();

    switch (handleReply.type) {
        case "choose": {
            switch (userInput) {
                case "1": {
                    const currentPrefix = global.config.PREFIX;
                    return api.sendMessage(`📌 Prefix hiện tại của bot là: ${currentPrefix}`, threadID, messageID);
                }

                case "2": {
                    const botName = global.config.BOTNAME;
                    return api.sendMessage(`🤖 Tên bot hiện tại là: ${botName}`, threadID, messageID);
                }

                case "3": {
                    const adminList = global.config.ADMINBOT || [];
                    let msg = "📋 Danh sách Admin của bot:\n";
                    for (let i = 0; i < adminList.length; i++) {
                        const userName = await Users.getNameUser(adminList[i]);
                        msg += `${i + 1}. ${userName} (UID: ${adminList[i]})\n`;
                    }
                    return api.sendMessage(msg, threadID, messageID);
                }

                case "4": {
                    const language = global.config.LANGUAGE === "vi" ? "Tiếng Việt" : "English";
                    return api.sendMessage(`🌐 Ngôn ngữ hiện tại của bot là: ${language}`, threadID, messageID);
                }

                case "5": {
                    return api.sendMessage(
                        `🔁 Chức năng này giúp bot tự khởi động lại vào đúng 12:00 mỗi ngày.\n⏱ Hiện trạng: Đã được bật mặc định.`,
                        threadID,
                        messageID
                    );
                }

                case "6": {
                    return api.sendMessage(`🔍 Đang kiểm tra cập nhật...`, threadID, async (err, info) => {
                        try {
                            const response = await axios.get("https://raw.githubusercontent.com/thuetruongkien/config/main/package.json");
                            const latestVersion = response.data.version;
                            const currentVersion = require("./../../package.json").version;

                            if (latestVersion > currentVersion) {
                                return api.sendMessage(`⚠️ Bot có bản cập nhật mới: ${latestVersion}\n🔧 Phiên bản hiện tại: ${currentVersion}`, threadID);
                            } else {
                                return api.sendMessage(`✅ Bot đang sử dụng phiên bản mới nhất (${currentVersion})`, threadID);
                            }
                        } catch (error) {
                            return api.sendMessage(`❌ Không thể kiểm tra cập nhật: ${error.message}`, threadID);
                        }
                    });
                }

                case "7": {
                    const bannedUsers = global.data.userBanned || new Map();
                    if (bannedUsers.size === 0) return api.sendMessage("✅ Hiện tại không có người dùng nào bị cấm.", threadID, messageID);

                    let msg = "🚫 Danh sách người dùng bị cấm:\n";
                    let index = 1;
                    for (const [userID, reason] of bannedUsers) {
                        const name = await Users.getNameUser(userID);
                        msg += `${index++}. ${name} (UID: ${userID}) - Lý do: ${reason.reason || "Không rõ"}\n`;
                    }
                    return api.sendMessage(msg, threadID, messageID);
                }

                case "8": {
                    const bannedThreads = global.data.threadBanned || new Map();
                    if (bannedThreads.size === 0) return api.sendMessage("✅ Hiện tại không có nhóm nào bị cấm.", threadID, messageID);

                    let msg = "🚫 Danh sách nhóm bị cấm:\n";
                    let index = 1;
                    for (const [threadID, info] of bannedThreads) {
                        const name = info.name || "Không rõ tên";
                        msg += `${index++}. ${name} (TID: ${threadID}) - Lý do: ${info.reason || "Không rõ"}\n`;
                    }
                    return api.sendMessage(msg, threadID, messageID);
                }

                case "9": {
                    return api.sendMessage("✉️ Vui lòng reply tin nhắn này với nội dung bạn muốn gửi đến tất cả nhóm.", threadID, (error, info) => {
                        global.client.handleReply.push({
                            name: module.exports.config.name,
                            messageID: info.messageID,
                            author: senderID,
                            type: "broadcast"
                        });
                    }, messageID);
                }

                case "10": {
                    return api.sendMessage("🔍 Nhập tên người dùng để tìm UID.", threadID, (error, info) => {
                        global.client.handleReply.push({
                            name: module.exports.config.name,
                            messageID: info.messageID,
                            author: senderID,
                            type: "getuid"
                        });
                    }, messageID);
                }

                case "11": {
                    return api.sendMessage("🔍 Nhập tên nhóm để tìm TID.", threadID, (error, info) => {
                        global.client.handleReply.push({
                            name: module.exports.config.name,
                            messageID: info.messageID,
                            author: senderID,
                            type: "gettidbox"
                        });
                    }, messageID);
                }

                case "12": {
                    return api.sendMessage("🖼 Nhập emoji bạn muốn đổi cho box này.", threadID, (error, info) => {
                        global.client.handleReply.push({
                            name: module.exports.config.name,
                            messageID: info.messageID,
                            author: senderID,
                            type: "emojibox"
                        });
                    }, messageID);
                }

                case "13": {
                    return api.sendMessage("📝 Nhập tên mới cho box này.", threadID, (error, info) => {
                        global.client.handleReply.push({
                            name: module.exports.config.name,
                            messageID: info.messageID,
                            author: senderID,
                            type: "namebox"
                        });
                    }, messageID);
                }

                case "14": {
                    try {
                        const threadInfo = await Threads.getInfo(threadID);
                        const threadName = threadInfo.threadName || "Không xác định";
                        const threadEmoji = threadInfo.emoji || "Không có";
                        const threadAdmins = threadInfo.adminIDs.map(i => i.id);

                        let adminNames = [];
                        for (const adminID of threadAdmins) {
                            const name = await Users.getNameUser(adminID);
                            adminNames.push(`• ${name} (UID: ${adminID})`);
                        }

                        return api.sendMessage(
                            `📦 Thông tin của box:\n👥 Tên: ${threadName}\n🆔 TID: ${threadID}\n😄 Emoji: ${threadEmoji}\n👑 Admins:\n${adminNames.join("\n")}`,
                            threadID,
                            messageID
                        );
                    } catch (e) {
                        return api.sendMessage(`❌ Không thể lấy thông tin box: ${e.message}`, threadID, messageID);
                    }
                }

                default:
                    return api.sendMessage("⚠️ Số bạn nhập không hợp lệ!", threadID, messageID);
            }
        }

        case "broadcast": {
            const threadList = [...global.data.allThreadID];
            for (const tid of threadList) {
                api.sendMessage(`📢 Thông báo từ Admin:\n\n${body}`, tid);
            }
            return api.sendMessage("✅ Đã gửi thông báo đến tất cả nhóm.", threadID, messageID);
        }

        case "getuid": {
            try {
                const name = body.toLowerCase();
                let found = [];
                for (const [uid, userData] of global.data.allUserName) {
                    if (userData.toLowerCase().includes(name)) {
                        found.push(`${userData} - UID: ${uid}`);
                    }
                }
                if (found.length === 0) return api.sendMessage("❌ Không tìm thấy UID nào phù hợp.", threadID, messageID);
                return api.sendMessage(`🔎 Kết quả:\n${found.join("\n")}`, threadID, messageID);
            } catch (err) {
                return api.sendMessage(`❌ Lỗi khi tìm UID: ${err.message}`, threadID, messageID);
            }
        }

        case "gettidbox": {
            try {
                const name = body.toLowerCase();
                let found = [];
                for (const [tid, threadData] of global.data.allThreadName) {
                    if (threadData.toLowerCase().includes(name)) {
                        found.push(`${threadData} - TID: ${tid}`);
                    }
                }
                if (found.length === 0) return api.sendMessage("❌ Không tìm thấy TID nào phù hợp.", threadID, messageID);
                return api.sendMessage(`🔎 Kết quả:\n${found.join("\n")}`, threadID, messageID);
            } catch (err) {
                return api.sendMessage(`❌ Lỗi khi tìm TID: ${err.message}`, threadID, messageID);
            }
        }

        case "emojibox": {
            try {
                await api.changeThreadEmoji(body, threadID);
                return api.sendMessage(`✅ Đã đổi emoji box thành: ${body}`, threadID, messageID);
            } catch (e) {
                return api.sendMessage(`❌ Không thể đổi emoji: ${e.message}`, threadID, messageID);
            }
        }

        case "namebox": {
            try {
                await api.setTitle(body, threadID);
                return api.sendMessage(`✅ Đã đổi tên box thành: ${body}`, threadID, messageID);
            } catch (e) {
                return api.sendMessage(`❌ Không thể đổi tên box: ${e.message}`, threadID, messageID);
            }
        }

        default:
            return;
    }
};
