const axios = require("axios");

module.exports.config = {
    name: "colorize",
    version: "1.1.1",
    hasPermssion: 0,
    credits: "qm",
    description: "Tô màu hình ảnh đen trắng",
    commandCategory: "Công cụ",
    usages: "[colorize]",
    cooldowns: 5
};

module.exports.run = async function({ api, event }) {
    return api.sendMessage("🎨 Vui lòng gửi link ảnh hoặc file ảnh bạn muốn tô màu (reply tin nhắn này).", event.threadID, (err, info) => {
        global.client.handleReply.push({
            name: module.exports.config.name,
            messageID: info.messageID,
            author: event.senderID,
            step: "getImage"
        });
    });
};

module.exports.handleReply = async function({ api, event, handleReply }) {
    if (event.senderID !== handleReply.author) return;

    let imageUrl = "";

    // Nếu người dùng gửi link ảnh
    if (event.body && event.body.startsWith("http")) {
        imageUrl = event.body.trim();
    }
    // Nếu người dùng gửi file ảnh
    else if (event.attachments && event.attachments.length > 0 && event.attachments[0].type === "photo") {
        imageUrl = event.attachments[0].url;
    } else {
        return api.sendMessage("⚠️ Vui lòng cung cấp link hoặc file ảnh hợp lệ!", event.threadID, event.messageID);
    }

    await processColorization(api, event, imageUrl);
};

async function processColorization(api, event, imageUrl) {
    try {
        const apiKey = "de01298ac58072df0435083f344dad0a";
        const apiUrl = `https://api.zetsu.xyz/tools/restore?url=${encodeURIComponent(imageUrl)}&apikey=${apiKey}`;
        const response = await axios.get(apiUrl);

        if (response.data.status && response.data.result) {
            return api.sendMessage({
                body: "🎨 Đây là ảnh sau khi đã được tô màu:",
                attachment: await getStreamFromURL(response.data.result)
            }, event.threadID, event.messageID);
        } else {
            return api.sendMessage("❌ Không thể tô màu ảnh này. Vui lòng thử lại với ảnh khác!", event.threadID, event.messageID);
        }
    } catch (error) {
        console.error("❌ Lỗi xử lý tô màu:", error);
        return api.sendMessage("⚠️ Đã xảy ra lỗi khi xử lý ảnh. Vui lòng thử lại sau!", event.threadID, event.messageID);
    }
}

async function getStreamFromURL(url) {
    const res = await axios.get(url, {
        responseType: "stream"
    });
    return res.data;
}
