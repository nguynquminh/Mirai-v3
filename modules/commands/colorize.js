const axios = require("axios");

module.exports.config = {
    name: "colorize",
    version: "1.1.0",
    hasPermssion: 0,
    credits: "qm",
    description: "Tô màu hình ảnh đen trắng",
    commandCategory: "Công cụ",
    usages: "[colorize]",
    cooldowns: 5
};

module.exports.run = async function({
    api,
    event
}) {
    return api.sendMessage("🎨 Vui lòng cung cấp hình ảnh cần tô màu!", event.threadID, (err, info) => {
        global.client.handleReply.push({
            name: module.exports.config.name,
            messageID: info.messageID,
            author: event.senderID,
            step: "getImage"
        });
    });
};

module.exports.handleReply = async function({
    api,
    event,
    handleReply
}) {
    if (event.senderID !== handleReply.author) return;

    let imageUrl = "";

    // Nếu người dùng gửi link ảnh
    if (event.body && event.body.startsWith("http")) {
        imageUrl = event.body.trim();
    }
    // Nếu người dùng gửi file ảnh
    else if (event.attachments.length > 0 && event.attachments[0].type === "photo") {
        imageUrl = event.attachments[0].url;
    } else {
        return api.sendMessage("⚠️ Vui lòng cung cấp link hoặc file ảnh!", event.threadID);
    }

    await processColorization(api, event, imageUrl);
};

async function processColorization(api, event, imageUrl) {
    try {
        const apiUrl = `https://api.zetsu.xyz/tools/colorize?url=${encodeURIComponent(imageUrl)}`;
        const response = await axios.get(apiUrl);

        if (response.data.status && response.data.result) {
            return api.sendMessage({
                body: "🎨 Ảnh sau khi tô màu:",
                attachment: await getStreamFromURL(response.data.result)
            }, event.threadID);
        } else {
            return api.sendMessage("⚠️ Không thể tô màu ảnh này!", event.threadID);
        }
    } catch (error) {
        console.error("❌ Lỗi xử lý tô màu:", error);
        return api.sendMessage("⚠️ Lỗi xử lý ảnh!", event.threadID);
    }
}

async function getStreamFromURL(url) {
    const res = await axios.get(url, {
        responseType: "stream"
    });
    return res.data;
}
