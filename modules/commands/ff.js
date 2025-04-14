const axios = require('axios');

module.exports.config = {
    name: "ff",
    version: "1.0.3",
    hasPermission: 0,
    credits: "qm",
    description: "Lấy thông tin chi tiết của tài khoản Free Fire qua ID",
    commandCategory: "tiện ích",
    usages: "ff",
    cooldowns: 5,
};

module.exports.handleReply = async function({
    api,
    event,
    handleReply
}) {
    if (handleReply.step === 1) {
        const region = event.body.toLowerCase();
        const validRegions = ["vn", "ind", "us", "br"];

        if (!validRegions.includes(region)) {
            return api.sendMessage("Khu vực không hợp lệ. Vui lòng chọn: vn, ind, us, br", event.threadID, event.messageID);
        }

        return api.sendMessage("Nhập ID tài khoản Free Fire:", event.threadID, (err, info) => {
            global.client.handleReply.push({
                name: module.exports.config.name,
                messageID: info.messageID,
                author: event.senderID,
                step: 2,
                region
            });
        }, event.messageID);
    }

    if (handleReply.step === 2) {
        const ffId = event.body;
        const region = handleReply.region;
        const apiUrl = `https://wlx-demon-info.vercel.app/profile_info?uid=${ffId}&region=${region}&key=FFwlx`;

        try {
            const response = await axios.get(apiUrl);
            const data = response.data;

            if (data && data.AccountInfo) {
                const info = data.AccountInfo;
                const guild = data.GuildInfo;
                const pet = data.petInfo;
                const social = data.socialinfo;

                let resultMessage = "THÔNG TIN TÀI KHOẢN:\n";
                resultMessage += `👤 Tên: ${info.AccountName}\n`;
                resultMessage += `🆔 ID: ${info.AccountBPID}\n`;
                resultMessage += `⭐ Level: ${info.AccountLevel} (EXP: ${info.AccountEXP})\n`;
                resultMessage += `🔥 Huy Hiệu BP: ${info.AccountBPBadges}\n`;
                resultMessage += `📅 Ngày tạo: ${new Date(info.AccountCreateTime * 1000).toLocaleString('vi-VN')}\n`;
                resultMessage += `🔄 Lần đăng nhập cuối: ${new Date(info.AccountLastLogin * 1000).toLocaleString('vi-VN')}\n`;
                resultMessage += `❤️ Like: ${info.AccountLikes}\n`;

                if (guild) {
                    resultMessage += "\n🛡️ QUÂN ĐOÀN:\n";
                    resultMessage += `🏰 Tên: ${guild.GuildName}\n`;
                    resultMessage += `🔢 ID: ${guild.GuildID}\n`;
                    resultMessage += `🎖 Level: ${guild.GuildLevel}\n`;
                    resultMessage += `👥 Thành viên: ${guild.GuildMember}/${guild.GuildCapacity}\n`;
                }

                if (pet) {
                    resultMessage += "\n🐾 PET:\n";
                    resultMessage += `🐶 Tên: ${pet.name}\n`;
                    resultMessage += `🎖 Level: ${pet.level}\n`;
                    resultMessage += `🔥 EXP: ${pet.exp}\n`;
                }

                if (social) {
                    resultMessage += "\n📝 CHỮ KÝ:\n";
                    resultMessage += `📜 ${social.AccountSignature}\n`;
                }

                api.sendMessage(resultMessage, event.threadID);
            } else {
                api.sendMessage("Không tìm thấy thông tin hoặc có lỗi xảy ra.", event.threadID);
            }
        } catch (error) {
            console.error("Lỗi khi gọi API:", error);
            api.sendMessage("Có lỗi xảy ra khi lấy thông tin tài khoản.", event.threadID);
        }
    }
};

module.exports.run = async function({
    api,
    event
}) {
    return api.sendMessage("Vui lòng chọn khu vực (vn, ind, us, br):", event.threadID, (err, info) => {
        global.client.handleReply.push({
            name: module.exports.config.name,
            messageID: info.messageID,
            author: event.senderID,
            step: 1
        });
    }, event.messageID);
};
