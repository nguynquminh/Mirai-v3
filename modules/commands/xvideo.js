const axios = require("axios");

module.exports.config = {
    name: "xvideo",
    version: "1.3.0",
    hasPermssion: 0,
    credits: "qm",
    description: "Tìm kiếm video trên XVideos",
    commandCategory: "NSFW",
    usages: "[từ khóa]",
    cooldowns: 10,
    dependencies: {
        "axios": ""
    }
};

module.exports.run = async function({ api, event }) {
    return api.sendMessage({
        body: "🔍 𝐓𝐢̀𝐦 𝐤𝐢𝐞̂́𝐦 𝐯𝐢𝐝𝐞𝐨 𝐭𝐫𝐞̂𝐧 𝐗𝐕𝐢𝐝𝐞𝐨𝐬\n━━━━━━━━━━━━━━━━━━\n👉 Vui lòng nhập từ khóa tìm kiếm:",
        mentions: []
    }, event.threadID, (err, info) => {
        global.client.handleReply.push({
            name: this.config.name,
            messageID: info.messageID,
            author: event.senderID,
            step: "getKeyword"
        });
    });
};

module.exports.handleReply = async function({ api, event, handleReply }) {
    if (event.senderID !== handleReply.author) return;

    if (handleReply.step === "getKeyword") {
        const keyword = encodeURIComponent(event.body.trim());
        if (!keyword) {
            return api.sendMessage("⚠️ Vui lòng nhập từ khóa hợp lệ!", event.threadID);
        }
        return searchAndSendVideos(api, event, keyword, 1);
    }

    if (handleReply.step === "changePage") {
        const newPage = parseInt(event.body.trim());
        
        // Kiểm tra hủy tìm kiếm trước
        if (newPage === 0) {
            return api.sendMessage("❌ Đã hủy tìm kiếm video!", event.threadID, () => {
                api.unsendMessage(handleReply.messageID);
            });
        }
        
        // Sau đó kiểm tra tính hợp lệ của trang
        if (isNaN(newPage) || newPage < 1) {
            return api.sendMessage("⚠️ Vui lòng nhập số trang hợp lệ (từ 1 trở lên)!", event.threadID);
        }
        
        if (newPage > handleReply.totalPages) {
            return api.sendMessage(`⚠️ Trang ${newPage} không tồn tại. Chỉ có ${handleReply.totalPages} trang kết quả.`, event.threadID);
        }
        
        // Nếu mọi thứ hợp lệ thì thực hiện tìm kiếm
        return searchAndSendVideos(api, event, handleReply.keyword, newPage);
    }
};

async function searchAndSendVideos(api, event, keyword, page) {
    try {
        const apiUrl = `http://87.106.100.187:6312/prn/search/${keyword}`;
        const { data } = await axios.get(apiUrl);
        
        // Chuyển đổi object thành array và lọc các video hợp lệ
        const videos = Object.values(data).filter(
            video => video.title && video.duration && video.video
        );

        if (!videos.length) {
            return api.sendMessage({
                body: `⚠️ Không tìm thấy kết quả nào cho từ khóa "${decodeURIComponent(keyword)}"`,
                mentions: []
            }, event.threadID);
        }

        const itemsPerPage = 5;
        const totalPages = Math.ceil(videos.length / itemsPerPage);
        
        if (page > totalPages) {
            return api.sendMessage({
                body: `⚠️ Trang ${page} không tồn tại. Chỉ có ${totalPages} trang kết quả.`,
                mentions: []
            }, event.threadID);
        }

        const startIdx = (page - 1) * itemsPerPage;
        const results = videos.slice(startIdx, startIdx + itemsPerPage);

        let message = `🔎 𝐊𝐞̂́𝐭 𝐪𝐮𝐚̉ 𝐭𝐢̀𝐦 𝐤𝐢𝐞̂́𝐦: "${decodeURIComponent(keyword)}"\n`;
        message += `📄 𝐓𝐫𝐚𝐧𝐠 ${page}/${totalPages}\n━━━━━━━━━━━━━━━━━━\n\n`;
        
        results.forEach((video, index) => {
            const num = startIdx + index + 1;
            message += `✨ ${num}. ${video.title || 'Không có tiêu đề'}\n`;
            message += `⏱️ Thời lượng: ${video.duration || 'Không rõ'}\n`;
            if (video.uploaderName) {
                message += `👤 Uploader: ${video.uploaderName}\n`;
            }
            message += `🔗 Link: ${video.video}\n\n`;
        });

        message += `━━━━━━━━━━━━━━━━━━\n📌 Nhập số trang (1-${totalPages}) để xem thêm hoặc "0" để hủy`;

        return api.sendMessage({
            body: message,
            mentions: []
        }, event.threadID, (err, info) => {
            if (err) return console.error(err);
            
            global.client.handleReply.push({
                name: module.exports.config.name,
                messageID: info.messageID,
                author: event.senderID,
                step: "changePage",
                keyword: keyword,
                totalPages: totalPages
            });
        });

    } catch (error) {
        console.error("Lỗi khi tìm kiếm video:", error);
        return api.sendMessage({
            body: "⚠️ Đã xảy ra lỗi khi tìm kiếm video. Vui lòng thử lại sau!",
            mentions: []
        }, event.threadID);
    }
}