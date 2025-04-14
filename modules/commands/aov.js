const axios = require("axios");
const fs = require("fs");
const path = require("path");
const request = require("request");

// Utility function
async function getStreamFromURL(url) {
    return new Promise((resolve, reject) => {
        request(url)
            .on("response", function(res) {
                if (res.statusCode !== 200) return reject();
            })
            .on("error", reject)
            .pipe(fs.createWriteStream("tmp.jpg")).on("finish", () => {
                resolve(fs.createReadStream("tmp.jpg"));
            });
    });
}

module.exports.config = {
    name: "aov",
    version: "2.1.0",
    hasPermssion: 0,
    credits: "qm",
    description: "Hệ thống tra cứu AOV sử dụng handle reply",
    commandCategory: "Thông tin",
    usages: "",
    cooldowns: 5
};

const API_BASE = "https://aov-api.onrender.com/api";

// Thay đổi phần main menu
module.exports.run = async function({
    api,
    event
}) {
    const {
        threadID
    } = event;

    const menuMessage = `╔══════════════════════╗
║   🎮 AOV TRA CỨU 🎮   ║
╚══════════════════════╝

📌 𝗩𝘂𝗶 𝗹𝗼̀𝗻𝗴 𝗰𝗵𝗼̣𝗻 𝗰𝗵𝘂̛́𝗰 𝗻𝗮̆𝗻𝗴:

┏━━━━━━━━━━━━━━━━━━━━┓
┃ 𝟭. 🧙‍♂️ 𝗧𝗵𝗼̂𝗻𝗴 𝘁𝗶𝗻 𝘁𝘂̛𝗼̛́𝗻𝗴
┃ 𝟮. 🛡️ 𝗧𝗿𝗮𝗻𝗴 𝗯𝗶̣
┃ 𝟯. 💎 𝗡𝗴𝗼̣𝗰
┃ 𝟰. ✨ 𝗣𝗵𝗲́𝗽 𝗯𝗼̂̉ 𝘁𝗿𝗼̛̣
┃ 𝟱. 🏆 𝗣𝗵𝘂̀ 𝗵𝗶𝗲̣̂𝘂
┃ 𝟲. 🎲 𝗖𝗵𝗲̂́ đ𝗼̣̂ 𝗰𝗵𝗼̛𝗶
┗━━━━━━━━━━━━━━━━━━━━┛

📝 𝗥𝗲𝗽𝗹𝘆 𝘀𝗼̂́ 𝘁𝘂̛𝗼̛𝗻𝗴 𝘂̛́𝗻𝗴 đ𝗲̂̉ 𝗰𝗵𝗼̣𝗻`;

    return api.sendMessage(menuMessage, threadID, (err, info) => {
        global.client.handleReply.push({
            name: "aov",
            messageID: info.messageID,
            author: event.senderID,
            type: "mainMenu"
        });
    });
};

module.exports.handleReply = async function({
    api,
    event,
    handleReply
}) {
    const {
        threadID,
        body,
        senderID
    } = event;
    const {
        type,
        author,
        data = {},
        page = 1
    } = handleReply;

    if (senderID !== author) return;

    try {
        const input = body.trim().toLowerCase();

        // Main menu handler
        if (type === "mainMenu") {
            const choice = parseInt(input);
            if (isNaN(choice)) return api.sendMessage("⚠️ Vui lòng nhập số từ 1-6", threadID);

            switch (choice) {
                case 1: // Hero
                    const heroes = await getHeroes();
                    return sendHeroList(api, threadID, senderID, heroes);
                case 2: // Equipment
                    const equips = await getEquipments();
                    return sendEquipList(api, threadID, senderID, equips);
                case 3: // Rune
                    const runes = await getRunes();
                    return sendRuneList(api, threadID, senderID, runes);
                case 4: // Spell
                    const spells = await getSpells();
                    return sendSpellList(api, threadID, senderID, spells);
                case 5: // Badge
                    const badges = await getBadges();
                    return sendBadgeList(api, threadID, senderID, badges);
                case 6: // Game Mode
                    const gameModes = await getGameModes();
                    return sendGameModeList(api, threadID, senderID, gameModes);
                default:
                    return api.sendMessage("⚠️ Vui lòng chọn số từ 1-6", threadID);
            }
        }

        // Hero handlers
        if (type === "heroList") {
            if (input === "back") return mainMenu(api, threadID, senderID);

            if (input.startsWith("info ")) {
                const heroName = input.split("info ")[1];
                const hero = await searchHero(heroName);
                if (!hero) return api.sendMessage("❌ Không tìm thấy tướng", threadID);
                return sendHeroDetail(api, threadID, senderID, hero);
            }

            const newPage = parseInt(input);
            if (!isNaN(newPage)) {
                return sendHeroList(api, threadID, senderID, data.heroes, newPage);
            }

            return api.sendMessage("⚠️ Vui lòng nhập số trang hoặc 'info <tên>'", threadID);
        }

        if (type === "heroDetail") {
            if (input === "back") return sendHeroList(api, threadID, senderID, data.heroes);
            if (input === "skill") return sendHeroSkills(api, threadID, senderID, data.hero);
            if (input === "skin") return sendHeroSkins(api, threadID, senderID, data.hero);
            return api.sendMessage("⚠️ Vui lòng reply 'skill', 'skin' hoặc 'back'", threadID);
        }

        // Equipment handlers
        if (type === "equipList") {
            if (input === "back") return mainMenu(api, threadID, senderID);

            if (input.startsWith("search ")) {
                const equipName = input.split("search ")[1];
                const equip = await searchEquipment(equipName);
                if (!equip) return api.sendMessage("❌ Không tìm thấy trang bị", threadID);
                return sendEquipDetail(api, threadID, senderID, equip);
            }

            const newPage = parseInt(input);
            if (!isNaN(newPage)) {
                return sendEquipList(api, threadID, senderID, data.equips, newPage);
            }

            return api.sendMessage("⚠️ Vui lòng nhập số trang hoặc 'search <tên>'", threadID);
        }

        // Rune handlers
        if (type === "runeList") {
            if (input === "back") return mainMenu(api, threadID, senderID);

            if (input.startsWith("search ")) {
                const runeName = input.split("search ")[1];
                const rune = await searchRune(runeName);
                if (!rune) return api.sendMessage("❌ Không tìm thấy ngọc", threadID);
                return sendRuneDetail(api, threadID, senderID, rune);
            }

            const newPage = parseInt(input);
            if (!isNaN(newPage)) {
                return sendRuneList(api, threadID, senderID, data.runes, newPage);
            }

            return api.sendMessage("⚠️ Vui lòng nhập số trang hoặc 'search <tên>'", threadID);
        }

        // Spell handlers
        if (type === "spellList") {
            if (input === "back") return mainMenu(api, threadID, senderID);

            if (input.startsWith("search ")) {
                const spellName = input.split("search ")[1];
                const spell = await searchSpell(spellName);
                if (!spell) return api.sendMessage("❌ Không tìm thấy phép", threadID);
                return sendSpellDetail(api, threadID, senderID, spell);
            }

            const newPage = parseInt(input);
            if (!isNaN(newPage)) {
                return sendSpellList(api, threadID, senderID, data.spells, newPage);
            }

            return api.sendMessage("⚠️ Vui lòng nhập số trang hoặc 'search <tên>'", threadID);
        }

        // Badge handlers
        if (type === "badgeList") {
            if (input === "back") return mainMenu(api, threadID, senderID);

            const badgeIndex = parseInt(input) - 1;
            if (!isNaN(badgeIndex) && badgeIndex >= 0 && badgeIndex < data.badges.length) {
                return sendBadgeDetail(api, threadID, senderID, data.badges[badgeIndex]);
            }

            return api.sendMessage("⚠️ Vui lòng nhập số thứ tự", threadID);
        }

        if (type === "badgeDetail") {
            if (input === "back") return sendBadgeList(api, threadID, senderID, data.badges);

            const skillIndex = parseInt(input) - 1;
            if (!isNaN(skillIndex)) {
                const allSkills = data.badge.groups.reduce((arr, g) => arr.concat(g.skills), []);
                if (skillIndex >= 0 && skillIndex < allSkills.length) {
                    return sendSkillDetail(api, threadID, senderID, allSkills[skillIndex], data.badge);
                }
            }

            const foundSkill = data.badge.groups
                .reduce((arr, g) => arr.concat(g.skills), [])
                .find(s => s.name.toLowerCase() === input);

            if (foundSkill) {
                return sendSkillDetail(api, threadID, senderID, foundSkill, data.badge);
            }

            const suggestions = data.badge.groups
                .reduce((arr, g) => arr.concat(g.skills), [])
                .map(s => `🔹 ${s.name}`)
                .join("\n");

            return api.sendMessage(
                `❌ Không tìm thấy kỹ năng \"${body.trim()}\".\n📌 Gợi ý:\n\n${suggestions}`,
                threadID
            );
        }

        // Game Mode handlers
        if (type === "gameModeList") {
            if (input === "back") return mainMenu(api, threadID, senderID);

            if (input.startsWith("search ")) {
                const modeName = input.split("search ")[1];
                const gameMode = await searchGameMode(modeName);
                if (!gameMode) return api.sendMessage("❌ Không tìm thấy chế độ chơi", threadID);
                return sendGameModeDetail(api, threadID, senderID, gameMode);
            }

            const newPage = parseInt(input);
            if (!isNaN(newPage)) {
                return sendGameModeList(api, threadID, senderID, data.gameModes, newPage);
            }

            return api.sendMessage("⚠️ Vui lòng nhập số trang hoặc 'search <tên>'", threadID);
        }

        if (type === "gameModeDetail") {
            if (input === "back") return sendGameModeList(api, threadID, senderID, data.gameModes);
            return api.sendMessage("⚠️ Vui lòng reply 'back' để quay lại", threadID);
        }

    } catch (error) {
        console.error(error);
        return api.sendMessage("❌ Đã xảy ra lỗi khi xử lý yêu cầu", threadID);
    }
};

// ====================== HELPER FUNCTIONS ======================
async function mainMenu(api, threadID, senderID) {
    return api.sendMessage(
        "⚔️ AOV Tra Cứu - Vui lòng chọn chức năng:\n\n" +
        "1. Thông tin tướng\n" +
        "2. Trang bị\n" +
        "3. Ngọc\n" +
        "4. Phép bổ trợ\n" +
        "5. Phù hiệu\n\n" +
        "💬 Reply số tương ứng để chọn",
        threadID,
        (err, info) => {
            global.client.handleReply.push({
                name: "aov",
                messageID: info.messageID,
                author: senderID,
                type: "mainMenu"
            });
        }
    );
}

// Hero functions
async function sendHeroList(api, threadID, senderID, heroes, page = 1) {
    const perPage = 10;
    const totalPages = Math.ceil(heroes.length / perPage);
    const start = (page - 1) * perPage;
    const paginated = heroes.slice(start, start + perPage);

    let listMessage = `╭───────────────────────╮
│ 📜 𝗗𝗔𝗡𝗛 𝗦𝗔́𝗖𝗛 𝗧𝗨̛𝗢̛́𝗡𝗚 │
├───────────────────────┤
│ Trang: ${page}/${totalPages}          │
╰───────────────────────╯\n\n`;

    paginated.forEach((h, i) => {
        listMessage += `▸ ${start + i + 1}. ${h.name}\n`;
    });

    listMessage += `
━━━━━━━━━━━━━━━━━━━━
📌 𝗧𝘂̀𝘆 𝗰𝗵𝗼̣𝗻:
  🔹 𝗥𝗲𝗽𝗹𝘆 𝘀𝗼̂́ 𝘁𝗿𝗮𝗻𝗴 → 𝘅𝗲𝗺 𝘁𝗶𝗲̂́𝗽
  🔹 𝗥𝗲𝗽𝗹𝘆 '𝗶𝗻𝗳𝗼 <𝘁𝗲̂𝗻>' → 𝘁𝗿𝗮 𝗰𝘂̛́𝘂
  🔹 𝗥𝗲𝗽𝗹𝘆 '𝗯𝗮𝗰𝗸' → 𝘃𝗲̂̀ 𝗺𝗲𝗻𝘂`;

    return api.sendMessage(listMessage, threadID, (err, info) => {
        global.client.handleReply.push({
            name: "aov",
            messageID: info.messageID,
            author: senderID,
            type: "heroList",
            data: {
                heroes
            },
            page
        });
    });
}

async function sendHeroDetail(api, threadID, senderID, hero) {
    const img = await axios.get(hero.image, {
        responseType: "stream"
    });

    const cardMessage = `╔══════════════════════╗
║    🧙‍♂️ ${hero.name.toUpperCase()}    ║
╚══════════════════════╝

▸ 📌 𝗧𝗵𝗼̂𝗻𝗴 𝘁𝗶𝗻 𝗰𝗼̛ 𝗯𝗮̉𝗻:
   ╰─✦ Độ khó: ${hero.difficulty || 'Chưa cập nhật'}
   ╰─✦ Vị trí: ${hero.role || 'Chưa cập nhật'}

▸ 🔗 𝗟𝗶𝗻𝗸 𝘁𝗿𝗮 𝗰𝘂̛́𝘂: ${hero.url}

━━━━━━━━━━━━━━━━━━━━
💡 𝗧𝘂̀𝘆 𝗰𝗵𝗼̣𝗻:
  🔸 𝗥𝗲𝗽𝗹𝘆 '𝘀𝗸𝗶𝗹𝗹' → 𝘅𝗲𝗺 𝗸𝘆̃ 𝗻𝗮̆𝗻𝗴
  🔸 𝗥𝗲𝗽𝗹𝘆 '𝘀𝗸𝗶𝗻' → 𝘅𝗲𝗺 𝘁𝗿𝗮𝗻𝗴 𝗽𝗵𝘂̣𝗰
  🔸 𝗥𝗲𝗽𝗹𝘆 '𝗯𝗮𝗰𝗸' → 𝗾𝘂𝗮𝘆 𝗹𝗮̣𝗶`;

    return api.sendMessage({
        body: cardMessage,
        attachment: img.data
    }, threadID, (err, info) => {
        global.client.handleReply.push({
            name: "aov",
            messageID: info.messageID,
            author: senderID,
            type: "heroDetail",
            data: {
                hero
            }
        });
    });
}

async function sendHeroSkills(api, threadID, senderID, hero) {
    let skillHeader = `╭───────────────────────╮
│ 🌀 𝗞𝗬̃ 𝗡𝗔̆𝗡𝗚 ${hero.name.toUpperCase()} 🌀 │
╰───────────────────────╯\n\n`;

    for (const s of hero.skills) {
        const attachment = (await axios.get(s.skill_image, {
            responseType: "stream"
        })).data;
        const skillInfo = `▸ 𝗧𝗲̂𝗻: ${s.skill_name}
▸ 𝗧𝗶𝗲̂𝘂 𝘁𝗼̂́n: ${s.element || 'Chưa cập nhật'} mana
▸ 𝗖𝗼𝗼𝗹𝗱𝗼𝘄𝗻: ${s.cooldown || 'Chưa cập nhật'}s

📝 𝗠𝗼̂ 𝘁𝗮̉:
${s.description}\n
━━━━━━━━━━━━━━━━━━━━`;

        await api.sendMessage({
            body: skillHeader + skillInfo,
            attachment
        }, threadID);
        skillHeader = ''; // Chỉ hiển thị header ở skill đầu tiên
    }

    return api.sendMessage(
        "💬 𝗥𝗲𝗽𝗹𝘆 '𝗯𝗮𝗰𝗸' đ𝗲̂̉ 𝘃𝗲̂̀ 𝘁𝗵𝗼̂𝗻𝗴 𝘁𝗶𝗻 𝘁𝘂̛𝗼̛́𝗻𝗴",
        threadID
    );
}

async function sendHeroSkins(api, threadID, senderID, hero) {
    for (const s of hero.skins) {
        const attachment = (await axios.get(s.skin_image, {
            responseType: "stream"
        })).data;
        await api.sendMessage({
            body: `✨ ${s.skin_name}`,
            attachment
        }, threadID);
    }

    return api.sendMessage(
        "💬 Reply 'back' để quay lại thông tin tướng",
        threadID,
        (err, info) => {
            global.client.handleReply.push({
                name: "aov",
                messageID: info.messageID,
                author: senderID,
                type: "heroDetail",
                data: {
                    hero,
                    heroes: hero.heroes || []
                }
            });
        }
    );
}

// Equipment functions
async function sendEquipList(api, threadID, senderID, equips, page = 1) {
    const perPage = 10;
    const totalPages = Math.ceil(equips.length / perPage);
    const start = (page - 1) * perPage;
    const paginated = equips.slice(start, start + perPage);

    let msg = `🛡️ Danh sách trang bị (Trang ${page}/${totalPages}):\n`;
    paginated.forEach((e, i) => msg += `${start + i + 1}. ${e.name} - ${e.price} vàng\n`);
    msg += "\n💬 Reply:\n- Số trang để xem tiếp\n- 'search <tên>' để tìm kiếm\n- 'back' để quay lại";

    return api.sendMessage(msg, threadID, (err, info) => {
        global.client.handleReply.push({
            name: "aov",
            messageID: info.messageID,
            author: senderID,
            type: "equipList",
            data: {
                equips
            },
            page
        });
    });
}

async function sendEquipDetail(api, threadID, senderID, equip) {
    const stats = equip.stats.map(s => `⫸ ${s}`).join("\n");
    const img = await axios.get(equip.image, {
        responseType: "stream"
    });

    const equipCard = `╔══════════════════════╗
║ 🛡️ ${equip.name.toUpperCase()} 🛡️ ║
╚══════════════════════╝

▸ 💰 𝗚𝗶𝗮́: ${equip.price} vàng
▸ 📜 𝗧𝗵𝘂𝗼̣̂𝗰 𝘁𝗶́𝗻𝗵:
${stats}

━━━━━━━━━━━━━━━━━━━━
💡 𝗧𝘂̀𝘆 𝗰𝗵𝗼̣𝗻:
  🔹 𝗥𝗲𝗽𝗹𝘆 '𝗯𝗮𝗰𝗸' → 𝘃𝗲̂̀ 𝗗𝗮𝗻𝗵 𝘀𝗮́𝗰𝗵`;

    return api.sendMessage({
        body: equipCard,
        attachment: img.data
    }, threadID);
}

// Rune functions
async function sendRuneList(api, threadID, senderID, runes, page = 1) {
    const perPage = 10;
    const totalPages = Math.ceil(runes.length / perPage);
    const start = (page - 1) * perPage;
    const paginated = runes.slice(start, start + perPage);

    let msg = `💎 Danh sách ngọc (Trang ${page}/${totalPages}):\n`;
    paginated.forEach((r, i) => msg += `${start + i + 1}. ${r.name}\n`);
    msg += "\n💬 Reply:\n- Số trang để xem tiếp\n- 'search <tên>' để tìm kiếm\n- 'back' để quay lại";

    return api.sendMessage(msg, threadID, (err, info) => {
        global.client.handleReply.push({
            name: "aov",
            messageID: info.messageID,
            author: senderID,
            type: "runeList",
            data: {
                runes
            },
            page
        });
    });
}

async function sendRuneDetail(api, threadID, senderID, rune) {
    const stats = rune.stats.join("\n");
    const msg = `💎 ${rune.name}\n📜 Thuộc tính:\n${stats}`;
    return api.sendMessage(msg, threadID);
}

// Spell functions
async function sendSpellList(api, threadID, senderID, spells, page = 1) {
    const perPage = 9;
    const totalPages = Math.ceil(spells.length / perPage);
    const start = (page - 1) * perPage;
    const paginated = spells.slice(start, start + perPage);

    let msg = `✨ Danh sách phép bổ trợ (Trang ${page}/${totalPages}):\n`;
    paginated.forEach((s, i) => msg += `${start + i + 1}. ${s.name}\n`);
    msg += "\n💬 Reply:\n- Số trang để xem tiếp\n- 'search <tên>' để tìm kiếm\n- 'back' để quay lại";

    return api.sendMessage(msg, threadID, (err, info) => {
        global.client.handleReply.push({
            name: "aov",
            messageID: info.messageID,
            author: senderID,
            type: "spellList",
            data: {
                spells
            },
            page
        });
    });
}

async function sendSpellDetail(api, threadID, senderID, spell) {
    const attachment = await axios.get(spell.image_url, {
        responseType: "stream"
    });
    const msg = `✨ ${spell.name}\n⏱️ Hồi chiêu: ${spell.cooldown}\n📜 Mô tả: ${spell.description}`;

    return api.sendMessage({
        body: msg,
        attachment: attachment.data
    }, threadID);
}

// Badge functions
async function sendBadgeList(api, threadID, senderID, badges) {
    let msg = "🏆 Danh sách phù hiệu:\n\n";
    badges.forEach((b, i) => msg += `${i + 1}. ${b.name}\n${b.description}\n\n`);
    msg += "💬 Reply số thứ tự để xem chi tiết hoặc 'back' để quay lại";

    return api.sendMessage(msg, threadID, (err, info) => {
        global.client.handleReply.push({
            name: "aov",
            messageID: info.messageID,
            author: senderID,
            type: "badgeList",
            data: {
                badges
            }
        });
    });
}

async function sendBadgeDetail(api, threadID, senderID, badge) {
    let msg = `⚜️ ${badge.name.toUpperCase()} ⚜️\n\n📝 ${badge.description}\n\n📌 Các nhánh phụ:`;
    badge.groups.forEach((group, i) => {
        msg += `\n\n🌟 Cấp ${i + 1}:`;
        group.skills.forEach(skill => {
            msg += `\n🔸 ${skill.name} (${skill.type})`;
        });
    });

    msg += `\n\n💬 Reply số thứ tự hoặc tên kỹ năng để xem chi tiết\n'back' để quay lại`;

    return api.sendMessage(msg, threadID, (err, info) => {
        global.client.handleReply.push({
            name: "aov",
            messageID: info.messageID,
            author: senderID,
            type: "badgeDetail",
            data: {
                badge,
                badges: badge.badges || []
            }
        });
    });
}

async function sendSkillDetail(api, threadID, senderID, skill, badge) {
    const attachment = await getStreamFromURL(skill.image);
    const msg = `📛 ${skill.name} (${skill.type})\n\n📝 ${skill.description}`;

    return api.sendMessage({
        body: msg,
        attachment
    }, threadID, (err, info) => {
        global.client.handleReply.push({
            name: "aov",
            messageID: info.messageID,
            author: senderID,
            type: "badgeDetail",
            data: {
                badge,
                badges: badge.badges || []
            }
        });
    });
}

// Game Mode functions
async function sendGameModeList(api, threadID, senderID, gameModes, page = 1) {
    const perPage = 10;
    const totalPages = Math.ceil(gameModes.length / perPage);
    const start = (page - 1) * perPage;
    const paginated = gameModes.slice(start, start + perPage);

    let msg = `╭───────────────────────╮
│ 🎲 𝗗𝗔𝗡𝗛 𝗦𝗔́𝗖𝗛 𝗖𝗛𝗘̂́ Đ𝗢̣̂ 𝗖𝗛𝗢̛𝗜 │
├───────────────────────┤
│ Trang: ${page}/${totalPages}          │
╰───────────────────────╯\n\n`;

    paginated.forEach((mode, i) => {
        msg += `▸ ${start + i + 1}. ${mode.name}\n`;
    });

    msg += `
━━━━━━━━━━━━━━━━━━━━
📌 𝗧𝘂̀𝘆 𝗰𝗵𝗼̣𝗻:
  🔹 𝗥𝗲𝗽𝗹𝘆 '𝘀𝗲𝗮𝗿𝗰𝗵 <𝘁𝗲̂𝗻>' → 𝘁𝗶̀𝗺 𝗸𝗶𝗲̂́𝗺
  🔹 𝗥𝗲𝗽𝗹𝘆 '𝗯𝗮𝗰𝗸' → 𝘃𝗲̂̀ 𝗺𝗲𝗻𝘂`;

    return api.sendMessage(msg, threadID, (err, info) => {
        global.client.handleReply.push({
            name: "aov",
            messageID: info.messageID,
            author: senderID,
            type: "gameModeList",
            data: {
                gameModes
            },
            page
        });
    });
}

async function sendGameModeDetail(api, threadID, senderID, gameMode) {
    const img = await axios.get(gameMode.image, {
        responseType: "stream"
    });

    const description = gameMode.description.join("\n   ╰─✦ ");

    const cardMessage = `╔══════════════════════╗
║ 🎲 ${gameMode.name.toUpperCase()} 🎲 ║
╚══════════════════════╝

▸ 📌 𝗠𝗼̂ 𝘁𝗮̉:
   ╰─✦ ${description}

▸ 🔗 𝗟𝗶𝗻𝗸 𝘁𝗿𝗮 𝗰𝘂̛́𝘂: ${gameMode.url}

━━━━━━━━━━━━━━━━━━━━
💡 𝗧𝘂̀𝘆 𝗰𝗵𝗼̣𝗻:
  🔸 𝗥𝗲𝗽𝗹𝘆 '𝗯𝗮𝗰𝗸' → 𝗾𝘂𝗮𝘆 𝗹𝗮̣𝗶`;

    return api.sendMessage({
        body: cardMessage,
        attachment: img.data
    }, threadID, (err, info) => {
        global.client.handleReply.push({
            name: "aov",
            messageID: info.messageID,
            author: senderID,
            type: "gameModeDetail",
            data: {
                gameMode
            }
        });
    });
}

// ====================== API FUNCTIONS ======================
async function getHeroes() {
    const res = await axios.get(`${API_BASE}/heroes`);
    return res.data.data;
}

async function searchHero(name) {
    const heroes = await getHeroes();
    return heroes.find(h => h.name.toLowerCase().includes(name.toLowerCase()));
}

async function getEquipments() {
    const res = await axios.get(`${API_BASE}/equipments`);
    return res.data.data;
}

async function searchEquipment(name) {
    const equips = await getEquipments();
    return equips.find(e => e.name.toLowerCase().includes(name.toLowerCase()));
}

async function getRunes() {
    const res = await axios.get(`${API_BASE}/runes`);
    return res.data.data;
}

async function searchRune(name) {
    const runes = await getRunes();
    return runes.find(r => r.name.toLowerCase().includes(name.toLowerCase()));
}

async function getSpells() {
    const res = await axios.get(`${API_BASE}/spells`);
    return res.data.data;
}

async function searchSpell(name) {
    const spells = await getSpells();
    return spells.find(s => s.name.toLowerCase().includes(name.toLowerCase()));
}

async function getBadges() {
    const res = await axios.get(`${API_BASE}/badges`);
    return res.data.data;
}

async function searchBadge(name) {
    const badges = await getBadges();
    return badges.find(b => b.name.toLowerCase().includes(name.toLowerCase()));
}

async function getGameModes() {
    const res = await axios.get(`${API_BASE}/gamemodes`);
    return res.data.data;
}

async function searchGameMode(name) {
    try {
        const encodedName = encodeURIComponent(name);
        const res = await axios.get(`${API_BASE}/gamemodes/search?q=${encodedName}`);
        return res.data.data?.[0];
    } catch (error) {
        console.error(error);
        return null;
    }
}
