const axios = require('axios');
const stringSimilarity = require('string-similarity');

this.config = {
    name: "help",
    version: "1.1.2",
    hasPermssion: 0,
    credits: "DC-Nam",
    description: "Xem danh sách lệnh và thông tin chi tiết",
    commandCategory: "Box chat",
    usages: "[tên lệnh/all]",
    cooldowns: 5,
    images: [],
};

this.run = async function({
    api,
    event,
    args
}) {
    const {
        threadID: tid,
        messageID: mid
    } = event;
    const cmds = global.client.commands;
    const TIDdata = global.data.threadData.get(tid) || {};
    const prefix = TIDdata.PREFIX || global.config.PREFIX;
    const botName = global.config.BOTNAME;
    const adminList = global.config.ADMINBOT;

    let type = args[0] ? args[0].toLowerCase() : "";
    let msg = "";

    if (type === "all") {
        let commandList = [...cmds.values()].map((cmd, index) =>
            `${index + 1}. ${cmd.config.name}\n→ Mô tả: ${cmd.config.description}\n────────────────`);
        return api.sendMessage(commandList.join('\n'), tid, mid);
    }

    if (type) {
        let commandNames = [...cmds.keys()];
        if (!commandNames.includes(type)) {
            let bestMatch = stringSimilarity.findBestMatch(type, commandNames).bestMatch;
            return api.sendMessage(`❎ Không tìm thấy lệnh '${type}'.\n🔍 Gần đúng: '${bestMatch.target}'`, tid, mid);
        }

        const cmd = cmds.get(type).config;
        const imgStreams = await Promise.all(cmd.images.map(async url => (await axios.get(url, {
            responseType: "stream"
        })).data));

        msg =
            `📌 [ HƯỚNG DẪN SỬ DỤNG ] 📌\n` +
            `─────────────────\n` +
            `📜 Lệnh: ${cmd.name}\n` +
            `👤 Tác giả: ${cmd.credits}\n` +
            `🌾 Phiên bản: ${cmd.version}\n` +
            `⚡ Quyền hạn: ${formatPermission(cmd.hasPermssion)}\n` +
            `📝 Mô tả: ${cmd.description}\n` +
            `🏷️ Nhóm: ${cmd.commandCategory}\n` +
            `🍁 Cách dùng: ${cmd.usages}\n` +
            `⏳ Thời gian chờ: ${cmd.cooldowns}s\n` +
            `─────────────────\n` +
            `📌 Hướng dẫn sử dụng cho người mới`;
        return api.sendMessage({
            body: msg,
            attachment: imgStreams
        }, tid, mid);
    }

    let categorizedCommands = categorizeCommands(cmds);
    let formattedCategories = categorizedCommands.map(cat =>
        `│\n│ ${cat.category.toUpperCase()}\n├────────⭔\n│ Tổng: ${cat.commands.length} lệnh\n│ ${cat.commands.join(", ")}\n├────────⭔`
    ).join('\n');

    msg = `╭─────────────⭓\n${formattedCategories}\n` +
        `📝 Tổng số lệnh: ${cmds.size}\n` +
        `👤 Số admin bot: ${adminList.length}\n` +
        `🤖 Tên Bot: ${botName}\n` +
        `🔰 Phiên bản: ${this.config.version}\n` +
        `📎 Liên hệ Admin: ${global.config.FACEBOOK_ADMIN}\n` +
        `📌 Sử dụng: ${prefix}help [tên lệnh] để xem chi tiết\n` +
        `📌 Hoặc: ${prefix}help all để xem tất cả lệnh`;
    return api.sendMessage(msg, tid);
};

function categorizeCommands(commands) {
    let categories = {};
    commands.forEach(cmd => {
        let category = cmd.config.commandCategory;
        if (!categories[category]) {
            categories[category] = [];
        }
        categories[category].push(cmd.config.name);
    });
    return Object.keys(categories).map(cat => ({
        category: cat,
        commands: categories[cat]
    }));
}

function formatPermission(level) {
    return ["Thành Viên", "Quản Trị Viên", "Admin Bot", "Toàn Quyền"][level] || "Không xác định";
}