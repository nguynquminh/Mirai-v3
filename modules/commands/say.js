module.exports.config = {
    name: "say",
    version: "1.2.1",
    hasPermssion: 0,
    credits: "Mirai Team & Modified by Minh",
    description: "Chuyển văn bản thành giọng nói",
    commandCategory: "media",
    usages: "[lang] [text] hoặc reply tin nhắn",
    cooldowns: 5,
    dependencies: {
        "path": "",
        "fs-extra": "",
        "axios": ""
    }
};

module.exports.run = async function({ api, event, args }) {
    try {
        // Kiểm tra threadInfo trước khi xử lý
        if (!event.threadID || !api.getThreadInfo) {
            return console.log("Không thể lấy thông tin nhóm");
        }

        const { createReadStream, unlinkSync } = require("fs-extra");
        const { resolve } = require("path");
        const axios = require("axios");
        
        const languages = {
            'ru': 'Russian', 'en': 'English', 'ko': 'Korean', 
            'ja': 'Japanese', 'vi': 'Vietnamese', 'zh': 'Chinese',
            'fr': 'French', 'de': 'German', 'es': 'Spanish'
        };

        // Lấy nội dung an toàn
        let content = "";
        try {
            content = event.type === "message_reply" 
                ? (event.messageReply.body || "")
                : (args.join(" ") || "");
        } catch (e) {
            console.error("Lỗi lấy nội dung:", e);
        }

        if (!content) {
            return api.sendMessage("Vui lòng nhập văn bản hoặc reply tin nhắn", event.threadID);
        }

        // Xác định ngôn ngữ an toàn
        let languageToSay = global.config.language || 'vi';
        let msg = content;
        
        for (const [code] of Object.entries(languages)) {
            if (content.startsWith(`${code} `)) {
                languageToSay = code;
                msg = content.slice(code.length + 1);
                break;
            }
        }

        if (msg.length > 500) {
            return api.sendMessage("Văn bản quá dài! Tối đa 500 ký tự.", event.threadID);
        }

        const path = resolve(__dirname, 'cache', `voice_${Date.now()}.mp3`);
        
        try {
            const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(msg)}&tl=${languageToSay}&client=tw-ob`;
            const response = await axios({
                method: 'GET',
                url: ttsUrl,
                responseType: 'stream'
            });

            await new Promise((resolve, reject) => {
                const writer = require("fs").createWriteStream(path);
                response.data.pipe(writer);
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            await api.sendMessage({
                body: `🎤 ${msg}`,
                attachment: createReadStream(path)
            }, event.threadID);

        } catch (error) {
            console.error("Lỗi API Google TTS:", error);
            return api.sendMessage("Lỗi khi tạo giọng nói, vui lòng thử lại sau.", event.threadID);
        } finally {
            try { unlinkSync(path); } catch (e) { console.error("Lỗi xóa file:", e); }
        }

    } catch (e) {
        console.error("Lỗi tổng thể:", e);
        // Không cần gửi thông báo lỗi để tránh spam
    }
};