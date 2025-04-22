const axios = require("axios");
const NodeCache = require("node-cache");

// Khởi tạo cache với thời gian sống 10 phút
const cache = new NodeCache({
    stdTTL: 600
});

module.exports.config = {
    name: "genshin",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "qm",
    description: "Tra cứu thông tin Genshin Impact",
    commandCategory: "Game",
    usages: "[artifacts/boss/characters/domains/elements/enemies/nations/weapons]",
    cooldowns: 5
};

// Hàm lưu trạng thái tìm kiếm tạm thời
const pendingQueries = {};

module.exports.handleReply = async function({
    api,
    event,
    handleReply
}) {
    const {
        threadID,
        messageID,
        senderID,
        body
    } = event;

    console.log("handleReply called with:", {
        body,
        messageID,
        replyTo: event.messageReply?.messageID
    });
    console.log("handleReply data:", handleReply);

    // Kiểm tra xem người dùng có phải người tạo truy vấn
    if (senderID !== handleReply.author) return;

    const userInput = body.trim();

    // Xử lý phân trang
    if (handleReply.type === "pagination") {
        const pageNumber = parseInt(userInput);

        if (!isNaN(pageNumber) && pageNumber > 0 && pageNumber <= handleReply.totalPages) {
            await displayPage(api, threadID, senderID, handleReply.category, handleReply.items, pageNumber);
            return;
        }

        // Nếu không phải số trang, xem như tìm kiếm theo tên
        try {
            await searchGenshinData(api, threadID, handleReply.category, userInput);
        } catch (error) {
            console.error(`❌ Lỗi khi xử lý reply cho ${handleReply.category}:`, error);
            return api.sendMessage(`⚠️ Đã xảy ra lỗi khi tìm kiếm "${userInput}" trong mục ${handleReply.category}!`, threadID);
        }
        return;
    }

    // Xử lý tìm kiếm thông thường
    const {
        type
    } = handleReply;
    try {
        await searchGenshinData(api, threadID, type, userInput);
    } catch (error) {
        console.error(`❌ Lỗi khi xử lý reply cho ${type}:`, error);
        return api.sendMessage(`⚠️ Đã xảy ra lỗi khi tìm kiếm "${userInput}" trong mục ${type}!`, threadID);
    }
};

module.exports.run = async function({
    api,
    event,
    args
}) {
    const {
        threadID,
        messageID,
        senderID
    } = event;
    const BASE_URL = "https://genshin.jmp.blue";

    const validTypes = [
        "artifacts", "boss", "characters",
        "domains", "elements", "enemies",
        "nations", "weapons"
    ];

    if (args.length < 1) {
        const menuHeader = "╭─「 🎮 GENSHIN IMPACT MENU 」─╮";
        const menuFooter = "╰─「 nguyenquangminh 」─╯";

        let menuContent = "";
        menuContent += "│\n";
        menuContent += "│ 📋 Sử dụng: genshin [loại] [tên]\n";
        menuContent += "│\n";
        menuContent += "│ 📚 Các loại dữ liệu:\n";

        const columns = 2;
        const rows = Math.ceil(validTypes.length / columns);

        for (let i = 0; i < rows; i++) {
            menuContent += "│ ";
            for (let j = 0; j < columns; j++) {
                const index = i + j * rows;
                if (index < validTypes.length) {
                    const type = validTypes[index];
                    const emoji = getTypeEmoji(type);
                    const paddedType = `${emoji} ${type.padEnd(12)}`;
                    menuContent += paddedType;
                }
            }
            menuContent += "\n";
        }

        menuContent += "│\n";
        menuContent += "│ 💡 Ví dụ: genshin characters hu tao\n";
        menuContent += "│ 💡 Ví dụ: genshin weapons\n";

        const fullMenu = `${menuHeader}\n${menuContent}${menuFooter}`;
        return api.sendMessage(fullMenu, threadID);
    }

    const type = args[0].toLowerCase();

    if (!validTypes.includes(type)) {
        return api.sendMessage(`❌ Loại dữ liệu không hợp lệ! Vui lòng chọn một trong các loại sau: ${validTypes.join(", ")}`, threadID);
    }

    if (args.length > 1) {
        const name = args.slice(1).join(" ").toLowerCase();
        try {
            await searchGenshinData(api, threadID, type, name);
        } catch (error) {
            console.error(`❌ Lỗi khi xử lý tìm kiếm cho ${type}:`, error);
            return api.sendMessage(`⚠️ Đã xảy ra lỗi khi tìm kiếm "${name}" trong mục ${type}!`, threadID);
        }
        return;
    }

    try {
        let url = `${BASE_URL}/${type}`;
        if (type === "boss") {
            url = `${BASE_URL}/boss/weekly-boss`;
        }
        const cacheKey = `list:${type}`;
        let items = cache.get(cacheKey);

        if (!items) {
            const response = await axios.get(url);
            items = response.data;
            cache.set(cacheKey, items);
        }

        await displayPage(api, threadID, senderID, type, items, 1);

    } catch (error) {
        console.error(`❌ Lỗi khi lấy danh sách ${type}:`, error);
        return api.sendMessage(`⚠️ Đã xảy ra lỗi khi lấy danh sách ${type}, vui lòng thử lại sau!`, threadID);
    }
};

// Hàm hiển thị danh sách theo trang
async function displayPage(api, threadID, senderID, category, items, page) {
    const itemsPerPage = 15;
    const totalPages = Math.ceil(items.length / itemsPerPage);

    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, items.length);

    const displayItems = items.slice(startIndex, endIndex);

    let message = `📜 DANH SÁCH ${category.toUpperCase()} GENSHIN IMPACT\n`;
    message += `📄 Trang ${page}/${totalPages}\n\n`;

    displayItems.forEach((item, index) => {
        message += `${startIndex + index + 1}. ${item}\n`;
    });

    message += `\n📖 Tổng cộng: ${items.length} mục`;
    message += `\n👆 Reply số trang (1-${totalPages}) để chuyển trang`;
    message += `\n🔎 Hoặc reply tên cụ thể để xem thông tin chi tiết`;

    api.sendMessage(message, threadID, (error, info) => {
        if (error) return console.error(error);

        if (!global.client.handleReply) global.client.handleReply = [];

        global.client.handleReply = global.client.handleReply.filter(item =>
            item.author !== senderID || item.type !== "pagination" || item.category !== category
        );

        global.client.handleReply.push({
            name: "genshin",
            messageID: info.messageID,
            author: senderID,
            type: "pagination",
            category: category,
            items: items,
            page: page,
            totalPages: totalPages,
            expires: Date.now() + 60000 // Hết hạn sau 60 giây
        });

        console.log(`Đã thêm handleReply mới cho messageID: ${info.messageID}`);
    });
}

// Hàm định dạng dữ liệu cho từng loại
function formatData(type, data) {
    const formatters = {
        characters: (data) => {
            let message = `🔍 THÔNG TIN NHÂN VẬT GENSHIN IMPACT\n\n`;
            message += `👤 Tên: ${data.name}\n`;
            message += `⭐ Hiếm: ${data.rarity} sao\n`;
            message += `🌋 Nguyên tố: ${data.vision}\n`;
            message += `🏰 Quốc gia: ${data.nation || "Không rõ"}\n`;
            message += `🎯 Vũ khí: ${data.weapon}\n`;
            if (data.description) message += `📖 Mô tả: ${data.description}\n`;
            if (data.constellation) message += `✨ Chòm sao: ${data.constellation}\n`;
            if (data.birthday) message += `🎂 Sinh nhật: ${data.birthday}\n`;
            return message;
        },
        artifacts: (data) => {
            let message = `🔍 THÔNG TIN ARTIFACT GENSHIN IMPACT\n\n`;
            message += `🏺 Tên bộ: ${data.name}\n\n`;
            message += `⭐ Hiếm: ${data.max_rarity} sao\n`;
            message += "🎖️ Hiệu ứng bộ:\n";
            if (data["1-piece_bonus"]) message += `• ${data["1-piece_bonus"]}\n`;
            if (data["2-piece_bonus"]) message += `• ${data["2-piece_bonus"]}\n`;
            if (data["4-piece_bonus"]) message += `• ${data["4-piece_bonus"]}\n`;
            return message;
        },
        weapons: (data) => {
            let message = `🔍 THÔNG TIN VŨ KHÍ GENSHIN IMPACT\n\n`;
            message += `⚔️ Tên: ${data.name}\n`;
            message += `⭐ Hiếm: ${data.rarity} sao\n`;
            message += `🔫 Loại: ${data.type}\n`;
            if (data.subStat) message += `🌟 Thuộc tính phụ: ${data.subStat}\n`;
            if (data.passiveName || data.passiveDesc) {
                message += `📊 Hiệu ứng: ${data.passiveName ? data.passiveName + ": " : ""}${data.passiveDesc || ""}\n`;
            }
            message += `\n📈 Thông số cơ bản (Lv. 1):\n`;
            message += `• BASE ATK: ${data.baseAttack}\n`;
            if (data.subStat && data.subValue) message += `• ${data.subStat}: ${data.subValue}\n`;
            if (data.location) message += `\n📖 Mô tả: ${data.location}\n`;
            return message;
        },
        elements: (data) => {
            let message = `🔍 THÔNG TIN NGUYÊN TỐ GENSHIN IMPACT\n\n`;
            message += `🌟 Tên: ${data.name}\n`;
            if (data.archon) message += `🎭 Thần: ${data.archon}\n`;
            if (data.nation) message += `🏰 Quốc gia: ${data.nation}\n`;
            if (data.reactions && data.reactions.length > 0) {
                message += `\n⚡ PHẢN ỨNG NGUYÊN TỐ:\n`;
                data.reactions.forEach(reaction => {
                    message += `\n▸ ${reaction.name} (${reaction.elements.join(" + ")})\n`;
                    message += `  ${reaction.description.replace(/\n/g, '\n  ')}\n`;
                    if (reaction.name === "Vaporize") {
                        message += `  💥 Tăng sát thương: ${reaction.elements.includes("Pyro") ? "Pyro x2 (khi kích hoạt bởi Hydro)" : "Hydro x1.5 (khi kích hoạt bởi Pyro)"}\n`;
                    } else if (reaction.name === "Melt") {
                        message += `  🔥 Tăng sát thương: ${reaction.elements.includes("Pyro") ? "Pyro x2 (khi kích hoạt bởi Cryo)" : "Cryo x1.5 (khi kích hoạt bởi Pyro)"}\n`;
                    }
                });
            }
            return message;
        },
        nations: (data) => {
            let message = `🔍 THÔNG TIN QUỐC GIA GENSHIN IMPACT\n\n`;
            message += `🏰 Tên: ${data.name}\n`;
            if (data.archon) message += `👑 Thần: ${data.archon}\n`;
            if (data.element) message += `🌋 Nguyên tố: ${data.element}\n`;
            if (data.controllingEntity) message += `🏛️ Cai trị: ${data.controllingEntity}\n`;
            return message;
        },
        boss: (data) => {
            let message = `🔍 THÔNG TIN BOSS GENSHIN IMPACT\n\n`;
            message += `👹 Tên: ${data.name}\n`;
            if (data.description) message += `📖 Mô tả: ${data.description}\n`;
            if (data.location) message += `📍 Vị trí: ${data.location}\n`;
            if (data.drops && data.drops.length > 0) {
                message += `💎 Phần thưởng:\n`;
                for (const drop of data.drops) {
                    message += `• ${drop.name} (⭐ ${drop.rarity}) – ${drop.source}\n`;
                }
            }
            if (data.artifacts && data.artifacts.length > 0) {
                message += `🏺 Artifact có thể rơi:\n`;
                for (const art of data.artifacts) {
                    message += `• ${art.name} (tối đa ⭐ ${art.max_rarity})\n`;
                }
            }
            return message;
        },
        domains: (data) => {
            let message = `🔍 THÔNG TIN DOMAIN GENSHIN IMPACT\n\n`;
            message += `🏯 Tên: ${data.name}\n`;
            if (data.description) message += `📖 Mô tả: ${data.description}\n`;
            if (data.location) message += `📍 Vị trí: ${data.location}\n`;
            if (data.nation) message += `🌏 Quốc gia: ${data.nation}\n`;
            if (data.requirements && Array.isArray(data.requirements)) {
                message += `\n⚠️ YÊU CẦU & HIỆU ỨNG LEY LINE:\n`;
                data.requirements.forEach(req => {
                    message += `• AR ${req.adventureRank}+ | Level ${req.recommendedLevel}\n`;
                    if (req.leyLineDisorder && req.leyLineDisorder.length > 0) {
                        message += `  - Hiệu ứng: ${req.leyLineDisorder.join("\n  ")}\n`;
                    }
                });
            }
            if (data.recommendedElements && data.recommendedElements.length > 0) {
                message += `\n✨ Nguyên tố đề xuất: ${data.recommendedElements.join(", ")}\n`;
            }
            if (data.rewards && Array.isArray(data.rewards)) {
                message += `\n💎 PHẦN THƯỞNG:\n`;
                const artifactDrops = new Set();
                const otherDrops = [];
                data.rewards.forEach(reward => {
                    if (reward.details) {
                        reward.details.forEach(detail => {
                            if (detail.drops) {
                                detail.drops.forEach(drop => {
                                    if (drop.name && drop.rarity) {
                                        artifactDrops.add(`${drop.name} (⭐${drop.rarity})`);
                                    }
                                });
                            }
                            if (detail.mora) {
                                otherDrops.push(`• Mora: ${detail.mora}`);
                            }
                        });
                    }
                });
                if (artifactDrops.size > 0) {
                    message += `• Artifact Sets:\n  - ${Array.from(artifactDrops).join("\n  - ")}\n`;
                }
                if (otherDrops.length > 0) {
                    message += `• Tài nguyên khác:\n  ${otherDrops.join("\n  ")}\n`;
                }
            }
            return message;
        },
        enemies: (data) => {
            let message = `🔍 THÔNG TIN KẺ ĐỊCH GENSHIN IMPACT\n\n`;
            message += `👾 Tên: ${data.name}\n`;
            if (data.region) message += `🗺️ Khu vực: ${data.region}\n`;
            if (data.description) message += `📖 Mô tả: ${data.description}\n`;
            if (data.type) message += `🏷️ Loại: ${data.type}\n`;
            if (data.family) message += `👪 Họ: ${data.family}\n`;
            if (data.faction) message += `🔱 Phe phái: ${data.faction}\n`;
            if (data.elements && data.elements.length > 0) {
                message += `⚡ Nguyên tố: ${data.elements.join(", ")}\n`;
            }
            if (data.drops && data.drops.length > 0) {
                message += `\n💎 PHẦN THƯỞNG:\n`;
                data.drops.forEach(drop => {
                    message += `• ${drop.name} (⭐${drop.rarity}) - Level ${drop["minimum-level"]}+\n`;
                });
            }
            if (data["mora-gained"]) message += `💰 Mora nhận được khi đánh bại: ${data["mora-gained"]}\n`;
            if (data.descriptions && data.descriptions.length > 0) {
                message += `\n📜 THÔNG TIN BỔ SUNG:\n`;
                data.descriptions.forEach(desc => {
                    message += `• ${desc.name}: ${desc.description}\n`;
                });
            }
            return message;
        }
    };

    return formatters[type]?.(data) || `🔍 THÔNG TIN ${type.toUpperCase()} GENSHIN IMPACT\n\n` +
        Object.entries(data)
        .map(([key, value]) => `• ${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
        .join("\n");
}

// Hàm tìm kiếm và hiển thị kết quả
async function searchGenshinData(api, threadID, type, name) {
    const BASE_URL = "https://genshin.jmp.blue";

    // Xử lý input an toàn
    let formattedName = name
        .replace(/[^a-z0-9\s-]/g, '') // Loại bỏ ký tự đặc biệt
        .trim()
        .replace(/\s+/g, '-')
        .toLowerCase();

    if (formattedName.length > 50) {
        return api.sendMessage('❌ Tên tìm kiếm quá dài!', threadID);
    }

    const cacheKey = `detail:${type}:${formattedName}`;
    let cachedData = cache.get(cacheKey);

    if (cachedData) {
        return api.sendMessage(cachedData.message, threadID);
    }

    try {
        let url = type === "boss" ? `${BASE_URL}/boss/weekly-boss/${formattedName}` : `${BASE_URL}/${type}/${formattedName}`;
        const response = await axios.get(url);
        const data = response.data;

        const message = formatData(type, data);

        api.sendMessage(message, threadID, (error, info) => {
            if (error) return console.error(`Lỗi khi gửi thông tin chi tiết:`, error);
            console.log(`Đã gửi thông tin chi tiết về ${type} ${name}`);
        });

        // Lưu vào cache
        cache.set(cacheKey, {
            message
        });

    } catch (error) {
        console.error(`❌ Lỗi khi tìm kiếm ${type} ${name}:`, error);
        let errorMessage = `⚠️ Đã xảy ra lỗi khi tìm kiếm "${name}" trong mục ${type}!`;
        if (error.response) {
            if (error.response.status === 404) {
                errorMessage = `❌ Không tìm thấy thông tin về "${name}" trong mục ${type}!`;
            } else if (error.response.status === 429) {
                errorMessage = `⚠️ Quá nhiều yêu cầu! Vui lòng thử lại sau vài giây.`;
            }
        } else if (error.code === 'ECONNABORTED') {
            errorMessage = `⚠️ Hết thời gian kết nối! Vui lòng thử lại.`;
        }
        return api.sendMessage(errorMessage, threadID);
    }
}

function getTypeEmoji(type) {
    const emojiMap = {
        "artifacts": "🏺",
        "boss": "👹",
        "characters": "👤",
        "domains": "🏯",
        "elements": "🔮",
        "enemies": "👾",
        "nations": "🏰",
        "weapons": "⚔️"
    };

    return emojiMap[type] || "📌";
}
