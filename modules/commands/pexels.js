const axios = require("axios");

module.exports.config = {
    name: "pexels",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "qm",
    description: "Tìm kiếm ảnh từ Pexels",
    commandCategory: "Tiện ích",
    usages: "[từ khóa]",
    cooldowns: 5
};

module.exports.run = async ({
    api,
    event
}) => {
    return api.sendMessage(
        "📸 Vui lòng reply tin nhắn này với từ khóa bạn muốn tìm ảnh.",
        event.threadID,
        (err, info) => {
            global.client.handleReply.push({
                name: module.exports.config.name,
                messageID: info.messageID,
                author: event.senderID,
                type: "search"
            });
        }
    );
};

module.exports.handleReply = async ({
    api,
    event,
    handleReply
}) => {
    if (handleReply.author !== event.senderID) return;

    const keyword = encodeURIComponent(event.body.trim());
    const url = `https://hungdev.id.vn/medias/pexels?query=${keyword}&apikey=e33aab1684`;

    try {
        const res = await axios.get(url);
        const results = res.data.data;

        console.log("Kết quả API:", results);
        if (!Array.isArray(results) || results.length === 0) {
            return api.sendMessage("❌ Không tìm thấy kết quả nào với từ khóa bạn nhập.", event.threadID);
        }

        let message = `🔍 Kết quả tìm kiếm ảnh cho từ khóa: "${event.body}"\n\n`;

        for (let i = 0; i < results.length; i++) {
            const item = results[i];
            message += `📸 Ảnh ${i + 1}:\n`;
            message += `• Tiêu đề: ${item.title || "Không có"}\n`;
            message += `• Kích thước: ${item.width}x${item.height}\n`;
            message += `• Tác giả: ${item.user.first_name} ${item.user.last_name} (${item.user.location})\n`;
            message += `• Tải ảnh: ${item.image.download_link}\n\n`;
        }

        const attachments = await Promise.all(
            results.map(async item => {
                const imageStream = (await axios.get(item.image.medium, {
                    responseType: "stream"
                })).data;
                return imageStream;
            })
        );

        return api.sendMessage({
                body: message.trim(),
                attachment: attachments
            },
            event.threadID
        );
    } catch (err) {
        console.error(err);
        return api.sendMessage("⚠️ Đã xảy ra lỗi khi tìm kiếm ảnh.", event.threadID);
    }
};
