module.exports.config = {
    name: "tiktokinfo",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Qm",
    description: "Xem thông tin của tài khoản Tiktok",
    commandCategory: "Thông tin",
    usages: "tiktokinfo [tên tài khoản]",
    cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
    const axios = require('axios');
    const request = require('request');
    const fs = require("fs");
    
    const apikey = "e33aab1684";
    const username = args.join(" ");
    
    if (!username) {
        return api.sendMessage("Bạn chưa nhập tên tài khoản!", event.threadID, event.messageID);
    }

    try {
        const response = await axios.get(`https://hungdev.id.vn/tiktok/profile?username=${username}&apikey=${apikey}`);
        const info = response.data;

        if (!info || !info.data || !info.data.user) {
            return api.sendMessage("Không tìm thấy thông tin tài khoản TikTok!", event.threadID, event.messageID);
        }

        const user = info.data.user;
        const stats = info.data.stats;
        const avatarUrl = user.avatarLarger || user.avatarMedium || user.avatarThumb;

        let message = `👤 Username: ${user.uniqueId}\n`;
        message += `📌 Tên hiển thị: ${user.nickname}\n`;
        message += `👀 Người theo dõi: ${stats.followerCount}\n`;
        message += `❤️ Lượt thích: ${stats.heartCount}\n`;
        message += `🎥 Tổng video: ${stats.videoCount}\n`;
        message += `📝 Bio: ${user.signature || "Không có"}\n`;

        if (!avatarUrl) {
            return api.sendMessage(message, event.threadID, event.messageID);
        }

        const filePath = __dirname + "/cache/tiktok_avatar.jpg";
        request(avatarUrl).pipe(fs.createWriteStream(filePath)).on("close", () => {
            api.sendMessage({
                body: message,
                attachment: fs.createReadStream(filePath)
            }, event.threadID, () => fs.unlinkSync(filePath), event.messageID);
        });

    } catch (error) {
        return api.sendMessage("Có lỗi xảy ra khi lấy thông tin TikTok!", event.threadID, event.messageID);
    }
};
