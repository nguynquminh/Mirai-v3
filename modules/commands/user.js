module.exports.config = {
    name: "user",
    version: "1.0.5",
    hasPermssion: 2,
    credits: "Mirai Team",
    description: "Quản lý người dùng - Cấm/gỡ cấm người dùng hoặc lệnh",
    commandCategory: "system",
    usages: "[unban/ban/search] [ID or text]",
    cooldowns: 5
};

module.exports.languages = {
    "vi": {
        "reason": "🔄 Lý do",
        "at": "⏰ Vào lúc",
        "allCommand": "🔴 Toàn bộ lệnh",
        "commandList": "📌 Những lệnh",
        "banSuccess": "✅ [ Ban User ] Đã cấm người dùng thành công: %1",
        "unbanSuccess": "✅ [ Unban User ] Đã gỡ cấm người dùng %1",
        "banCommandSuccess": "✅ [ Ban Command ] Đã cấm lệnh đối với người dùng: %1",
        "unbanCommandSuccess": "✅ [ Unban Command ] Đã gỡ cấm %1 đối với người dùng: %2",
        "errorReponse": "❌ %1 Không thể hoàn tất yêu cầu",
        "IDNotFound": "❌ %1 ID người dùng không tồn tại",
        "existBan": "⚠️ [ Ban User ] Người dùng %1 đã bị ban từ trước %2 %3",
        "notExistBan": "⚠️ [ Unban User ] Người dùng chưa từng bị cấm",
        "missingCommandInput": "❌ %1 Vui lòng nhập lệnh cần cấm!",
        "notExistBanCommand": "⚠️ [ UnbanCommand ] Người dùng chưa bị cấm lệnh nào",

        "returnBan": "🔨 [ BAN USER ]\n┏━━━━━━━━━━━━━━━\n┣➤ ID: %1\n┣➤ Tên: %2\n┗━━━━━━━━━━━━━━━\n\n📌 Lý do: %3\n\n👉 Thả cảm xúc bất kỳ vào tin nhắn này để xác nhận",
        "returnUnban": "🔓 [ UNBAN USER ]\n┏━━━━━━━━━━━━━━━\n┣➤ ID: %1\n┣➤ Tên: %2\n┗━━━━━━━━━━━━━━━\n\n👉 Thả cảm xúc bất kỳ vào tin nhắn này để xác nhận",
        "returnBanCommand": "⛔ [ BAN COMMAND ]\n┏━━━━━━━━━━━━━━━\n┣➤ ID: %1\n┣➤ Tên: %2\n┣➤ Lệnh bị cấm: %3\n┗━━━━━━━━━━━━━━━\n\n👉 Thả cảm xúc bất kỳ vào tin nhắn này để xác nhận",
        "returnUnbanCommand": "✅ [ UNBAN COMMAND ]\n┏━━━━━━━━━━━━━━━\n┣➤ ID: %1\n┣➤ Tên: %2\n┣➤ Lệnh được gỡ cấm: %3\n┗━━━━━━━━━━━━━━━\n\n👉 Thả cảm xúc bất kỳ vào tin nhắn này để xác nhận",

        "returnResult": "🔍 Kết quả tìm kiếm:\n%1",
        "returnNull": "❌ Không tìm thấy kết quả phù hợp",
        "returnList": "📜 [ DANH SÁCH BANNED ]\n┏━━━━━━━━━━━━━━━\n┣➤ Tổng số: %1\n┣➤ Hiển thị: %2\n┗━━━━━━━━━━━━━━━\n\n%3",
        "returnInfo": "📋 [ THÔNG TIN USER ]\n┏━━━━━━━━━━━━━━━\n┣➤ ID: %1\n┣➤ Tên: %2\n┣➤ Trạng thái ban: %3\n┣➤ Lý do: %4\n┣➤ Thời gian: %5\n┣➤ Lệnh bị cấm: %6\n┗━━━━━━━━━━━━━━━"
    },
    "en": {
        "reason": "🔄 Reason",
        "at": "⏰ At",
        "allCommand": "🔴 All commands",
        "commandList": "📌 Commands",
        "banSuccess": "✅ [ Ban User ] Banned user: %1",
        "unbanSuccess": "✅ [ Unban User ] Unbanned user %1",
        "banCommandSuccess": "✅ [ Ban Command ] Banned command with user: %1",
        "unbanCommandSuccess": "✅ [ Unban Command ] Unbanned command %1 with user: %2",
        "errorReponse": "❌ %1 Can't complete request",
        "IDNotFound": "❌ %1 User ID not found",
        "existBan": "⚠️ [ Ban User ] User %1 already banned %2 %3",
        "notExistBan": "⚠️ [ Unban User ] User not banned before",
        "missingCommandInput": "❌ %1 Please input command to ban",
        "notExistBanCommand": "⚠️ [ UnbanCommand ] User has no banned commands",

        "returnBan": "🔨 [ BAN USER ]\n┏━━━━━━━━━━━━━━━\n┣➤ ID: %1\n┣➤ Name: %2\n┗━━━━━━━━━━━━━━━\n\n📌 Reason: %3\n\n👉 React to this message to confirm",
        "returnUnban": "🔓 [ UNBAN USER ]\n┏━━━━━━━━━━━━━━━\n┣➤ ID: %1\n┣➤ Name: %2\n┗━━━━━━━━━━━━━━━\n\n👉 React to this message to confirm",
        "returnBanCommand": "⛔ [ BAN COMMAND ]\n┏━━━━━━━━━━━━━━━\n┣➤ ID: %1\n┣➤ Name: %2\n┣➤ Banned commands: %3\n┗━━━━━━━━━━━━━━━\n\n👉 React to this message to confirm",
        "returnUnbanCommand": "✅ [ UNBAN COMMAND ]\n┏━━━━━━━━━━━━━━━\n┣➤ ID: %1\n┣➤ Name: %2\n┣➤ Unbanned commands: %3\n┗━━━━━━━━━━━━━━━\n\n👉 React to this message to confirm",

        "returnResult": "🔍 Search results:\n%1",
        "returnNull": "❌ No results found",
        "returnList": "📜 [ BANNED LIST ]\n┏━━━━━━━━━━━━━━━\n┣➤ Total: %1\n┣➤ Showing: %2\n┗━━━━━━━━━━━━━━━\n\n%3",
        "returnInfo": "📋 [ USER INFO ]\n┏━━━━━━━━━━━━━━━\n┣➤ ID: %1\n┣➤ Name: %2\n┣➤ Ban status: %3\n┣➤ Reason: %4\n┣➤ Time: %5\n┣➤ Banned commands: %6\n┗━━━━━━━━━━━━━━━"
    }
}

module.exports.handleReaction = async ({
    event,
    api,
    Users,
    handleReaction,
    getText
}) => {
    if (parseInt(event.userID) !== parseInt(handleReaction.author)) return;
    const moment = require("moment-timezone");
    const {
        threadID
    } = event;
    const {
        messageID,
        type,
        targetID,
        reason,
        commandNeedBan,
        nameTarget
    } = handleReaction;

    const time = moment.tz("Asia/Ho_Chi_minh").format("HH:MM:ss L");
    global.client.handleReaction.splice(global.client.handleReaction.findIndex(item => item.messageID == messageID), 1);

    switch (type) {
        case "ban": {
            try {
                let data = (await Users.getData(targetID)).data || {};
                data.banned = true;
                data.reason = reason || null;
                data.dateAdded = time;
                await Users.setData(targetID, {
                    data
                });
                global.data.userBanned.set(targetID, {
                    reason: data.reason,
                    dateAdded: data.dateAdded
                });
                return api.sendMessage(getText("banSuccess", `${targetID} - ${nameTarget}`), threadID, () => {
                    return api.unsendMessage(messageID);
                });
            } catch {
                return api.sendMessage(getText("errorReponse", "[ Ban User ]"), threadID)
            };
        }

        case "unban": {
            try {
                let data = (await Users.getData(targetID)).data || {};
                data.banned = false;
                data.reason = null;
                data.dateAdded = null;
                await Users.setData(targetID, {
                    data
                });
                global.data.userBanned.delete(targetID);
                return api.sendMessage(getText("unbanSuccess", `${targetID} - ${nameTarget}`), threadID, () => {
                    return api.unsendMessage(messageID);
                });
            } catch {
                return api.sendMessage(getText("errorReponse", "[ Unban User ]"), threadID)
            };
        }

        case "banCommand": {
            try {
                let data = (await Users.getData(targetID)).data || {};
                data.commandBanned = [...data.commandBanned || [], ...commandNeedBan];
                await Users.setData(targetID, {
                    data
                });
                global.data.commandBanned.set(targetID, data.commandBanned);
                return api.sendMessage(getText("banCommandSuccess", `${targetID} - ${nameTarget}`), threadID, () => {
                    return api.unsendMessage(messageID);
                });
            } catch (e) {
                return api.sendMessage(getText("errorReponse", "[ banCommand User ]"), threadID)
            };
        }

        case "unbanCommand": {
            try {
                let data = (await Users.getData(targetID)).data || {};
                data.commandBanned = [...data.commandBanned.filter(item => !commandNeedBan.includes(item))];
                await Users.setData(targetID, {
                    data
                });
                global.data.commandBanned.set(targetID, data.commandBanned);
                if (data.commandBanned.length == 0) global.data.commandBanned.delete(targetID)
                return api.sendMessage(getText("unbanCommandSuccess", ((data.commandBanned.length == 0) ? getText("allCommand") : `${getText("commandList")}: ${commandNeedBan.join(", ")}`), `${targetID} - ${nameTarget}`), threadID, () => {
                    return api.unsendMessage(messageID);
                });
            } catch (e) {
                return api.sendMessage(getText("errorReponse", "[ UnbanCommand User ]"), threadID)
            };
        }
    }
}

module.exports.run = async ({
    event,
    api,
    args,
    Users,
    getText
}) => {
    const {
        threadID,
        messageID
    } = event;
    const type = args[0];
    var targetID = String(args[1]);
    var reason = (args.slice(2, args.length)).join(" ") || null;

    if (isNaN(targetID)) {
        const mention = Object.keys(event.mentions);
        args = args.join(" ");
        targetID = String(mention[0]);
        reason = (args.slice(args.indexOf(event.mentions[mention[0]]) + (event.mentions[mention[0]] || "").length + 1, args.length)) || null;
    }

    switch (type) {
        case "ban":
        case "-b": {
            if (!global.data.allUserID.includes(targetID)) return api.sendMessage(getText("IDNotFound", "[ Ban User ]"), threadID, messageID);
            if (global.data.userBanned.has(targetID)) {
                const {
                    reason,
                    dateAdded
                } = global.data.userBanned.get(targetID) || {};
                return api.sendMessage(getText("existBan", targetID, ((reason) ? `${getText("reason")}: "${reason}"` : ""), ((dateAdded) ? `${getText("at")} ${dateAdded}` : "")), threadID, messageID);
            }
            const nameTarget = global.data.userName.get(targetID) || await Users.getNameUser(targetID);
            return api.sendMessage(getText("returnBan", `${targetID} - ${nameTarget}`, ((reason) ? `\n- ${getText("reason")}: ${reason}` : "")), threadID, (error, info) => {
                global.client.handleReaction.push({
                    type: "ban",
                    targetID,
                    reason,
                    nameTarget,
                    name: this.config.name,
                    messageID: info.messageID,
                    author: event.senderID,

                });
            }, messageID);
        }

        case "unban":
        case "-ub": {
            if (!global.data.allUserID.includes(targetID)) return api.sendMessage(getText("IDNotFound", "[ Unban User ]"), threadID, messageID);
            if (!global.data.userBanned.has(targetID)) return api.sendMessage(getText("notExistBan"), threadID, messageID);
            const nameTarget = global.data.userName.get(targetID) || await Users.getNameUser(targetID);
            return api.sendMessage(getText("returnUnban", `${targetID} - ${nameTarget}`), threadID, (error, info) => {
                global.client.handleReaction.push({
                    type: "unban",
                    targetID,
                    nameTarget,
                    name: this.config.name,
                    messageID: info.messageID,
                    author: event.senderID,

                });
            }, messageID);
        }

        case "search":
        case "-s": {
            const contentJoin = reason || "";
            const getUsers = (await Users.getAll(['userID', 'name'])).filter(item => !!item.name);
            var matchUsers = [],
                a = '',
                b = 0;
            getUsers.forEach(i => {
                if (i.name.toLowerCase().includes(contentJoin.toLowerCase())) {
                    matchUsers.push({
                        name: i.name,
                        id: i.userID
                    });
                }
            });
            matchUsers.forEach(i => a += `\n${b += 1}. ${i.name} - ${i.id}`);
            (matchUsers.length > 0) ? api.sendMessage(getText("returnResult", a), threadID): api.sendMessage(getText("returnNull"), threadID);
            return;
        }

        case "banCommand":
        case "-bc": {
            if (!global.data.allUserID.includes(targetID)) return api.sendMessage(getText("IDNotFound", "[ BanCommand User ]"), threadID, messageID);
            if (reason == null || reason.length == 0) return api.sendMessage(getText("missingCommandInput", "[ BanCommand User ]"), threadID, messageID);
            if (reason == "all") {
                var allCommandName = [];
                const commandValues = global.client.commands.keys();
                for (const cmd of commandValues) allCommandName.push(cmd);
                reason = allCommandName.join(" ");
            }
            const commandNeedBan = reason.split(" ");
            const nameTarget = global.data.userName.get(targetID) || await Users.getNameUser(targetID);
            return api.sendMessage(getText("returnBanCommand", `${targetID} - ${nameTarget}`, ((commandNeedBan.length == global.client.commands.size) ? getText("allCommand") : commandNeedBan.join(", "))), threadID, (error, info) => {
                global.client.handleReaction.push({
                    type: "banCommand",
                    targetID,
                    commandNeedBan,
                    nameTarget,
                    name: this.config.name,
                    messageID: info.messageID,
                    author: event.senderID,

                });
            }, messageID);
        }

        case "unbanCommand":
        case "-ubc": {
            if (!global.data.allUserID.includes(targetID)) return api.sendMessage(getText("IDNotFound", "[ UnbanCommand User ]"), threadID, messageID);
            if (!global.data.commandBanned.has(targetID)) return api.sendMessage(getText("notExistBanCommand"), threadID, messageID);
            if (reason == null || reason.length == 0) return api.sendMessage(getText("missingCommandInput", "[ UnbanCommand User ]"), threadID, messageID);
            if (reason == "all") {
                reason = (global.data.commandBanned.get(targetID)).join(" ");
            }
            const commandNeedBan = reason.split(" ");
            const nameTarget = global.data.userName.get(targetID) || await Users.getNameUser(targetID);
            return api.sendMessage(getText("returnUnbanCommand", `${targetID} - ${nameTarget}`, ((commandNeedBan.length == global.data.commandBanned.get(targetID).length) ? getText("allCommand") : commandNeedBan.join(", "))), threadID, (error, info) => {
                global.client.handleReaction.push({
                    type: "unbanCommand",
                    targetID,
                    commandNeedBan,
                    nameTarget,
                    name: this.config.name,
                    messageID: info.messageID,
                    author: event.senderID,

                });
            }, messageID);
        }

        case "list":
        case "-l": {
            var listBan = [],
                i = 0;
            const threadData = global.data.userBanned.keys();
            for (;;) {
                let idUser = String(threadData.next().value);
                if (typeof idUser == "undefined") {
                    const userName = (await Users.getData(idUser)).name || "unknown";
                    listBan.push(`${i+=1}/ ${idUser} - ${userName}`);
                }
                if (i == global.data.userBanned.size || i == (parseInt(reason) || 10)) break;
            }
            return api.sendMessage(getText("returnList", (global.data.userBanned.size || 0), listBan.length, listBan.join("\n")), threadID, messageID);
        }

        case "info":
        case "-i": {
            if (!global.data.allUserID.includes(targetID)) return api.sendMessage(getText("IDNotFound", "[ Info User ]"), threadID, messageID);
            if (global.data.commandBanned.has(targetID)) {
                var commandBanned = global.data.commandBanned.get(targetID) || []
            };
            if (global.data.userBanned.has(targetID)) {
                var {
                    reason,
                    dateAdded
                } = global.data.userBanned.get(targetID) || {}
            };
            const nameTarget = global.data.userName.get(targetID) || await Users.getNameUser(targetID);
            return api.sendMessage(getText("returnInfo", `${targetID} - ${nameTarget}`, ((!dateAdded) ? "YES" : "NO"), ((reason) ? `${getText("reson")}: "${reason}"` : ""), ((dateAdded) ? `${getText("at")}: ${dateAdded}` : ""), ((commandBanned) ? `YES: ${(commandNeedBan.length == global.client.commands.size) ? getText("allCommand") : commandNeedBan.join(", ")}` : "NO")), threadID, messageID);
        }
    }
}
