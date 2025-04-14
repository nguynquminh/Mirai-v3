module.exports.config = {
    name: "antiout",
    version: "1.0.0",
    credits: "qm",
    hasPermssion: 1,
    description: "Bật/tắt chế độ chống thành viên rời nhóm",
    usages: "antiout on/off",
    commandCategory: "Nhóm",
    cooldowns: 0
};

module.exports.run = async ({ api, event, Threads }) => {
    const threadID = event.threadID;

    // Lấy dữ liệu hiện tại của nhóm
    const threadData = (await Threads.getData(threadID)).data || {};
    const currentStatus = threadData["antiout"] || false;

    // Đảo trạng thái
    const newStatus = !currentStatus;
    threadData["antiout"] = newStatus;

    // Cập nhật vào CSDL
    await Threads.setData(threadID, { data: threadData });
    global.data.threadData.set(parseInt(threadID), threadData);

    // Tạo thông báo phản hồi
    const statusText = newStatus ? "🛡️ Đã bật chế độ chống thành viên rời nhóm" : "🔓 Đã tắt chế độ chống thành viên rời nhóm";
    const statusSymbol = newStatus ? "✅" : "❌";

    return api.sendMessage(
        `${statusSymbol} ${statusText}!\n📌 Trạng thái: ${newStatus ? "BẬT" : "TẮT"}`,
        threadID
    );
};
