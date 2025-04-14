const axios = require('axios');

module.exports.config = {
    name: "upscale",
    version: "1.3.0",
    hasPermssion: 0,
    credits: "qm",
    description: "Nâng cấp chất lượng ảnh từ API có hỗ trợ API Key",
    commandCategory: "image",
    usages: "[reply ảnh]",
    cooldowns: 15,
    dependencies: {
        "axios": ""
    }
};

module.exports.run = async function({ api, event }) {
    try {
        // Kiểm tra reply ảnh
        if (
            event.type !== "message_reply" ||
            !event.messageReply.attachments ||
            event.messageReply.attachments.length === 0
        ) {
            return api.sendMessage("⚠️ Vui lòng reply một ảnh cần upscale", event.threadID, event.messageID);
        }

        const attachment = event.messageReply.attachments[0];
        if (!attachment.url) {
            return api.sendMessage("❌ Không lấy được URL ảnh. Vui lòng thử lại với ảnh khác.", event.threadID, event.messageID);
        }

        const imageUrl = encodeURIComponent(attachment.url);
        const apiKey = "de01298ac58072df0435083f344dad0a";
        const apiUrl = `https://api.zetsu.xyz/tools/restore?url=${imageUrl}&apikey=${apiKey}`;

        api.sendMessage("🔄 Đang xử lý ảnh, vui lòng chờ...", event.threadID, event.messageID);

        const response = await axios.get(apiUrl);

        if (response.data.status && response.data.result) {
            return api.sendMessage({
                body: `✅ Upscale ảnh thành công!\n🔗 Link ảnh: ${response.data.result}`
            }, event.threadID, event.messageID);
        } else {
            return api.sendMessage("❌ Không thể upscale ảnh. API trả về kết quả không hợp lệ.", event.threadID, event.messageID);
        }
    } catch (error) {
        console.error("Upscale Error:", error.response?.data || error.message);
        return api.sendMessage("⚠️ Đã xảy ra lỗi khi xử lý ảnh. Vui lòng thử lại sau!", event.threadID, event.messageID);
    }
};
