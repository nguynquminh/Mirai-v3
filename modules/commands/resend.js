const fs = require("fs-extra");
const axios = require("axios");
const request = require("request");

module.exports.config = {
    name: "resend",
    version: "2.0.0",
    hasPermssion: 1,
    credits: "qm",
    description: "Là resend tin nhắn đã gỡ",
    commandCategory: "general",
    usages: "",
    cooldowns: 0,
    hide: true,
    dependencies: {
        "request": "",
        "fs-extra": "",
        "axios": ""
    }
};

module.exports.handleEvent = async function({
    event,
    api,
    Users
}) {
    const {
        threadID,
        messageID,
        senderID,
        body,
        attachments,
        type
    } = event;

    // Tạo map lưu tin nhắn
    global.logMessage = global.logMessage || new Map();
    global.data.botID = global.data.botID || api.getCurrentUserID();
    const threadData = global.data.threadData.get(threadID) || {};

    // Kiểm tra đã bật resend chưa và tin không phải do bot
    if ((threadData.resend === undefined || threadData.resend !== false) && senderID !== global.data.botID) {
        if (type !== "message_unsend") {
            global.logMessage.set(messageID, {
                msgBody: body,
                attachment: attachments
            });
        } else {
            const data = global.logMessage.get(messageID);
            if (!data) return;

            const userName = await Users.getNameUser(senderID);

            // Nếu không có file đính kèm
            if (!data.attachment || data.attachment.length === 0) {
                return api.sendMessage(`🧿 Thanos time stone kích hoạt!\n${userName} đã gỡ một tin nhắn:\n👉 Nội dung: ${data.msgBody}`, threadID);
            }

            // Nếu có file đính kèm
            const resendMsg = {
                body: `${userName} vừa gỡ ${data.attachment.length} tệp đính kèm.${data.msgBody ? `\n\nNội dung: ${data.msgBody}` : ""}`,
                attachment: [],
                mentions: [{
                    tag: userName,
                    id: senderID
                }]
            };

            let count = 0;
            for (const file of data.attachment) {
                try {
                    count++;
                    const ext = file.url.split('.').pop().split('?')[0];
                    const filePath = `${__dirname}/cache/${count}.${ext}`;
                    const buffer = (await axios.get(file.url, {
                        responseType: "arraybuffer"
                    })).data;
                    fs.writeFileSync(filePath, Buffer.from(buffer));
                    resendMsg.attachment.push(fs.createReadStream(filePath));
                } catch (err) {
                    console.error("Lỗi tải file đính kèm:", err);
                }
            }

            return api.sendMessage(resendMsg, threadID);
        }
    }
};

module.exports.languages = {
    vi: {
        on: "Bật",
        off: "Tắt",
        successText: "resend thành công"
    },
    en: {
        on: "on",
        off: "off",
        successText: "resend success!"
    }
};

module.exports.run = async function({
    api,
    event,
    Threads,
    getText,
    args
}) {
    const {
        threadID,
        messageID
    } = event;
    const threadData = (await Threads.getData(threadID)).data;

    // Nếu truyền tham số 'on' hoặc 'off'
    if (args[0] === "on") threadData.resend = true;
    else if (args[0] === "off") threadData.resend = false;
    else threadData.resend = !(threadData.resend ?? true); // Đảo trạng thái nếu không có args

    await Threads.setData(threadID, {
        data: threadData
    });
    global.data.threadData.set(threadID, threadData);

    return api.sendMessage(
        `${threadData.resend ? getText("on") : getText("off")} ${getText("successText")}`,
        threadID,
        messageID
    );
};
