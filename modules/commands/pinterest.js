module.exports.config = {
    name: "pinterest",
    version: "1.0.1",
    hasPermssion: 0,
    credits: "qm",
    description: "Tìm kiếm ảnh theo từ khóa bằng Pinterest API chính thức",
    commandCategory: "tiện ích",
    usages: "[từ khóa]",
    cooldowns: 5,
    dependencies: {
        "axios": "",
        "fs-extra": ""
    }
};

module.exports.run = async function ({ api, event, args }) {
    const axios = require("axios");
    const fs = require("fs-extra");

    const accessToken = "pina_AMAQSKQXADTVYBAAGCAL6D37E62C5FQBQBIQDX2ZERVNDVL6LNU4NR7GVT7X5KKCWMB2AO6E6LYTG5652R7VWNUNDQWKUTQA"; // ← Thay bằng access token Pinterest của bạn
    const query = args.join(" ");

    if (!query) {
        return api.sendMessage("🔍 Vui lòng nhập từ khóa để tìm kiếm!", event.threadID, event.messageID);
    }

    try {
        api.sendMessage(`🔎 Đang tìm kiếm hình ảnh Pinterest cho: "${query}"...`, event.threadID, event.messageID);

        // Gọi Pinterest search API
        const res = await axios.get(`https://api.pinterest.com/v5/search/pins`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            },
            params: {
                query: query,
                page_size: 10
            }
        });

        const pins = res.data.items;
        if (!pins || pins.length === 0) {
            return api.sendMessage("❌ Không tìm thấy hình ảnh nào!", event.threadID);
        }

        const attachments = [];
        for (let i = 0; i < pins.length; i++) {
            const imageUrl = pins[i].media?.images?.originals?.url;
            if (!imageUrl) continue;

            const imgRes = await axios.get(imageUrl, { responseType: 'stream' });
            const imgPath = __dirname + `/cache/pinterest_${i}.jpg`;

            const writer = fs.createWriteStream(imgPath);
            imgRes.data.pipe(writer);
            await new Promise((resolve, reject) => {
                writer.on("finish", resolve);
                writer.on("error", reject);
            });

            attachments.push(fs.createReadStream(imgPath));
        }

        if (attachments.length === 0) {
            return api.sendMessage("❌ Không có ảnh hợp lệ để gửi!", event.threadID);
        }

        // Gửi ảnh
        await api.sendMessage({
            body: `📌 Kết quả tìm kiếm cho từ khóa: "${query}"`,
            attachment: attachments
        }, event.threadID);

        // Xoá file tạm
        for (let i = 0; i < attachments.length; i++) {
            const path = __dirname + `/cache/pinterest_${i}.jpg`;
            if (fs.existsSync(path)) fs.unlinkSync(path);
        }

    } catch (error) {
        console.error("Pinterest API Error:", error.response?.data || error.message);
        api.sendMessage("⚠️ Có lỗi xảy ra khi tìm kiếm ảnh!", event.threadID);
    }
};
