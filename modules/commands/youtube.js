const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const YOUTUBE_API_KEY = "AIzaSyB7xzteIRvqCBURoCWP5Ui14haTnte55jU";
const YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";
const CACHE_DIR = path.join("C:", "Users", "quang", "Desktop", "Mirai-Bot-V3", "modules", "commands", "cache");

if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
}

module.exports.config = {
    name: "youtube",
    version: "1.3.3",
    hasPermssion: 0,
    credits: "qm",
    description: "Tìm kiếm và tải video từ YouTube sử dụng API YouTube v3",
    commandCategory: "Tiện ích",
    usages: "youtube [từ khóa]",
    cooldowns: 10
};

module.exports.handleReply = async function({ api, event, handleReply }) {
    try {
        const { body, messageID, threadID } = event;
        const selectedIndex = Number(body);
        
        if (isNaN(selectedIndex) || selectedIndex < 1 || selectedIndex > handleReply.results.length) {
            return api.sendMessage("❌ Vui lòng chọn một số hợp lệ trong danh sách!", threadID, messageID);
        }

        const videoData = handleReply.results[selectedIndex - 1];
        if (!videoData) {
            return api.sendMessage("⚠️ Kết quả không hợp lệ hoặc đã hết hạn!", threadID);
        }

        const videoUrl = `https://www.youtube.com/watch?v=${videoData.id}`;
        const fileName = `video_${Date.now()}.mp4`;
        const filePath = path.join(CACHE_DIR, fileName);

        console.log(`🛠️ Bắt đầu tải video từ: ${videoUrl}`);
        api.unsendMessage(handleReply.messageID);
        api.sendMessage("⏳ Đang tải video, vui lòng chờ...", threadID);
        
        exec(`yt-dlp -f best -o "${filePath}" "${videoUrl}"`, (error) => {
            if (error) {
                console.error("❌ Lỗi khi tải video:", error);
                return api.sendMessage("⚠️ Đã xảy ra lỗi khi tải video, vui lòng thử lại!", threadID);
            }

            console.log(`✅ Tải xong video: ${filePath}`);
            api.sendMessage({
                body: "✅ Tải xong video!",
                attachment: fs.createReadStream(filePath)
            }, threadID, () => {
                fs.unlinkSync(filePath);
                console.log(`🗑️ Đã xóa tệp: ${filePath}`);
            });
        });
    } catch (error) {
        console.error("❌ Lỗi trong handleReply:", error);
        api.sendMessage("⚠️ Đã xảy ra lỗi, vui lòng thử lại!", event.threadID);
    }
};

module.exports.run = async function({ api, event, args }) {
    if (args.length === 0) {
        return api.sendMessage("📢 Vui lòng nhập từ khóa để tìm kiếm video YouTube!", event.threadID);
    }

    const query = args.join(" ");
    console.log(`🔍 Tìm kiếm video với từ khóa: ${query}`);
    try {
        const response = await axios.get(YOUTUBE_SEARCH_URL, {
            params: {
                key: YOUTUBE_API_KEY,
                q: query,
                part: "snippet",
                maxResults: 5,
                type: "video"
            }
        });
        
        const results = response.data.items.map(video => ({
            id: video.id.videoId,
            title: video.snippet.title,
            description: video.snippet.description,
            thumbnail: video.snippet.thumbnails.high.url,
            channelTitle: video.snippet.channelTitle,
            publishedAt: new Date(video.snippet.publishedAt).toLocaleString()
        }));

        console.log("📄 Danh sách video tìm được:", results.map(v => v.title));
        
        const attachments = await Promise.all(results.map(async (video, index) => {
            try {
                const imageResponse = await axios({
                    url: video.thumbnail,
                    responseType: "arraybuffer"
                });
                const imagePath = path.join(CACHE_DIR, `thumb_${index}.jpg`);
                fs.writeFileSync(imagePath, Buffer.from(imageResponse.data, "binary"));
                return fs.createReadStream(imagePath);
            } catch {
                return null;
            }
        }));

        const message = results.map((video, index) => 
            `${index + 1}. ${video.title}\n🔹 Kênh: ${video.channelTitle}\n📅 Ngày đăng: ${video.publishedAt}\n🔗 https://www.youtube.com/watch?v=${video.id}\n📖 ${video.description.substring(0, 150)}...`
        ).join("\n\n");
        
        return api.sendMessage({
            body: message + "\n\n💬 Hãy reply số thứ tự để tải video!",
            attachment: attachments.filter(a => a)
        }, event.threadID, (err, info) => {
            if (!err) {
                console.log(`📩 Tin nhắn kết quả tìm kiếm ID: ${info.messageID}`);
                global.client.handleReply.push({
                    name: module.exports.config.name,
                    messageID: info.messageID,
                    author: event.senderID,
                    results
                });
            }
            attachments.forEach((file, index) => {
                if (file) fs.unlinkSync(path.join(CACHE_DIR, `thumb_${index}.jpg`));
            });
        });
    } catch (error) {
        console.error("❌ Lỗi khi tìm kiếm trên YouTube API:", error);
        return api.sendMessage("⚠️ Đã xảy ra lỗi khi tìm kiếm, vui lòng thử lại!", event.threadID);
    }
};
