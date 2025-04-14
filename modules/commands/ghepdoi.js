module.exports.config = {
    name: "ghepdoi",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "qm",
    description: "Ghép đôi ❤️ NGẪU NHIÊN ❤️",
    commandCategory: "Tình yêu",
    usages: "[boy]/[girl] hoặc để trống (random cả nam và nữ)",
    cooldowns: 10
}

module.exports.run = async ({
    api,
    event,
    args,
    Users
}) => {
    const axios = require("axios");
    const fs = require("fs-extra");
    const path = require("path");

    try {
        // Lấy thông tin nhóm và người dùng
        const ThreadInfo = await api.getThreadInfo(event.threadID);
        const all = ThreadInfo.userInfo;
        const senderID = event.senderID;

        // Xác định loại ghép đôi
        let data = [];
        if (!args[0]) {
            // Random cả nam và nữ
            for (let u of all) {
                if (u.gender && u.id !== senderID) {
                    data.push(u.id);
                }
            }
        } else if (args[0].toLowerCase() === "boy") {
            // Chỉ ghép với nam
            for (let u of all) {
                if (u.gender === "MALE" && u.id !== senderID) {
                    data.push(u.id);
                }
            }
        } else if (args[0].toLowerCase() === "girl") {
            // Chỉ ghép với nữ
            for (let u of all) {
                if (u.gender === "FEMALE" && u.id !== senderID) {
                    data.push(u.id);
                }
            }
        }

        // Kiểm tra nếu không có ai để ghép
        if (data.length === 0) {
            return api.sendMessage("Rất tiếc! Không tìm thấy nửa đời của bạn 😢", event.threadID, event.messageID);
        }

        // Chọn ngẫu nhiên người được ghép
        const matchedID = data[Math.floor(Math.random() * data.length)];
        const matchRate = (Math.random() * 50) + 50; // Tỉ lệ từ 50-100%

        // Lấy thông tin người dùng
        const [senderInfo, matchedInfo] = await Promise.all([
            Users.getData(senderID),
            Users.getData(matchedID)
        ]);

        // Tải ảnh đại diện
        const [senderAvatar, matchedAvatar] = await Promise.all([
            axios.get(`https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, {
                responseType: "arraybuffer"
            }),
            axios.get(`https://graph.facebook.com/${matchedID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, {
                responseType: "arraybuffer"
            })
        ]);

        // Lưu ảnh vào thư mục cache
        const senderPath = path.join(__dirname, "cache", `sender_${senderID}.png`);
        const matchedPath = path.join(__dirname, "cache", `matched_${matchedID}.png`);
        const heartPath = path.join(__dirname, "cache", "heart.png");

        fs.writeFileSync(senderPath, Buffer.from(senderAvatar.data));
        fs.writeFileSync(matchedPath, Buffer.from(matchedAvatar.data));

        // Tải ảnh trái tim (nếu có)
        try {
            const heartImage = await axios.get("https://i.pinimg.com/736x/07/db/cd/07dbcd1e462292eb39c6e506c5afdae4.jpg", {
                responseType: "arraybuffer"
            });
            fs.writeFileSync(heartPath, Buffer.from(heartImage.data));
        } catch (e) {
            console.log("Không thể tải ảnh trái tim, sử dụng ảnh mặc định");
        }

        // Tạo nội dung tin nhắn
        const message = {
            body: `❤️ GHÉP ĐÔI THÀNH CÔNG ❤️\n\n` +
                `👤 Bạn: ${senderInfo.name}\n` +
                `💖 Người ấy: ${matchedInfo.name}\n` +
                `💝 Tỉ lệ hợp đôi: ${matchRate.toFixed(2)}%\n` +
                `🆔 ID người ấy: ${matchedID}\n\n` +
                `Chúc hai bạn hạnh phúc bên nhau nhé! 💑`,
            attachment: [
                fs.createReadStream(senderPath),
                fs.existsSync(heartPath) ? fs.createReadStream(heartPath) : null,
                fs.createReadStream(matchedPath)
            ].filter(Boolean)
        };

        // Gửi tin nhắn
        api.sendMessage(message, event.threadID, () => {
            // Xóa file tạm sau khi gửi
            fs.unlinkSync(senderPath);
            fs.unlinkSync(matchedPath);
            if (fs.existsSync(heartPath)) fs.unlinkSync(heartPath);
        }, event.messageID);

    } catch (error) {
        console.error(error);
        return api.sendMessage("Đã xảy ra lỗi khi thực hiện ghép đôi, vui lòng thử lại sau!", event.threadID, event.messageID);
    }
};
