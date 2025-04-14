module.exports.config = {
    name: "cuoptien",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Mirai Team",
    description: "Cướp tiền người dùng ngẫu nhiên",
    commandCategory: "Kinh tế",
    usages: "",
    cooldowns: 5
};

// Đảm bảo người dùng có dữ liệu tiền tệ
async function ensureCurrencyUserExists(userID, Currencies) {
    const data = await Currencies.getData(userID);
    if (!data) {
        await Currencies.setData(userID, {
            id: userID,
            money: 0
        });
    }
}

module.exports.run = async function({
    api,
    event,
    Users,
    Currencies
}) {
    const alluser = global.data.allUserID;
    const senderID = event.senderID;

    // Chọn nạn nhân ngẫu nhiên (trừ chính mình)
    let victim;
    do {
        victim = alluser[Math.floor(Math.random() * alluser.length)];
    } while (victim == api.getCurrentUserID() || victim == senderID);

    // Đảm bảo dữ liệu tồn tại
    await ensureCurrencyUserExists(victim, Currencies);
    await ensureCurrencyUserExists(senderID, Currencies);

    const nameVictim = (await Users.getData(victim)).name || "nạn nhân";
    const nameUser = (await Users.getData(senderID)).name || "bạn";

    const route = Math.floor(Math.random() * 2); // 0: thành công, 1: thất bại

    if (route === 0) {
        const victimData = await Currencies.getData(victim);
        const moneydb = victimData.money || 0;
        const money = Math.floor(Math.random() * 1000) + 1;

        if (moneydb <= 0) {
            return api.sendMessage(
                `💸 Bạn định cướp ${nameVictim}, nhưng họ nghèo quá nên không có gì để lấy!`,
                event.threadID,
                event.messageID
            );
        }

        const amountStolen = Math.min(money, moneydb);

        await Currencies.increaseMoney(victim, -amountStolen);
        await Currencies.increaseMoney(senderID, amountStolen);

        return api.sendMessage(
            `💰 Bạn đã lẻn vào túi của ${nameVictim} và cướp được ${amountStolen}$ thành công!`,
            event.threadID,
            event.messageID
        );
    }

    // route === 1: bị bắt
    else {
        const senderData = await Currencies.getData(senderID);
        const moneyuser = senderData.money || 0;

        if (moneyuser <= 0) {
            return api.sendMessage(
                "🚓 Bạn bị bắt khi đang cố cướp mà trong người không có đồng nào để nộp phạt. Thật nhọ!",
                event.threadID,
                event.messageID
            );
        }

        const fine = moneyuser;
        const reward = Math.floor(fine / 2);

        await Currencies.increaseMoney(senderID, -fine);
        await Currencies.increaseMoney(victim, reward);

        return api.sendMessage(
            `🚨 Bạn đã bị ${nameVictim} bắt quả tang và bị mất ${fine}$!`,
            event.threadID,
            () => api.sendMessage(
                `🎉 Xin chúc mừng ${nameVictim}! Bạn đã bắt được tên trộm ${nameUser} và nhận được ${reward}$ tiền thưởng!`,
                event.threadID,
                event.messageID
            )
        );
    }
};
module.exports.config = {
    name: "cuoptien",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Mirai Team",
    description: "Cướp tiền người dùng ngẫu nhiên",
    commandCategory: "Kinh tế",
    usages: "",
    cooldowns: 5
};

// Đảm bảo người dùng có dữ liệu tiền tệ
async function ensureCurrencyUserExists(userID, Currencies) {
    const data = await Currencies.getData(userID);
    if (!data) {
        await Currencies.setData(userID, {
            id: userID,
            money: 0
        });
    }
}

module.exports.run = async function({
    api,
    event,
    Users,
    Currencies
}) {
    const alluser = global.data.allUserID;
    const senderID = event.senderID;

    // Chọn nạn nhân ngẫu nhiên (trừ chính mình)
    let victim;
    do {
        victim = alluser[Math.floor(Math.random() * alluser.length)];
    } while (victim == api.getCurrentUserID() || victim == senderID);

    // Đảm bảo dữ liệu tồn tại
    await ensureCurrencyUserExists(victim, Currencies);
    await ensureCurrencyUserExists(senderID, Currencies);

    const nameVictim = (await Users.getData(victim)).name || "nạn nhân";
    const nameUser = (await Users.getData(senderID)).name || "bạn";

    const route = Math.floor(Math.random() * 2); // 0: thành công, 1: thất bại

    if (route === 0) {
        const victimData = await Currencies.getData(victim);
        const moneydb = victimData.money || 0;
        const money = Math.floor(Math.random() * 1000) + 1;

        if (moneydb <= 0) {
            return api.sendMessage(
                `💸 Bạn định cướp ${nameVictim}, nhưng họ nghèo quá nên không có gì để lấy!`,
                event.threadID,
                event.messageID
            );
        }

        const amountStolen = Math.min(money, moneydb);

        await Currencies.increaseMoney(victim, -amountStolen);
        await Currencies.increaseMoney(senderID, amountStolen);

        return api.sendMessage(
            `💰 Bạn đã lẻn vào túi của ${nameVictim} và cướp được ${amountStolen}$ thành công!`,
            event.threadID,
            event.messageID
        );
    }

    // route === 1: bị bắt
    else {
        const senderData = await Currencies.getData(senderID);
        const moneyuser = senderData.money || 0;

        if (moneyuser <= 0) {
            return api.sendMessage(
                "🚓 Bạn bị bắt khi đang cố cướp mà trong người không có đồng nào để nộp phạt. Thật nhọ!",
                event.threadID,
                event.messageID
            );
        }

        const fine = moneyuser;
        const reward = Math.floor(fine / 2);

        await Currencies.increaseMoney(senderID, -fine);
        await Currencies.increaseMoney(victim, reward);

        return api.sendMessage(
            `🚨 Bạn đã bị ${nameVictim} bắt quả tang và bị mất ${fine}$!`,
            event.threadID,
            () => api.sendMessage(
                `🎉 Xin chúc mừng ${nameVictim}! Bạn đã bắt được tên trộm ${nameUser} và nhận được ${reward}$ tiền thưởng!`,
                event.threadID,
                event.messageID
            )
        );
    }
};
