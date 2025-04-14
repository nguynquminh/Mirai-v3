module.exports.config = {
    name: "kick",
    version: "2.0.0",
    hasPermssion: 1, // 1 = Quản trị viên, 2 = Admin bot
    credits: "D-Jukie",
    description: "Xóa thành viên khỏi nhóm bằng tag, reply hoặc xóa tất cả",
    commandCategory: "Quản lý nhóm",
    usages: "[tag/reply/all] [--force]",
    cooldowns: 5,
    dependencies: {
        "fs-extra": ""
    }
};

module.exports.run = async function ({ args, api, event, Threads, Users }) {
    const { participantIDs } = (await Threads.getData(event.threadID)).threadInfo;
    const botID = api.getCurrentUserID();
    const isForce = args.includes("--force"); // Chế độ bỏ qua kiểm tra admin
    
    try {
        // Hàm gửi thông báo đẹp
        const sendNotification = async (message, userID) => {
            const name = await Users.getNameUser(userID).catch(() => "Người dùng");
            const formattedMsg = `╭─── 𝗞𝗜𝗖𝗞 𝗧𝗛𝗔̀𝗡𝗛 𝗩𝗜𝗘̂𝗡 ────•
│
│ 𝗡𝗴𝘂̛𝗼̛̀𝗶 𝗯𝗶̣ 𝗸𝗶𝗰𝗸: ${name}
│ 𝗜𝗗: ${userID}
│ 
│ 𝗟𝘆́ 𝗱𝗼: ${message}
│ 𝗕𝗼̛̉𝗶: ${event.senderID}
│
│ 𝗧𝗵𝗼̛̀𝗶 𝗴𝗶𝗮𝗻: ${new Date().toLocaleString("vi-VN")}
╰───────────────────•`;
            api.sendMessage(formattedMsg, event.threadID);
        };

        // Kiểm tra quyền của người dùng
        const threadInfo = await api.getThreadInfo(event.threadID);
        const isAdmin = threadInfo.adminIDs.some(item => item.id == event.senderID);
        
        if (!isAdmin && !isForce) {
            return api.sendMessage("❌ Bạn cần là quản trị viên nhóm để sử dụng lệnh này", event.threadID);
        }

        // Xử lý các trường hợp kick
        if (args.join().includes('@')) {
            // Kick bằng tag
            const mention = Object.keys(event.mentions);
            for (const userID of mention) {
                if (userID == botID) continue;
                if (threadInfo.adminIDs.some(item => item.id == userID) && !isForce) {
                    await sendNotification("Không thể kick quản trị viên khác", userID);
                    continue;
                }
                await api.removeUserFromGroup(userID, event.threadID);
                await sendNotification("Đã bị kick bởi quản trị viên", userID);
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        } 
        else if (event.type == "message_reply") {
            // Kick bằng reply
            const uid = event.messageReply.senderID;
            if (uid == botID) return;
            if (threadInfo.adminIDs.some(item => item.id == uid) && !isForce) {
                return sendNotification("Không thể kick quản trị viên khác", uid);
            }
            await api.removeUserFromGroup(uid, event.threadID);
            await sendNotification("Đã bị kick bởi quản trị viên", uid);
        } 
        else if (args[0] === "all") {
            // Kick tất cả
            if (!isForce) {
                return api.sendMessage("⚠️ Để kick tất cả, vui lòng sử dụng lệnh với --force", event.threadID);
            }
            
            const listUserID = participantIDs.filter(ID => ID != botID && ID != event.senderID);
            for (const userID of listUserID) {
                if (threadInfo.adminIDs.some(item => item.id == userID)) {
                    await sendNotification("Bỏ qua quản trị viên", userID);
                    continue;
                }
                await api.removeUserFromGroup(userID, event.threadID);
                await sendNotification("Đã bị kick hàng loạt", userID);
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        } 
        else {
            // Hướng dẫn sử dụng
            return api.sendMessage(`╭─── 𝗛𝗨̛𝗢́𝗡𝗡 𝗗𝗔̂̃𝗡 𝗦𝗨̛̉ 𝗗𝘂̣𝗡𝗴 ────•
│
│ 𝗖𝗮́𝗰𝗵 𝘀𝘂̛̉ 𝗱𝘂̣𝗻𝗴 𝗹𝗲̣̂𝗻𝗵 𝗸𝗶𝗰𝗸:
│ 
│ 𝟭. 𝗧𝗮𝗴 𝗻𝗴𝘂̛𝗼̛̀𝗶 𝗺𝘂𝗼̂́𝗻 𝗸𝗶𝗰𝗸:
│    kick @tag1 @tag2
│
│ 𝟮. 𝗥𝗲𝗽𝗹𝘆 𝘁𝗶𝗻 𝗻𝗵𝗮̆́𝗻 𝗰𝘂̉𝗮 𝗻𝗴𝘂̛𝗼̛̀𝗶 𝗺𝘂𝗼̂́𝗻 𝗸𝗶𝗰𝗸:
│    reply tin nhắn + kick
│
│ 𝟯. 𝗞𝗶𝗰𝗸 𝘁𝗮̂́𝘁 𝗰𝗮̉ 𝘁𝗵𝗮̀𝗻𝗵 𝘃𝗶𝗲̂𝗻 (𝗰𝗵𝗶̉ 𝗾𝘂𝗮̉𝗻 𝘁𝗿𝗶̣ 𝘃𝗶𝗲̂𝗻 𝗰𝗮̂́𝗽 𝗰𝗮𝗼):
│    kick all --force
│
│ 𝗟𝘂̛𝘂 𝘆́: 𝗞𝗵𝗼̂𝗻𝗴 𝘁𝗵𝗲̂̉ 𝗸𝗶𝗰𝗸 𝗾𝘂𝗮̉𝗻 𝘁𝗿𝗶̣ 𝘃𝗶𝗲̂𝗻 𝗸𝗵𝗮́𝗰
╰───────────────────•`, event.threadID);
        }
    } catch (error) {
        console.error("Kick Error:", error);
        return api.sendMessage("❌ Đã xảy ra lỗi khi thực hiện lệnh kick", event.threadID);
    }
};