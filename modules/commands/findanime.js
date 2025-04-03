module.exports.config = {
    name: "findanime",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "qm",
    description: "Tìm anime từ hình ảnh sử dụng trace.moe API",
    commandCategory: "tiện ích",
    usages: "[reply ảnh/url ảnh]",
    cooldowns: 10,
    dependencies: {
        "axios": "",
        "fs-extra": ""
    }
};

module.exports.run = async function({
    api,
    event,
    args
}) {
    const axios = require('axios');
    const fs = require('fs-extra');

    try {
        // Kiểm tra có reply ảnh hay không
        if (event.type !== "message_reply" || !event.messageReply.attachments || event.messageReply.attachments.length === 0) {
            return api.sendMessage('Vui lòng reply một ảnh để tìm anime!', event.threadID, event.messageID);
        }

        const attachment = event.messageReply.attachments[0];
        let imageUrl;

        // Lấy URL ảnh
        if (attachment.type === "photo") {
            imageUrl = attachment.url;
        } else {
            return api.sendMessage('Chỉ hỗ trợ tìm kiếm với ảnh tĩnh!', event.threadID, event.messageID);
        }

        api.sendMessage('🔄 Đang tìm kiếm thông tin anime...', event.threadID, event.messageID);

        // Gọi API trace.moe
        const {
            data
        } = await axios.get(`https://api.trace.moe/search?url=${encodeURIComponent(imageUrl)}`);

        if (!data.result || data.result.length === 0) {
            return api.sendMessage('Không tìm thấy anime phù hợp với hình ảnh này!', event.threadID);
        }

        const bestMatch = data.result[0];
        const {
            filename,
            episode,
            similarity,
            from,
            to,
            video,
            image
        } = bestMatch;

        // Định dạng thời gian
        const formatTime = (seconds) => {
            const date = new Date(seconds * 1000);
            return date.toISOString().substr(11, 8);
        };

        // Tải video preview
        const videoResponse = await axios.get(video, {
            responseType: 'stream'
        });
        const videoPath = __dirname + `/cache/trace_video.mp4`;
        const writer = fs.createWriteStream(videoPath);
        videoResponse.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        // Tạo message kết quả
        const message = `🌸 Kết quả tìm kiếm anime:\n\n` +
            `📺 Tên: ${filename}\n` +
            `📖 Tập: ${episode || 'Không rõ'}\n` +
            `📊 Độ chính xác: ${(similarity * 100).toFixed(2)}%\n` +
            `⏱ Thời gian: ${formatTime(from)} - ${formatTime(to)}\n\n` +
            `🎥 Đang gửi video preview...`;

        // Gửi kết quả
        await api.sendMessage({
            body: message,
            attachment: fs.createReadStream(videoPath)
        }, event.threadID);

        // Xóa file tạm
        fs.unlinkSync(videoPath);

    } catch (error) {
        console.error(error);
        api.sendMessage('❌ Có lỗi xảy ra khi tìm kiếm anime!', event.threadID);
    }
};
