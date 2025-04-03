module.exports.config = {
    name: "randomvideo",
    version: "1.3.0",
    hasPermssion: 0,
    credits: "qm (updated by ChatGPT)",
    description: "Random video gái hoặc cosplay, trừ 500$ mỗi lần dùng",
    commandCategory: "media",
    usages: "randomvideo [girl/cosplay]",
    cooldowns: 3
};

const axios = require("axios");
const fs = require("fs");
const path = require("path");
const request = require("request");

module.exports.run = async ({ api, event, args, Currencies }) => {
    const userID = event.senderID;
    let balance = (await Currencies.getData(userID)).money;
    if (balance < 500) {
        return api.sendMessage("⚠️ Bạn không đủ tiền (500$) để sử dụng lệnh này!", event.threadID, event.messageID);
    }

    const type = args[0]?.toLowerCase();
    let apiUrl;
    switch (type) {
        case "girl":
            apiUrl = "https://hungdev.id.vn/randoms/video-girl?apikey=e33aab1684";
            break;
        case "cosplay":
            apiUrl = "https://hungdev.id.vn/randoms/video-cosplay?apikey=e33aab1684";
            break;
        default:
            return api.sendMessage("⚠️ Vui lòng nhập lệnh đúng format: randomvideo [girl/cosplay]", event.threadID, event.messageID);
    }

    try {
        const res = await axios.get(apiUrl, { timeout: 10000 });
        if (!res.data || !res.data.success || !res.data.data) {
            return api.sendMessage(`⚠️ Không thể lấy video ${type}, vui lòng thử lại sau!`, event.threadID, event.messageID);
        }

        const videoUrl = res.data.data;
        if (!videoUrl.startsWith("http") || !videoUrl.match(/\.(mp4|mov|avi|mkv)(\?.*)?$/)) {
            return api.sendMessage("⚠️ API trả về URL không hợp lệ!", event.threadID, event.messageID);
        }

        let ext = videoUrl.split(".").pop();
        const filePath = path.join(__dirname, "cache", `video.${ext}`);

        const download = request(videoUrl, { timeout: 15000 })
            .on("error", (err) => {
                console.error("❌ Lỗi khi tải video:", err);
                return api.sendMessage(`⚠️ Lỗi khi tải video ${type}, vui lòng thử lại sau!`, event.threadID, event.messageID);
            })
            .pipe(fs.createWriteStream(filePath));

        download.on("close", async () => {
            await Currencies.decreaseMoney(userID, 500);
            api.sendMessage({
                body: `🎥 Video ${type} bạn yêu cầu! (-500$) 💖`,
                attachment: fs.createReadStream(filePath)
            }, event.threadID, () => fs.unlinkSync(filePath), event.messageID);
        });
    } catch (error) {
        console.error(`❌ Lỗi khi gọi API (${type}):`, error.message);
        return api.sendMessage(`⚠️ Đã xảy ra lỗi khi lấy video ${type}, vui lòng thử lại sau!`, event.threadID, event.messageID);
    }
};
