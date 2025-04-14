module.exports.config = {
    name: "dragonball",
    version: "6.0.0",
    hasPermssion: 0,
    credits: "qm",
    description: "Xem thông tin nhân vật Dragon Ball với hình ảnh và chỉ số biến hình",
    commandCategory: "Giải trí",
    usages: "[list/info/search] [tên/id]",
    cooldowns: 5,
    dependencies: {
        "axios": "",
        "fs-extra": "",
        "path": ""
    }
};

const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

// Cấu hình thư mục cache
const CACHE_DIR = path.join(__dirname, 'cache', 'dragonball');
if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// Hàm tải ảnh với retry và timeout
async function downloadImage(url, filename) {
    const filePath = path.join(CACHE_DIR, `${filename}.jpg`);
    
    for (let retry = 0; retry < 3; retry++) {
        try {
            const response = await axios({
                method: 'GET',
                url: url,
                responseType: 'stream',
                timeout: 15000
            });

            const writer = fs.createWriteStream(filePath);
            response.data.pipe(writer);

            return new Promise((resolve, reject) => {
                writer.on('finish', () => resolve(filePath));
                writer.on('error', reject);
            });
        } catch (err) {
            if (retry === 2) throw err;
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
}

// Hàm hiển thị danh sách nhân vật
async function showCharacterList(api, threadID, messageID) {
    try {
        const response = await axios.get('https://dragonball-api.com/api/characters?limit=70');
        const characters = response.data.items;
        
        let message = '📋 DANH SÁCH NHÂN VẬT DRAGON BALL 📋\n\n';
        characters.forEach((char, index) => {
            message += `${index + 1}. ${char.name} (ID: ${char.id})\n`;
        });
        
        message += `\nSử dụng lệnh: ${global.config.PREFIX}dragonball info [ID] để xem chi tiết`;
        
        api.sendMessage(message, threadID, messageID);
    } catch (error) {
        console.error(error);
        api.sendMessage('❌ Lỗi khi tải danh sách nhân vật!', threadID, messageID);
    }
}

// Hàm gửi thông tin biến hình chi tiết
async function sendTransformations(api, threadID, charName, transformations) {
    try {
        // Gửi thông báo bắt đầu
        await api.sendMessage(`🌀 Bắt đầu hiển thị ${transformations.length} biến hình của ${charName}...`, threadID);

        // Gửi từng ảnh với thông tin chi tiết
        for (const [index, trans] of transformations.entries()) {
            try {
                const imagePath = await downloadImage(trans.image, `trans_${index}_${Date.now()}`);
                
                await api.sendMessage({
                    body: `✨ ${charName} - ${trans.name}\n💥 Sức mạnh: ${trans.ki}\n🆔 ID biến hình: ${trans.id}\n📊 Thứ tự: ${index + 1}/${transformations.length}`,
                    attachment: fs.createReadStream(imagePath)
                }, threadID);
                
                fs.unlinkSync(imagePath);
                await new Promise(resolve => setTimeout(resolve, 1200));
                
            } catch (e) {
                console.error(`Lỗi khi gửi biến hình ${index + 1}:`, e);
                await api.sendMessage(`❌ Không thể tải biến hình ${transformations[index].name}`, threadID);
            }
        }

        // Gửi tổng kết
        await api.sendMessage(
            `✅ Đã hiển thị tất cả ${transformations.length} biến hình của ${charName}`,
            threadID
        );

    } catch (error) {
        console.error('Lỗi khi gửi biến hình:', error);
        await api.sendMessage('❌ Đã xảy ra lỗi khi hiển thị biến hình!', threadID);
    }
}

// Hàm hiển thị thông tin nhân vật
async function showCharacterInfo(api, threadID, messageID, charId) {
    try {
        const response = await axios.get(`https://dragonball-api.com/api/characters/${charId}`);
        const char = response.data;
        
        let message = `⚡ THÔNG TIN NHÂN VẬT: ${char.name} ⚡\n\n`;
        message += `🆔 ID: ${char.id}\n`;
        message += `👤 Giới tính: ${char.gender}\n`;
        message += `🧬 Chủng tộc: ${char.race}\n`;
        message += `💥 Sức mạnh: ${char.ki}\n`;
        message += `💫 Sức mạnh tối đa: ${char.maxKi}\n`;
        message += `🏷️ Phe phái: ${char.affiliation}\n\n`;
        
        if (char.transformations?.length > 0) {
            message += `✨ Có ${char.transformations.length} dạng biến hình\n`;
        }
        
        message += `📝 Mô tả:\n${char.description || 'Không có mô tả'}`;
        
        // Gửi ảnh nhân vật chính
        try {
            const charImagePath = await downloadImage(char.image, `char_${char.id}_${Date.now()}`);
            await api.sendMessage({
                body: message,
                attachment: fs.createReadStream(charImagePath)
            }, threadID);
            fs.unlinkSync(charImagePath);
            
            // Gửi biến hình nếu có
            if (char.transformations?.length > 0) {
                await sendTransformations(api, threadID, char.name, char.transformations);
            }
        } catch (e) {
            console.error('Lỗi khi xử lý ảnh:', e);
            await api.sendMessage(message, threadID);
            await api.sendMessage('❌ Không thể tải hình ảnh nhân vật', threadID);
        }
        
    } catch (error) {
        console.error(error);
        api.sendMessage('❌ Không tìm thấy nhân vật hoặc đã xảy ra lỗi!', threadID, messageID);
    }
}

// Hàm tìm kiếm nhân vật
async function searchCharacter(api, threadID, messageID, query) {
    try {
        const response = await axios.get('https://dragonball-api.com/api/characters?limit=100');
        const characters = response.data.items.filter(char => 
            char.name.toLowerCase().includes(query.toLowerCase())
        );
        
        if (characters.length === 0) {
            return api.sendMessage('❌ Không tìm thấy nhân vật phù hợp!', threadID, messageID);
        }
        
        let message = `🔍 KẾT QUẢ TÌM KIẾM CHO "${query}" 🔍\n\n`;
        characters.slice(0, 10).forEach(char => {
            message += `→ ${char.name} (ID: ${char.id})\n`;
        });
        
        if (characters.length > 10) {
            message += `\n⚠️ Hiển thị 10/${characters.length} kết quả. Vui lòng tìm kiếm cụ thể hơn.`;
        }
        
        message += `\nSử dụng lệnh: ${global.config.PREFIX}dragonball info [ID] để xem chi tiết`;
        
        api.sendMessage(message, threadID, messageID);
    } catch (error) {
        console.error(error);
        api.sendMessage('❌ Lỗi khi tìm kiếm nhân vật!', threadID, messageID);
    }
}

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID } = event;
    
    try {
        if (!args[0]) {
            const menuMessage = `⚡ DRAGON BALL CHARACTER MENU ⚡\n\n`
                + `Các lệnh sử dụng:\n`
                + `→ ${global.config.PREFIX}dragonball list - Xem danh sách nhân vật\n`
                + `→ ${global.config.PREFIX}dragonball info [ID] - Xem thông tin nhân vật\n`
                + `→ ${global.config.PREFIX}dragonball search [tên] - Tìm kiếm nhân vật\n\n`
                + `Ví dụ:\n`
                + `${global.config.PREFIX}dragonball info 1\n`
                + `${global.config.PREFIX}dragonball search Goku`;
            
            return api.sendMessage(menuMessage, threadID, messageID);
        }

        const action = args[0].toLowerCase();
        
        if (action === 'list') {
            await showCharacterList(api, threadID, messageID);
        } 
        else if (action === 'info') {
            if (!args[1]) {
                return api.sendMessage('⚠️ Vui lòng nhập ID nhân vật!', threadID, messageID);
            }
            await showCharacterInfo(api, threadID, messageID, args[1]);
        }
        else if (action === 'search' || action === 'tìm') {
            if (!args[1]) {
                return api.sendMessage('⚠️ Vui lòng nhập tên nhân vật cần tìm!', threadID, messageID);
            }
            await searchCharacter(api, threadID, messageID, args.slice(1).join(' '));
        }
        else {
            api.sendMessage('⚠️ Lệnh không hợp lệ! Vui lòng xem menu hướng dẫn.', threadID, messageID);
        }
    } catch (error) {
        console.error(error);
        api.sendMessage('❌ Đã xảy ra lỗi khi thực hiện lệnh!', threadID, messageID);
    }
};