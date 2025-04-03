module.exports.config = {
    name: "console",
    version: "1.0.0",
    hasPermssion: 1,
    credits: "ManhG",
    description: "Bật tắt console ở nhóm hiện tại",
    commandCategory: "admin",
    depndencies: {},
    usages: "",
    cooldowns: 2
};

module.exports.handleEvent = async ({ event: e, api: o, Users: a, Threads: t }) => {
    const n = global.data.threadData.get(e.threadID) || {};
    if ((void 0 === n.console || 1 != n.console) && e.senderID != global.data.botID) {
        try {
            // Kiểm tra và lấy thông tin thread an toàn
            const threadInfo = global.data.threadInfo.get(e.threadID);
            const s = (threadInfo && threadInfo.threadName) ? threadInfo.threadName : "Tên không tồn tại";
            
            const m = await a.getNameUser(e.senderID);
            const d = e.body || "Ảnh, video hoặc ký tự đặc biệt";
            const l = ["[33m", "[34m", "[35m", "[36m", "[31m", "[1m"];
            const c = l[Math.floor(Math.random() * l.length)];
            const r = ["[34m", "[33m", "[31m", "[1m", "[34m", "[36m"][Math.floor(Math.random() * l.length)];
            
            console.log("[32mBox:[37m [" + c + s + "[37m -> [0m[37m [" + r + m + "[37m -> [0m" + d);
        } catch (error) {
            console.error("Lỗi khi xử lý sự kiện console:", error);
        }
    }
};

module.exports.languages = {
    vi: {
        on: "Bật",
        off: "Tắt",
        successText: "console thành công"
    },
    en: {
        on: "on",
        off: "off",
        successText: "console success!"
    }
};

module.exports.run = async function({ api: e, event: o, Threads: a, getText: t }) {
    const { threadID: n, messageID: s } = o;
    let m = (await a.getData(n)).data;
    m.console = !m.console;
    await a.setData(n, { data: m });
    global.data.threadData.set(n, m);
    e.sendMessage(`${m.console ? t("off") : t("on")} ${t("successText")}`, n, s);
};