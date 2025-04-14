module.exports.config = {
    name: "checktt",
    eventType: ["log:unsubscribe"],
    version: "1.0.0",
    credits: "D-Jukie",
    description: "Xóa data tương tác người dùng khi out",
};

module.exports.run = async ({
    event,
    api,
    Threads
}) => {
    // Nếu người rời nhóm là bot thì bỏ qua
    if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) return;

    const fs = require("fs");
    const path = require("path");
    const dataPath = path.resolve(__dirname, "../commands/cache/checktt.json");

    // Load dữ liệu từ file
    const threadList = require(dataPath);
    const threadData = threadList.find(t => t.threadID == event.threadID);

    if (!threadData) return;

    // Tìm và xóa người rời nhóm khỏi danh sách tương tác
    const userIndex = threadData.data.findIndex(item => item.id == event.logMessageData.leftParticipantFbId);
    if (userIndex === -1) return;

    threadData.data.splice(userIndex, 1);

    // Ghi lại file
    try {
        fs.writeFileSync(dataPath, JSON.stringify(threadList, null, 2), "utf-8");
    } catch (err) {
        console.error("Lỗi khi ghi file checktt.json:", err);
    }
};
