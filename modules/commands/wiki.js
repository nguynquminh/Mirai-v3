const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
    name: "wiki",
    version: "1.0.1",
    hasPermssion: 0,
    credits: "qm",
    description: "Tìm kiếm thông tin từ Wikipedia",
    commandCategory: "Thông tin",
    usages: "wiki [từ khóa]",
    cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
    if (args.length === 0) {
        return api.sendMessage("📢 Vui lòng nhập từ khóa để tìm kiếm trên Wikipedia!", event.threadID);
    }

    const query = encodeURIComponent(args.join(" "));
    const apiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${query}`;

    try {
        const response = await axios.get(apiUrl);
        const data = response.data;

        if (!data.extract) {
            return api.sendMessage("❌ Không tìm thấy kết quả nào!", event.threadID);
        }

        let message = `📚 **${data.title}**\n\n${data.extract}`;

        if (data.thumbnail && data.thumbnail.source) {
            const imageResponse = await axios({
                url: data.thumbnail.source,
                responseType: "arraybuffer"
            });

            const imagePath = path.join(__dirname, "wiki_image.jpg");
            fs.writeFileSync(imagePath, Buffer.from(imageResponse.data, "binary"));
            
            return api.sendMessage({
                body: message,
                attachment: fs.createReadStream(imagePath)
            }, event.threadID, () => fs.unlinkSync(imagePath));
        } else {
            return api.sendMessage(message, event.threadID);
        }
    } catch (error) {
        console.error("❌ Lỗi khi gọi API Wikipedia:", error);
        return api.sendMessage("⚠️ Đã xảy ra lỗi khi lấy dữ liệu, vui lòng thử lại sau!", event.threadID);
    }
};