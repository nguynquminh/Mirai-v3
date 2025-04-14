const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const moment = require("moment-timezone");

module.exports.config = {
    name: "callad",
    version: "1.0.1",
    hasPermssion: 1,
    credits: "qm",
    description: "Gửi báo cáo lỗi hoặc góp ý đến admin",
    commandCategory: "Nhóm",
    usages: "[nội dung báo cáo]",
    cooldowns: 5
};

module.exports.handleReply = async function({
    api,
    event,
    handleReply,
    Users
}) {
    const senderName = (await Users.getData(event.senderID)).name;
    const ADMIN_IDS = global.config.ADMINBOT;
    const attachments = await downloadAttachments(event.attachments);

    const message = {
        body: handleReply.type === "reply" ?
            `📩 Phản hồi từ ${senderName}:\n${event.body || "[Không có nội dung]"}` : `📬 Phản hồi từ admin ${senderName}:\n${event.body || "[Không có nội dung]"}\n\n💬 Phản hồi tin nhắn này để tiếp tục.`,
        attachment: attachments.streams.length > 0 ? attachments.streams : undefined,
        mentions: [{
            id: event.senderID,
            tag: senderName
        }]
    };

    const pushData = {
        name: this.config.name,
        author: event.senderID,
        messageID: null,
        messID: event.messageID,
        id: handleReply.id || event.threadID,
        type: handleReply.type === "reply" ? "calladmin" : "reply"
    };

    const targetID = handleReply.type === "reply" ? ADMIN_IDS[0] : handleReply.id;
    api.sendMessage(message, targetID, (err, info) => {
        if (!err && info?.messageID) {
            pushData.messageID = info.messageID;
            global.client.handleReply.push(pushData); // ✅ Chỉ push một lần
        }
    });

    // Nếu muốn gửi cho nhiều admin vẫn được, nhưng không push handleReply nhiều lần
    if (handleReply.type === "reply") {
        ADMIN_IDS.slice(1).forEach(id => {
            if (id !== targetID) api.sendMessage(message, id); // chỉ gửi, không push
        });
    }


    // Cleanup
    attachments.paths.forEach(p => fs.unlinkSync(p));
};

module.exports.run = async function({
    api,
    event,
    args,
    Threads,
    Users
}) {
    const ADMIN_IDS = global.config.ADMINBOT;
    const senderName = (await Users.getData(event.senderID)).name;
    const threadInfo = await Threads.getData(event.threadID);
    const threadName = threadInfo.threadInfo?.threadName || "Không rõ";
    const time = moment.tz("Asia/Ho_Chi_Minh").format("HH:mm:ss - DD/MM/YYYY");
    const attachments = await downloadAttachments(event.messageReply?.attachments || event.attachments || []);

    if (!args.length && attachments.paths.length === 0) {
        return api.sendMessage("⚠️ Bạn chưa nhập nội dung báo cáo hoặc đính kèm file!", event.threadID, event.messageID);
    }

    const reportMsg = {
        body: `📢 Báo cáo từ: ${senderName}\n📎 Box: ${threadName}\n🆔 ID: ${event.threadID}\n----------------\n📄 Nội dung: ${args.join(" ") || "[Không có nội dung]"}\n🕒 Thời gian: ${time}${attachments.streams.length > 0 ? '\n📎 Đính kèm file.' : ''}`,
        attachment: attachments.streams.length > 0 ? attachments.streams : undefined,
        mentions: [{
            id: event.senderID,
            tag: senderName
        }]
    };

    for (const adminID of ADMIN_IDS) {
        api.sendMessage(reportMsg, adminID, (err, info) => {
            if (!err && info?.messageID) {
                global.client.handleReply.push({
                    name: this.config.name,
                    messageID: info.messageID,
                    messID: event.messageID,
                    author: event.senderID,
                    id: event.threadID,
                    type: "calladmin"
                });
            }
        });
    }

    api.sendMessage(`✅ Đã gửi báo cáo đến ${ADMIN_IDS.length} admin bot.`, event.threadID, event.messageID);

    // Cleanup
    attachments.paths.forEach(p => fs.unlinkSync(p));
};

// 📦 Hàm tải và xử lý tệp đính kèm
async function downloadAttachments(attachments = []) {
    const result = {
        streams: [],
        paths: []
    };
    const extMap = {
        photo: 'jpg',
        video: 'mp4',
        audio: 'mp3',
        animated_image: 'gif'
    };

    for (const att of attachments) {
        const ext = extMap[att.type];
        if (!ext) continue;

        const filename = `${makeID(8)}.${ext}`;
        const filepath = path.join(__dirname, 'cache', filename);
        const file = (await axios.get(att.url, {
            responseType: 'arraybuffer'
        })).data;

        fs.writeFileSync(filepath, file);
        result.streams.push(fs.createReadStream(filepath));
        result.paths.push(filepath);
    }

    return result;
}

// 🔐 Hàm tạo ID ngẫu nhiên
function makeID(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < length; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    return result;
}
