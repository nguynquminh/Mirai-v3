const taixiuGames = {};

module.exports.config = {
    name: "taixiu",
    version: "1.0.0",
    hasPermission: 0,
    credits: "qm",
    description: "Chơi trò chơi Tài Xỉu",
    commandCategory: "game",
    usages: "taixiu [create/join/start/list/end/pause]",
    cooldowns: 2,
};

module.exports.run = async function({
    api,
    event,
    args,
    Currencies,
    Users
}) {
    const {
        threadID,
        senderID,
        messageID
    } = event;
    const command = args[0];

    if (!command) {
        return api.sendMessage("📜 Danh sách lệnh:\n- !taixiu create: Tạo bàn Tài Xỉu\n- !taixiu join: Tham gia bàn Tài Xỉu\n- !taixiu start: Bắt đầu trò chơi\n- !taixiu list: Danh sách người chơi\n- !taixiu end: Kết thúc trò chơi\n- !taixiu pause: Tạm hoãn trò chơi", threadID, messageID);
        }
        
    if (command === "create") {
        if (taixiuGames[threadID]) {
            return api.sendMessage("Đã có bàn Tài Xỉu đang diễn ra!", threadID, messageID);
        }
        taixiuGames[threadID] = {
            players: {},
            started: false,
            paused: false
        };
        return api.sendMessage("Bàn Tài Xỉu đã được tạo! Người chơi có thể tham gia bằng cách nhập 'taixiu join'", threadID);
    }

    if (command === "join") {
        if (!taixiuGames[threadID]) {
            return api.sendMessage("Hiện chưa có bàn Tài Xỉu nào, hãy tạo một bàn bằng cách nhập 'taixiu create'", threadID, messageID);
        }
        if (taixiuGames[threadID].started) {
            return api.sendMessage("Trò chơi đã bắt đầu, không thể tham gia thêm!", threadID, messageID);
        }
        api.sendMessage("Hãy nhập lựa chọn của bạn (Tài hoặc Xỉu) và số tiền cược (VD: Tài 1000)", threadID, (err, info) => {
            global.client.handleReply.push({
                type: "taixiu_join",
                name: module.exports.config.name,
                threadID: threadID,
                author: senderID,
                messageID: info.messageID
            });
        });
        return;
    }

    if (command === "pause") {
        if (!taixiuGames[threadID]) {
            return api.sendMessage("Không có bàn Tài Xỉu nào để tạm hoãn!", threadID, messageID);
        }
        taixiuGames[threadID].paused = !taixiuGames[threadID].paused;
        if (taixiuGames[threadID].paused) {
            api.sendMessage("Bàn Tài Xỉu đã được tạm hoãn! Bạn có thể thay đổi lựa chọn và mức cược bằng cách reply tin nhắn này.", threadID, (err, info) => {
                global.client.handleReply.push({
                    type: "taixiu_change",
                    name: module.exports.config.name,
                    author: senderID,
                    messageID: info.messageID
                });
            });
        } else {
            api.sendMessage("Bàn Tài Xỉu đã tiếp tục!", threadID);
        }
        return;
    }

    if (command === "start") {
        if (!taixiuGames[threadID]) {
            return api.sendMessage("Hiện chưa có bàn Tài Xỉu nào, hãy tạo một bàn bằng cách nhập 'taixiu create'", threadID, messageID);
        }
        if (taixiuGames[threadID].paused) {
            return api.sendMessage("Bàn Tài Xỉu đang tạm hoãn, vui lòng tiếp tục trước khi bắt đầu!", threadID, messageID);
        }
        if (Object.keys(taixiuGames[threadID].players).length === 0) {
            return api.sendMessage("Không có người chơi nào tham gia, trò chơi bị hủy!", threadID, messageID);
        }
        taixiuGames[threadID].started = true;
        const dice1 = Math.floor(Math.random() * 6) + 1;
        const dice2 = Math.floor(Math.random() * 6) + 1;
        const dice3 = Math.floor(Math.random() * 6) + 1;
        const total = dice1 + dice2 + dice3;
        const result = total >= 11 ? "Tài" : "Xỉu";

        let resultMessage = `🎲 Kết quả: ${dice1} + ${dice2} + ${dice3} = ${total} → ${result}!\n`;
        let winners = [];

        for (let player in taixiuGames[threadID].players) {
            let playerData = taixiuGames[threadID].players[player];
        
            if (playerData.choice.toLowerCase() === result.toLowerCase()) {
                winners.push(await Users.getNameUser(player));
                await Currencies.increaseMoney(player, playerData.bet * 2);
            } else {
                await Currencies.decreaseMoney(player, playerData.bet);
            }
        }
        

        if (winners.length > 0) {
            resultMessage += `🎉 Người thắng: ${winners.join(", " )}!\n`;
        } else {
            resultMessage += "😢 Không có ai thắng!";
        }

        return api.sendMessage(resultMessage, threadID);
    }

    if (command === "list") {
        if (!taixiuGames[threadID]) {
            return api.sendMessage("Hiện chưa có bàn Tài Xỉu nào.", threadID, messageID);
        }
        let playerList = "📜 Danh sách người chơi:\n";
        for (let player in taixiuGames[threadID].players) {
            const name = await Users.getNameUser(player);
            playerList += `- ${name}: ${taixiuGames[threadID].players[player].choice} - ${taixiuGames[threadID].players[player].bet}\n`;
        }
        return api.sendMessage(playerList, threadID);
    }

    if (command === "end") {
        if (!taixiuGames[threadID]) {
            return api.sendMessage("Không có bàn Tài Xỉu nào để kết thúc!", threadID, messageID);
        }
        delete taixiuGames[threadID];
        return api.sendMessage("Bàn Tài Xỉu đã kết thúc!", threadID);
    }
};

module.exports.handleReply = async function({
    api,
    event,
    handleReply,
    Currencies
}) {
    const {
        threadID,
        senderID,
        body,
        messageID
    } = event;

    // Xử lý khi người chơi muốn thay đổi lựa chọn hoặc mức cược (pause)
    if (handleReply.type === "taixiu_change") {
        const [choice, bet] = body.trim().split(/\s+/);
        if (!["tài", "xỉu"].includes(choice.toLowerCase()) || isNaN(bet)) {
            return api.sendMessage("❌ Lựa chọn không hợp lệ! Vui lòng nhập lại (VD: Tài 1000).", threadID, messageID);
        }

        if (!taixiuGames[threadID] || !taixiuGames[threadID].players[senderID]) {
            return api.sendMessage("⚠️ Bạn chưa tham gia bàn Tài Xỉu hoặc bàn đã kết thúc.", threadID, messageID);
        }

        taixiuGames[threadID].players[senderID] = {
            choice: choice.charAt(0).toUpperCase() + choice.slice(1).toLowerCase(),
            bet: parseInt(bet)
        };

        return api.sendMessage(`✅ Bạn đã thay đổi cược: ${bet} vào ${taixiuGames[threadID].players[senderID].choice}!`, threadID, messageID);
    }

    // Xử lý khi người chơi đặt cược lần đầu tiên (sau khi dùng !taixiu join)
    if (handleReply.type === "taixiu_join") {
        const [choice, bet] = body.trim().split(/\s+/);
        if (!["tài", "xỉu"].includes(choice.toLowerCase()) || isNaN(bet)) {
            return api.sendMessage("❌ Lựa chọn không hợp lệ! Vui lòng nhập lại (VD: Tài 1000).", threadID, messageID);
        }

        if (!taixiuGames[threadID]) {
            return api.sendMessage("⚠️ Bàn Tài Xỉu đã bị hủy hoặc không tồn tại!", threadID, messageID);
        }

        // Kiểm tra số dư của người chơi
        let userData = await Currencies.getData(senderID);
        if (userData.money < parseInt(bet)) {
            return api.sendMessage(`❌ Bạn không đủ tiền để cược ${bet}! Hiện tại bạn có ${userData.money}$.`, threadID, messageID);
        }

        // Lưu lựa chọn vào danh sách người chơi
        taixiuGames[threadID].players[senderID] = {
            choice: choice.charAt(0).toUpperCase() + choice.slice(1).toLowerCase(), // Chuyển thành "Tài" hoặc "Xỉu"
            bet: parseInt(bet)
        };

        return api.sendMessage(`✅ Bạn đã đặt cược ${bet} vào ${taixiuGames[threadID].players[senderID].choice}!`, threadID, messageID);
    }
};


