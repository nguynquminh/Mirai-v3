const axios = require("axios");

async function getStreamFromURL(url) {
    const response = await axios({
        method: 'GET',
        url,
        responseType: 'stream'
    });
    return response.data;
}

module.exports.config = {
    name: "gore",
    version: "1.1.0",
    hasPermssion: 0,
    credits: "qm",
    description: "Phát video từ API gore",
    commandCategory: "Video",
    usages: "[gore]",
    cooldowns: 5
};

module.exports.run = async function({ api, event }) {
    return api.sendMessage(
        "⚠️ Video có thể chứa nội dung kinh dị, máu me, không phù hợp với tất cả người xem.\n\nBạn có chắc chắn muốn tiếp tục? (reply: **yes**)",
        event.threadID,
        (err, info) => {
            global.client.handleReply.push({
                name: module.exports.config.name,
                messageID: info.messageID,
                author: event.senderID,
                type: "confirmGore"
            });
        }
    );
};

module.exports.handleReply = async function({ api, event, handleReply }) {
    if (event.senderID !== handleReply.author) return;
    if (handleReply.type !== "confirmGore") return;

    if (event.body.toLowerCase() !== "yes") {
        return api.sendMessage("❌ Đã hủy yêu cầu xem video gore.", event.threadID);
    }

    try {
        const apiKey = "de01298ac58072df0435083f344dad0a";
        const response = await axios.get(`https://api.zetsu.xyz/randgore?apikey=${apiKey}`);
        const data = response.data.result;

        if (!data || (!data.video1 && !data.video2)) {
            return api.sendMessage("⚠️ Không tìm thấy video phù hợp!", event.threadID);
        }

        const message = `🎥 ${data.title}\n🔗 Nguồn: ${data.source}\n🏷️ Thể loại: ${data.tag}\n📅 Ngày đăng: ${data.upload}\n👤 Tác giả: ${data.author}\n💬 Bình luận: ${data.comment} | 👍 ${data.vote} | 👀 ${data.view}\n\n🎬 Đang gửi video...`;

        return api.sendMessage(message, event.threadID, async () => {
            let videoStream;
            try {
                videoStream = await getStreamFromURL(data.video1);
            } catch (error1) {
                try {
                    videoStream = await getStreamFromURL(data.video2);
                } catch (error2) {
                    console.error("❌ Cả hai video đều lỗi:", error2);
                    return api.sendMessage("⚠️ Không thể tải được video!", event.threadID);
                }
            }

            return api.sendMessage({
                body: "📽️ Video:",
                attachment: videoStream
            }, event.threadID);
        });
    } catch (error) {
        console.error("❌ Lỗi lấy dữ liệu từ API:", error.response?.data || error.message);
        return api.sendMessage("⚠️ Lỗi lấy dữ liệu từ API!", event.threadID);
    }
};
