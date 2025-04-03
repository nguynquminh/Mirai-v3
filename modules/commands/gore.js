const axios = require("axios");

module.exports.config = {
    name: "gore",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Modified by you",
    description: "Phát video từ API gore",
    commandCategory: "Video",
    usages: "[gore]",
    cooldowns: 5
};

module.exports.run = async function({
    api,
    event
}) {
    try {
        const response = await axios.get("https://api.zetsu.xyz/randgore");
        console.log(response.data);
        const data = response.data.result;

        if (!data || !data.video1) {
            return api.sendMessage("⚠️ Không tìm thấy video nào!", event.threadID);
        }

        const message = `🎥 ${data.title}\n🔗 Nguồn: ${data.source}\n🏷️ Thể loại: ${data.tag}\n📅 Ngày đăng: ${data.upload}\n👤 Tác giả: ${data.author}\n💬 Bình luận: ${data.comment} | 👍 ${data.vote} | 👀 ${data.view}\n\n🎬 Đang gửi video...`;

        return api.sendMessage(message, event.threadID, async () => {
            try {
                const videoStream = await getStreamFromURL(data.video1);
                return api.sendMessage({
                    body: "📽️ Video:",
                    attachment: videoStream
                }, event.threadID);
            } catch (error) {
                console.error("❌ Lỗi tải video:", error);
                return api.sendMessage("⚠️ Lỗi tải video!", event.threadID);
            }
        });
    } catch (error) {
        console.error("❌ Lỗi lấy dữ liệu từ API:", error);
        return api.sendMessage("⚠️ Lỗi lấy dữ liệu từ API!", event.threadID);
    }
};

async function getStreamFromURL(url) {
    const res = await axios.get(url, {
        responseType: "stream"
    });
    return res.data;
}
