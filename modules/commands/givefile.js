const fs = require("fs-extra");
const path = require("path");
const stringSimilarity = require('string-similarity');

module.exports = {
    config: {
        name: 'givefile',
        version: '2.0.0',
        hasPermssion: 2, // 0: User | 1: Admin QTV | 2: Admin Bot
        credits: 'D-Jukie & Modified by Minh Đạt',
        description: 'Chia sẻ file lệnh của bot với người dùng',
        commandCategory: 'Hệ thống admin-bot',
        usages: '[tên file] (hoặc reply để gửi riêng)',
        cooldowns: 3,
        dependencies: {
            "string-similarity": "",
            "fs-extra": ""
        }
    },

    handleReaction: async function({
        api,
        event,
        handleReaction,
        Users
    }) {
        try {
            const {
                file,
                author,
                type,
                uid,
                namee
            } = handleReaction;

            // Kiểm tra người dùng thả reaction
            if (event.userID !== author) return;

            const fileSend = `${file}.js`;
            const tempFile = `${file}.txt`;
            const filePath = path.join(__dirname, fileSend);
            const tempPath = path.join(__dirname, tempFile);

            if (!fs.existsSync(filePath)) {
                return api.sendMessage('❌ File không tồn tại hoặc đã bị xóa', event.threadID);
            }

            await fs.copyFile(filePath, tempPath);
            await api.unsendMessage(handleReaction.messageID);

            const messageOptions = {
                body: `📁 File ${file}.js của bạn đây`,
                attachment: fs.createReadStream(tempPath)
            };

            switch (type) {
                case "user": {
                    await api.sendMessage(messageOptions, uid);
                    await fs.unlink(tempPath);
                    return api.sendMessage(`✅ Đã gửi file ${file}.js đến ${namee}`, event.threadID);
                }
                case "thread": {
                    await api.sendMessage(messageOptions, event.threadID);
                    return fs.unlink(tempPath);
                }
            }
        } catch (error) {
            console.error('Lỗi handleReaction:', error);
            return api.sendMessage('❌ Đã xảy ra lỗi khi xử lý', event.threadID);
        }
    },

    run: async function({
        api,
        event,
        args,
        Users
    }) {
        try {
            // DANH SÁCH ADMIN BOT ĐƯỢC PHÉP SỬ DỤNG
            const BOT_ADMINS = [
                "100084924943916", // UID của bạn
                // Thêm UID admin khác nếu cần
            ];

            // Kiểm tra quyền
            if (!BOT_ADMINS.includes(event.senderID.toString())) {
                return api.sendMessage(`⛔ Bạn không có quyền sử dụng lệnh này!`, event.threadID, event.messageID);
            }

            const fileName = args.join(" ").trim();

            // Validate input
            if (!fileName) {
                return api.sendMessage('ℹ️ Vui lòng nhập tên file cần lấy\nVí dụ: givefile help', event.threadID, event.messageID);
            }

            if (!fileName.endsWith('.js')) {
                return api.sendMessage('⚠️ Chỉ hỗ trợ file có đuôi .js', event.threadID, event.messageID);
            }

            const filePath = path.join(__dirname, fileName);

            // Trường hợp reply để gửi riêng
            if (event.type === "message_reply") {
                const uid = event.messageReply.senderID;
                const userInfo = await Users.getData(uid);
                const name = userInfo.name || "người dùng";

                if (!fs.existsSync(filePath)) {
                    return this.handleFileNotFound(api, event, fileName, uid, name);
                }

                return this.sendFileToUser(api, event, fileName, uid, name);
            }

            // Trường hợp gửi chung trong nhóm
            if (!fs.existsSync(filePath)) {
                return this.handleFileNotFound(api, event, fileName);
            }

            return this.sendFileToThread(api, event, fileName);
        } catch (error) {
            console.error('Lỗi khi chạy lệnh:', error);
            return api.sendMessage('❌ Đã xảy ra lỗi khi thực hiện lệnh', event.threadID, event.messageID);
        }
    },

    handleFileNotFound: function(api, event, fileName, uid, name) {
        const commands = fs.readdirSync(__dirname)
            .filter(file => file.endsWith(".js"))
            .map(file => file.replace(/\.js/g, ""));

        const match = stringSimilarity.findBestMatch(fileName.replace('.js', ''), commands);

        if (match.bestMatch.rating < 0.5) {
            return api.sendMessage(`🔍 Không tìm thấy file "${fileName}"`, event.threadID, event.messageID);
        }

        const bestMatch = match.bestMatch.target;
        const message = `🔍 Không tìm thấy file: ${fileName}\n` +
            `📌 File gần giống nhất: ${bestMatch}.js\n` +
            `» Thả cảm xúc vào tin nhắn này để gửi file`;

        return api.sendMessage(message, event.threadID, (error, info) => {
            if (error) return;

            global.client.handleReaction.push({
                type: uid ? 'user' : 'thread',
                name: this.config.name,
                author: event.senderID,
                messageID: info.messageID,
                file: bestMatch,
                ...(uid && {
                    uid,
                    namee: name
                })
            });
        });
    },

    sendFileToUser: async function(api, event, fileName, uid, name) {
        try {
            const tempFile = fileName.replace('.js', '.txt');
            const tempPath = path.join(__dirname, tempFile);

            await fs.copyFile(path.join(__dirname, fileName), tempPath);

            await api.sendMessage({
                body: `📦 File ${fileName} gửi riêng cho bạn`,
                attachment: fs.createReadStream(tempPath)
            }, uid);

            await fs.unlink(tempPath);

            return api.sendMessage(`✅ Đã gửi file ${fileName} đến ${name} qua tin nhắn riêng`, event.threadID);
        } catch (error) {
            console.error('Lỗi khi gửi file:', error);
            return api.sendMessage(`❌ Không thể gửi file đến ${name}`, event.threadID);
        }
    },

    sendFileToThread: async function(api, event, fileName) {
        try {
            const tempFile = fileName.replace('.js', '.txt');
            const tempPath = path.join(__dirname, tempFile);

            await fs.copyFile(path.join(__dirname, fileName), tempPath);

            await api.sendMessage({
                body: `📦 File ${fileName} cho cả nhóm`,
                attachment: fs.createReadStream(tempPath)
            }, event.threadID);

            return fs.unlink(tempPath);
        } catch (error) {
            console.error('Lỗi khi gửi file:', error);
            return api.sendMessage('❌ Không thể gửi file', event.threadID);
        }
    }
};
