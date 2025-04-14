module.exports.config = {
    name: "viewcache",
    version: "2.0.0",
    hasPermssion: 2,
    credits: "qm",
    description: "Xem và quản lý file trong thư mục cache",
    commandCategory: "Admin",
    usages: "[start/ext/help] [text]",
    cooldowns: 5,
    dependencies: {
        "fs-extra": "",
        "chalk": ""
    }
};

module.exports.handleReply = async ({
    api,
    event,
    handleReply
}) => {
    if (event.senderID != handleReply.author) return;

    const fs = require("fs-extra");
    const path = require("path");
    const {
        threadID,
        body
    } = event;

    try {
        // Xử lý khi người dùng chọn file
        const selectedIndex = parseInt(body) - 1;
        if (isNaN(selectedIndex)) return;

        const filePath = path.join(__dirname, "cache", handleReply.files[selectedIndex]);
        const fileStat = fs.statSync(filePath);

        // Xóa tin nhắn cũ
        api.unsendMessage(handleReply.messageID);

        if (fileStat.isDirectory()) {
            // Nếu là thư mục
            const filesInDir = fs.readdirSync(filePath);
            const dirMsg = `📂 Thư mục: ${handleReply.files[selectedIndex]}\n\n` +
                `📝 Tổng số file: ${filesInDir.length}\n` +
                `📅 Ngày tạo: ${fileStat.birthtime.toLocaleString()}\n\n` +
                `Danh sách file trong thư mục:\n` +
                filesInDir.slice(0, 20).map((f, i) => `${i+1}. ${f}`).join("\n") +
                (filesInDir.length > 20 ? `\n...và ${filesInDir.length - 20} file khác` : "");

            api.sendMessage(dirMsg, threadID);
        } else {
            // Nếu là file
            const fileExt = path.extname(filePath).toUpperCase();
            const fileSize = (fileStat.size / 1024).toFixed(2) + " KB";
            const fileMsg = `📄 File: ${handleReply.files[selectedIndex]}\n\n` +
                `📌 Loại: ${fileExt || "Không xác định"}\n` +
                `📏 Kích thước: ${fileSize}\n` +
                `📅 Ngày tạo: ${fileStat.birthtime.toLocaleString()}`;

            // Gửi file kèm thông tin
            api.sendMessage({
                body: fileMsg,
                attachment: fs.createReadStream(filePath)
            }, threadID, () => {
                // Tự động xóa file sau 5 phút nếu là ảnh
                if ([".png", ".jpg", ".jpeg"].includes(path.extname(filePath).toLowerCase())) {
                    setTimeout(() => {
                        try {
                            fs.unlinkSync(filePath);
                        } catch (e) {}
                    }, 300000);
                }
            });
        }
    } catch (error) {
        console.error(error);
        api.sendMessage("❌ Đã xảy ra lỗi khi xử lý file!", threadID);
    }
};

module.exports.run = async function({
    api,
    event,
    args
}) {
    const fs = require("fs-extra");
    const path = require("path");
    const chalk = require("chalk");

    try {
        const cacheDir = path.join(__dirname, "cache");
        let files = fs.readdirSync(cacheDir);
        let msg = "";
        let key = "";

        // Hiển thị hướng dẫn
        if (args[0] == 'help') {
            const helpMsg = `
🌸 HƯỚNG DẪN SỬ DỤNG VIEWCACHE 🌸

🔹 ${chalk.bold("cache start <text>")} - Lọc file bắt đầu bằng <text>
   ${chalk.gray("Ví dụ:")} cache start rank

🔹 ${chalk.bold("cache ext <text>")} - Lọc file có đuôi <text>
   ${chalk.gray("Ví dụ:")} cache ext png

🔹 ${chalk.bold("cache <text>")} - Lọc file chứa <text>
   ${chalk.gray("Ví dụ:")} cache a

🔹 ${chalk.bold("cache")} - Xem tất cả file trong cache

🔹 ${chalk.bold("cache help")} - Hiển thị hướng dẫn này

📌 ${chalk.italic("Module được phát triển bởi qm")}
			`;
            return api.sendMessage(helpMsg, event.threadID, event.messageID);
        }

        // Xử lý các trường hợp lọc file
        if (args[0] == "start" && args[1]) {
            const word = args.slice(1).join(" ");
            files = files.filter(file => file.startsWith(word));
            if (!files.length) {
                return api.sendMessage(`❌ Không tìm thấy file nào bắt đầu bằng "${word}" trong cache!`, event.threadID, event.messageID);
            }
            key = `🔍 Tìm thấy ${files.length} file bắt đầu bằng "${word}":`;
        } else if (args[0] == "ext" && args[1]) {
            const ext = args[1];
            files = files.filter(file => file.endsWith(ext));
            if (!files.length) {
                return api.sendMessage(`❌ Không tìm thấy file nào có đuôi ".${ext}" trong cache!`, event.threadID, event.messageID);
            }
            key = `🔍 Tìm thấy ${files.length} file có đuôi ".${ext}":`;
        } else if (!args[0]) {
            if (!files.length) {
                return api.sendMessage("📂 Thư mục cache hiện đang trống!", event.threadID, event.messageID);
            }
            key = `📂 Danh sách tất cả ${files.length} file trong cache:`;
        } else {
            const word = args.join(" ");
            files = files.filter(file => file.includes(word));
            if (!files.length) {
                return api.sendMessage(`❌ Không tìm thấy file nào chứa "${word}" trong cache!`, event.threadID, event.messageID);
            }
            key = `🔍 Tìm thấy ${files.length} file chứa "${word}":`;
        }

        // Tạo danh sách file
        files.forEach((file, index) => {
            try {
                const filePath = path.join(cacheDir, file);
                const fileStat = fs.statSync(filePath);
                const isDir = fileStat.isDirectory();
                const ext = path.extname(file);

                // Biểu tượng theo loại file
                let icon = "📄"; // Mặc định
                if (isDir) icon = "📁";
                else if ([".png", ".jpg", ".jpeg", ".gif"].includes(ext)) icon = "🖼️";
                else if ([".mp3", ".wav"].includes(ext)) icon = "🎵";
                else if ([".mp4", ".mov"].includes(ext)) icon = "🎬";
                else if ([".txt", ".json", ".log"].includes(ext)) icon = "📝";

                msg += `${index+1}. ${icon} ${file} ${isDir ? "" : `(${(fileStat.size/1024).toFixed(2)} KB)`}\n`;
            } catch (e) {
                console.error(chalk.red(`Error processing file ${file}:`), e);
            }
        });

        // Thêm footer và giới hạn ký tự
        const footer = `\n\n📌 Reply số thứ tự để xem file (1-${files.length})\n⏳ Tự động xóa sau 3 phút`;
        const maxLength = 1500 - footer.length;

        if (msg.length > maxLength) {
            msg = msg.substring(0, maxLength - 100) + `\n...và ${files.length - Math.floor(maxLength/30)} file khác`;
        }

        // Gửi tin nhắn
        api.sendMessage(key + "\n" + msg + footer, event.threadID, (e, info) => {
            if (e) return console.error(e);

            // Lưu thông tin cho handleReply
            global.client.handleReply.push({
                name: this.config.name,
                messageID: info.messageID,
                author: event.senderID,
                files
            });

            // Tự động xóa tin nhắn sau 3 phút
            setTimeout(() => {
                try {
                    api.unsendMessage(info.messageID);
                } catch (e) {}
            }, 180000);
        });

    } catch (error) {
        console.error(chalk.red("Lỗi trong viewcache:"), error);
        api.sendMessage("❌ Đã xảy ra lỗi khi đọc thư mục cache!", event.threadID, event.messageID);
    }
};
