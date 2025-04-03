module.exports.config = {
    name: "lol",
    version: "1.1.0",
    hasPermssion: 0,
    credits: "qm",
    description: "Tra cứu thông tin tướng Liên Minh Huyền Thoại",
    commandCategory: "game",
    usages: "lol [tên tướng]",
    cooldowns: 5
};

const axios = require('axios');

module.exports.run = async ({ api, event, args }) => {
    if (args.length === 0) {
        return api.sendMessage("⚠️ Vui lòng nhập tên tướng cần tra cứu!", event.threadID, event.messageID);
    }

    const championName = args.join(" ");
    const apiUrl = `https://nguyenmanh.name.vn/api/searchLOL?name=${encodeURIComponent(championName)}&apikey=O2lXQgI7`;

    try {
        const res = await axios.get(apiUrl, { timeout: 10000 });

        console.log("📥 Dữ liệu nhận từ API:", res.data);

        if (!res.data || res.data.status !== 200 || !res.data.result) {
            return api.sendMessage("⚠️ Không tìm thấy thông tin tướng, vui lòng thử lại!", event.threadID, event.messageID);
        }

        const data = res.data.result;
        let message = `🎮 Thông tin tướng: ${data.name}
        
❤️ Máu: ${data.hp} (+${data.hp_gain_per_lvl}/cấp)
🔄 Hồi máu: ${data.hp_regen} (+${data.hp_regen_gain_per_lvl}/cấp)
🔵 Năng lượng: ${data.mana} (+${data.mana_gain_per_lvl}/cấp)
🔁 Hồi năng lượng: ${data.mana_regen} (+${data.mana_regen_gain_per_lvl}/cấp)

⚔️ Sát thương: ${data.attack_damage} (+${data.attack_damage_gain_per_lvl}/cấp)
🎯 Tốc đánh: ${data.attack_speed} (+${data.attack_speed_gain_per_lvl}%/cấp)
🛡️ Giáp: ${data.armor} (+${data.armor_gain_per_lvl}/cấp)
🔮 Kháng phép: ${data.magic_resist} (+${data.magic_resist_gain_per_lvl}/cấp)

🚀 Tốc độ di chuyển: ${data.movement_speed}
🎯 Tầm đánh: ${data.range}
🔥 Sức mạnh phép thuật: ${data.ability_power}
⏳ Điểm hồi kỹ năng: ${data.ability_haste}
💥 Tỉ lệ chí mạng: ${data.crit}%`;

        return api.sendMessage(message, event.threadID, event.messageID);
    } catch (error) {
        console.error("❌ Lỗi khi gọi API:", error.message);
        return api.sendMessage("⚠️ Đã xảy ra lỗi khi tra cứu tướng, vui lòng thử lại sau!", event.threadID, event.messageID);
    }
};
