module.exports.config = {
    name: "system",
    version: "1.0.1",
    hasPermssion: 0,
    credits: "qm (UI nâng cấp bởi GPT)",
    description: "Xem thông tin phần cứng mà bot đang sử dụng",
    commandCategory: "Thông tin",
    cooldowns: 5,
    dependencies: {
        "systeminformation": ""
    }
};

const si = require("systeminformation");

function byte2mb(bytes) {
    const units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    let i = 0,
        n = parseInt(bytes, 10) || 0;
    while (n >= 1024 && ++i) n /= 1024;
    return `${n.toFixed(i ? 1 : 0)} ${units[i]}`;
}

module.exports.run = async function({
    api,
    event
}) {
    const timeStart = Date.now();

    try {
        const cpuInfo = await si.cpu();
        const tempInfo = await si.cpuTemperature();
        const loadInfo = await si.currentLoad();
        const diskInfo = await si.diskLayout();
        const memInfo = await si.memLayout();
        const memStats = await si.mem();
        const osStats = await si.osInfo();

        const uptime = process.uptime();
        const hours = String(Math.floor(uptime / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((uptime % 3600) / 60)).padStart(2, '0');
        const seconds = String(Math.floor(uptime % 60)).padStart(2, '0');

        const msg = `
🔧=== [ SYSTEM INFORMATION ] ===🔧

🖥️ CPU:
• Model      : ${cpuInfo.manufacturer} ${cpuInfo.brand}
• Speed      : ${cpuInfo.speed} GHz
• Cores      : ${cpuInfo.physicalCores} Cores / ${cpuInfo.cores} Threads
• Temp       : ${tempInfo.main || "N/A"}°C
• Load       : ${loadInfo.currentLoad.toFixed(1)}%

💾 MEMORY:
• Total RAM  : ${byte2mb(memStats.total)}
• Available  : ${byte2mb(memStats.available)}
• RAM Type   : ${memInfo[0]?.type || "Unknown"}
• Slot Size  : ${byte2mb(memInfo[0]?.size || 0)}

🗂️ DISK:
• Name       : ${diskInfo[0]?.name || "Unknown"}
• Size       : ${byte2mb(diskInfo[0]?.size || 0)}
• Temp       : ${diskInfo[0]?.temperature || "N/A"}°C

🧰 OS:
• Platform   : ${osStats.platform}
• Build      : ${osStats.build}
• Uptime     : ${hours}:${minutes}:${seconds}

📡 Ping: ${Date.now() - timeStart}ms
`.trim();

        return api.sendMessage(msg, event.threadID, event.messageID);

    } catch (err) {
        console.error("❌ Lỗi lấy thông tin hệ thống:", err);
        return api.sendMessage("❌ Có lỗi xảy ra khi lấy thông tin hệ thống!", event.threadID, event.messageID);
    }
};
