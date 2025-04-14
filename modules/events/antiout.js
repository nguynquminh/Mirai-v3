module.exports.config = {
    name: "antiout",
    eventType: ["log:unsubscribe"],
    version: "0.0.1",
    credits: "DungUwU",
    description: "Tự động thêm lại thành viên rời khỏi nhóm nếu bật chế độ antiout"
};

module.exports.run = async ({ event, api, Threads, Users }) => {
    const threadID = event.threadID;
    const leftUserID = event.logMessageData.leftParticipantFbId;
    const authorID = event.author;

    // Lấy data của nhóm và kiểm tra xem có bật antiout không
    const threadData = (await Threads.getData(threadID)).data || {};
    if (!threadData.antiout) return;

    // Nếu là bot bị kick khỏi nhóm thì không xử lý
    if (leftUserID == api.getCurrentUserID()) return;

    // Lấy tên người rời nhóm
    const userName = global.data.userName.get(leftUserID) || await Users.getNameUser(leftUserID);

    // Xác định lý do rời nhóm: tự rời hay bị kick
    const reason = (authorID == leftUserID) ? "tự rời" : "bị quản trị viên đuổi";

    // Nếu là tự rời thì mời lại
    if (reason === "tự rời") {
        api.addUserToGroup(leftUserID, threadID, (err) => {
            if (err) {
                return api.sendMessage(
                    `[🔱] ANTIOUT [🔱]\nKhông thể mời lại ${userName} vào nhóm. Có thể họ đã chặn bot hoặc cài đặt quyền riêng tư.`,
                    threadID
                );
            }

            return api.sendMessage(
                `[🔱] ANTIOUT [🔱]\nĐã mời lại ${userName} – kẻ thích out chùa. Lần sau nhớ đừng thoát bừa nha 😏`,
                threadID
            );
        });
    }
};
