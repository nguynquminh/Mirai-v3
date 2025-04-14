module.exports.config = {
    name: "findanime",
    version: "1.1.0",
    hasPermssion: 0,
    credits: "qm ",
    description: "Tìm anime từ hình ảnh sử dụng trace.moe API",
    commandCategory: "tiện ích",
    usages: "[reply ảnh/url ảnh]",
    cooldowns: 10,
    dependencies: {
        "axios": "",
        "fs-extra": ""
    }
};

module.exports.run = async function ({ api, event }) {
    const axios = require('axios');
    const fs = require('fs-extra');
    const path = __dirname + '/cache';

    try {
        if (event.type !== "message_reply" || !event.messageReply.attachments || event.messageReply.attachments.length === 0) {
            return api.sendMessage('Vui lòng reply một ảnh để tìm anime!', event.threadID, event.messageID);
        }

        const attachment = event.messageReply.attachments[0];
        let imageUrl;

        if (attachment.type === "photo") {
            imageUrl = attachment.url;
        } else {
            return api.sendMessage('Chỉ hỗ trợ tìm kiếm với ảnh tĩnh!', event.threadID, event.messageID);
        }

        api.sendMessage('🔄 Đang tìm kiếm thông tin anime...', event.threadID, event.messageID);

        const { data } = await axios.get(`https://api.trace.moe/search?url=${encodeURIComponent(imageUrl)}`);

        if (!data.result || data.result.length === 0) {
            return api.sendMessage('Không tìm thấy anime phù hợp với hình ảnh này!', event.threadID);
        }

        const formatTime = (seconds) => {
            const date = new Date(seconds * 1000);
            return date.toISOString().substr(11, 8);
        };

        const resultsToShow = data.result.slice(0, 5); // Giới hạn tối đa 5 kết quả

        for (let i = 0; i < resultsToShow.length; i++) {
            const result = resultsToShow[i];
            const {
                filename,
                episode,
                similarity,
                from,
                to,
                video
            } = result;

            const message = `🌸 Kết quả #${i + 1}:\n\n` +
                `📺 Tên: ${filename}\n` +
                `📖 Tập: ${episode || 'Không rõ'}\n` +
                `📊 Độ chính xác: ${(similarity * 100).toFixed(2)}%\n` +
                `⏱ Thời gian: ${formatTime(from)} - ${formatTime(to)}\n`;

            // Nếu có video preview thì tải về và gửi kèm
            if (video) {
                const videoPath = `${path}/trace_${i}.mp4`;
                const videoStream = await axios.get(video, { responseType: 'stream' });
                const writer = fs.createWriteStream(videoPath);
                videoStream.data.pipe(writer);
                await new Promise((resolve, reject) => {
                    writer.on('finish', resolve);
                    writer.on('error', reject);
                });

                await api.sendMessage({
                    body: message,
                    attachment: fs.createReadStream(videoPath)
                }, event.threadID);

                fs.unlinkSync(videoPath);
            } else {
                await api.sendMessage(message, event.threadID);
            }
        }

    } catch (error) {
        console.error(error);
        api.sendMessage('❌ Có lỗi xảy ra khi tìm kiếm anime!', event.threadID);
    }
};
