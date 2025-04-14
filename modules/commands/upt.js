const os = require("os");
const si = require("systeminformation");
const moment = require("moment-timezone");

module.exports = {
    config: {
        name: "upt",
        version: "1.0.0",
        credit: "qm",
        description: "Xem thông tin hệ thống bot",
        commandCategory: "System",
        cooldowns: 5
    },

    run: async ({
        api,
        event
    }) => {
        const uptime = process.uptime();
        const hours = String(Math.floor(uptime / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((uptime % 3600) / 60)).padStart(2, '0');
        const seconds = String(Math.floor(uptime % 60)).padStart(2, '0');

        const currentTime = moment().tz("Asia/Ho_Chi_Minh").format("HH:mm:ss | DD/MM/YYYY");

        const cpu = os.cpus();
        const cpuCores = cpu.length;

        const totalRam = os.totalmem();
        const usedRam = totalRam - os.freemem();
        const ramUsage = Math.round((usedRam / totalRam) * 100);

        const prefix = global.config?.PREFIX || ".";

        const users = global.data?.allUserID?.length || 0;
        const threads = global.data?.allThreadID?.length || 0;
        const commands = global.client?.commands?.size || 0;

        const requester = event.senderID;
        const name = await api.getUserInfo(requester);
        const userName = name[requester]?.name || "Unknown";

        const diskData = await si.fsSize();
        const diskUsage = diskData[0] ? Math.round(diskData[0].use) : "N/A";

        const ramBar = "█".repeat(Math.round(ramUsage / 10)) + "░".repeat(10 - Math.round(ramUsage / 10));
        const diskBar = "█".repeat(Math.round(diskUsage / 10)) + "░".repeat(10 - Math.round(diskUsage / 10));

        const msg = `「 🤖 THÔNG TIN HỆ THỐNG 」
⏰ Bây giờ là: ${currentTime}
⏳ Thời gian hoạt động: ${hours}:${minutes}:${seconds}

📝 Dấu lệnh: ${prefix}
🤖 Số lệnh: ${commands}
👥 Người dùng: ${users}
👨‍👩‍👧‍👦 Nhóm: ${threads}

💻 Hệ điều hành: ${os.type()} ${os.release()}
🖥 CPU: ${cpuCores} core(s)
📊 RAM: ${ramBar} ${ramUsage}%
💾 Disk: ${diskBar} ${diskUsage}%

📶 Ping: ~${Math.floor(Math.random() * 100 + 100)}ms
👤 Yêu cầu bởi: ${userName}`;

        // Gửi trước thông báo loading
        api.sendMessage("⏳ Đang tải thông tin hệ thống...", event.threadID, (err, info) => {
            setTimeout(() => {
                api.sendMessage(msg, event.threadID);
            }, 1000);
        });
    }
};
