const fs = require('fs');
const path = require('path');

module.exports.config = {
    name: "admin",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "Mirai Team",
    description: "Quản lý admin bot nâng cao",
    commandCategory: "system",
    usages: "[list/add/remove] [userID/@tag] [--name=custom_name]",
    cooldowns: 5,
    dependencies: {
        "fs-extra": ""
    },
    envConfig: {
        maxAdmins: 50,
        allowBotSelfConfig: false,
        backupBeforeChange: true
    }
};

module.exports.languages = {
    "vi": {
        "listAdmin": '👑 Danh sách Admin Bot 👑\n\n%1\n\nTổng số: %2 admin',
        "notHavePermssion": '⚠️ Bạn không có quyền sử dụng tính năng này!',
        "addedNewAdmin": '✅ Đã thêm %1 admin mới:\n\n%2',
        "removedAdmin": '❌ Đã xóa %1 admin:\n\n%2',
        "botnotadd": "🤖 Bot không thể tự thêm admin!",
        "adminLimit": "🚫 Đã đạt tối đa %1 admin!",
        "alreadyAdmin": "ℹ️ %1 đã là admin từ trước!",
        "notAdmin": "ℹ️ %1 không có trong danh sách admin!",
        "selfRemove": "⛔ Bạn không thể tự xóa chính mình!",
        "help": "📖 Hướng dẫn sử dụng:\n\n" +
                "• admin list - Xem danh sách admin\n" +
                "• admin add [userID/@tag] - Thêm admin\n" +
                "• admin remove [userID/@tag] - Xóa admin\n\n" +
                "📌 Giới hạn: tối đa %1 admin"
    },
    "en": {
        "listAdmin": '👑 Bot Admin List 👑\n\n%1\n\nTotal: %2 admins',
        "notHavePermssion": '⚠️ You do not have permission to use this feature!',
        "addedNewAdmin": '✅ Added %1 new admin:\n\n%2',
        "removedAdmin": '❌ Removed %1 admin:\n\n%2',
        "botnotadd": "🤖 Bot cannot add itself as admin!",
        "adminLimit": "🚫 Reached maximum %1 admins!",
        "alreadyAdmin": "ℹ️ %1 is already an admin!",
        "notAdmin": "ℹ️ %1 is not in admin list!",
        "selfRemove": "⛔ You cannot remove yourself!",
        "help": "📖 Usage Guide:\n\n" +
                "• admin list - View admin list\n" +
                "• admin add [userID/@tag] - Add admin\n" +
                "• admin remove [userID/@tag] - Remove admin\n\n" +
                "📌 Limit: max %1 admins"
    }
}

module.exports.run = async function ({ api, event, args, Users, permssion, getText }) {
    const { threadID, messageID, senderID, mentions } = event;
    const configPath = path.resolve(__dirname, '../../config.json');
    const backupPath = path.resolve(__dirname, '../../config_backup.json');
    const content = args.slice(1);
    const mention = Object.keys(mentions);
    const nameOption = args.find(arg => arg.startsWith('--name='))?.split('=')[1];

    // Kiểm tra quyền
    if (permssion < 2 && senderID !== api.getCurrentUserID()) {
        return api.sendMessage(getText("notHavePermssion"), threadID, messageID);
    }

    // Tạo backup nếu cần
    if (this.config.envConfig.backupBeforeChange) {
        try {
            fs.copyFileSync(configPath, backupPath);
        } catch (err) {
            console.error("Backup failed:", err);
        }
    }

    // Load config
    let config;
    try {
        config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        if (!config.ADMINBOT) config.ADMINBOT = [];
    } catch (err) {
        console.error("Config load error:", err);
        return api.sendMessage("❌ Lỗi hệ thống!", threadID, messageID);
    }

    const adminList = config.ADMINBOT;

    // Hàm hỗ trợ
    const getFormattedUser = async (uid) => {
        try {
            const name = nameOption || await Users.getNameUser(uid);
            return `• ${uid} (${name})`;
        } catch {
            return `• ${uid} (Unknown)`;
        }
    };

    switch (args[0]?.toLowerCase()) {
        case "list":
        case "all":
        case "-a": {
            if (adminList.length === 0) {
                return api.sendMessage(getText("listAdmin", "Hiện không có admin nào", 0), threadID, messageID);
            }

            const formattedList = [];
            for (const adminID of adminList) {
                formattedList.push(await getFormattedUser(adminID));
            }

            return api.sendMessage(
                getText("listAdmin", formattedList.join("\n"), adminList.length), 
                threadID, 
                messageID
            );
        }

        case "add": {
            // Bot không thể tự thêm admin
            if (senderID === api.getCurrentUserID() && !this.config.envConfig.allowBotSelfConfig) {
                return api.sendMessage(getText("botnotadd"), threadID, messageID);
            }

            // Kiểm tra giới hạn admin
            if (adminList.length >= this.config.envConfig.maxAdmins) {
                return api.sendMessage(
                    getText("adminLimit", this.config.envConfig.maxAdmins), 
                    threadID, 
                    messageID
                );
            }

            // Xử lý thêm bằng tag
            if (mention.length > 0) {
                const addedUsers = [];
                for (const id of mention) {
                    if (adminList.includes(id)) {
                        continue;
                    }
                    adminList.push(id);
                    addedUsers.push(await getFormattedUser(id));
                }

                if (addedUsers.length === 0) {
                    return api.sendMessage(getText("alreadyAdmin", "Các user được tag"), threadID, messageID);
                }

                fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
                return api.sendMessage(
                    getText("addedNewAdmin", addedUsers.length, addedUsers.join("\n")), 
                    threadID, 
                    messageID
                );
            }

            // Xử lý thêm bằng ID
            if (content.length > 0 && !isNaN(content[0])) {
                const userID = content[0];
                if (adminList.includes(userID)) {
                    return api.sendMessage(
                        getText("alreadyAdmin", await getFormattedUser(userID)), 
                        threadID, 
                        messageID
                    );
                }

                adminList.push(userID);
                fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
                return api.sendMessage(
                    getText("addedNewAdmin", 1, await getFormattedUser(userID)), 
                    threadID, 
                    messageID
                );
            }

            return api.sendMessage(
                getText("help", this.config.envConfig.maxAdmins), 
                threadID, 
                messageID
            );
        }

        case "remove":
        case "rm":
        case "delete": {
            // Xử lý xóa bằng tag
            if (mention.length > 0) {
                const removedUsers = [];
                for (const id of mention) {
                    if (id === senderID) {
                        return api.sendMessage(getText("selfRemove"), threadID, messageID);
                    }

                    const index = adminList.indexOf(id);
                    if (index === -1) continue;
                    
                    adminList.splice(index, 1);
                    removedUsers.push(await getFormattedUser(id));
                }

                if (removedUsers.length === 0) {
                    return api.sendMessage(getText("notAdmin", "Các user được tag"), threadID, messageID);
                }

                fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
                return api.sendMessage(
                    getText("removedAdmin", removedUsers.length, removedUsers.join("\n")), 
                    threadID, 
                    messageID
                );
            }

            // Xử lý xóa bằng ID
            if (content.length > 0 && !isNaN(content[0])) {
                const userID = content[0];
                if (userID === senderID) {
                    return api.sendMessage(getText("selfRemove"), threadID, messageID);
                }

                const index = adminList.indexOf(userID);
                if (index === -1) {
                    return api.sendMessage(
                        getText("notAdmin", await getFormattedUser(userID)), 
                        threadID, 
                        messageID
                    );
                }

                adminList.splice(index, 1);
                fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
                return api.sendMessage(
                    getText("removedAdmin", 1, await getFormattedUser(userID)), 
                    threadID, 
                    messageID
                );
            }

            return api.sendMessage(
                getText("help", this.config.envConfig.maxAdmins), 
                threadID, 
                messageID
            );
        }

        default: {
            return api.sendMessage(
                getText("help", this.config.envConfig.maxAdmins), 
                threadID, 
                messageID
            );
        }
    }
};