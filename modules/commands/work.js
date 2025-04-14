module.exports.config = {
	name: "work",
	version: "1.0.1",
	hasPermssion: 0,
	credits: "Mirai Team",
	description: "Có làm thì mới có ăn!",
	commandCategory: "Economy",
    cooldowns: 5,
    envConfig: {
        cooldownTime: 60000
    }
};

module.exports.languages = {
    "vi": {
        "cooldown": "Bạn đã làm công việc hôm nay, để tránh kiệt sức hãy quay lại sau: %1 phút %2 giây.",
        "rewarded": "Bạn đã làm công việc %1 và kiếm ra được %2$",
        "job1": "bán vé số",
        "job2": "sửa xe",
        "job3": "lập trình",
        "job4": "hack facebook",
        "job5": "đầu bếp",
        "job6": "thợ hồ",
        "job7": "fake taxi",
        "job8": "gangbang người nào đó",
        "job9": "thợ sửa ống nước may mắn  ( ͡° ͜ʖ ͡°)",
        "job10": "streamer",
        "job11": "bán hàng trực tuyến",
        "job12": "nội trợ",
        "job13": 'bán "hoa"',
        "job14": "tìm jav/hentai code cho SpermLord",
        "job15": "chơi Yasuo và gánh đội của bạn"
    },
    "en": {
        "cooldown": "You have worked today, to avoid exhaustion please come back after: %1 minute(s) %2 second(s).",
        "rewarded": "You did the job: %1 and received: %2$.",
        "job1": "sell lottery tickets",
        "job2": "repair car",
        "job3": "programming",
        "job4": "hack Facebook",
        "job5": "chef",
        "job6": "mason",
        "job7": "fake taxi",
        "job8": "gangbang someone",
        "job9": "plumber ( ͡° ͜ʖ ͡°)",
        "job10": "streamer",
        "job11": "online seller",
        "job12": "housewife",
        "job13": 'sell "flower"',
        "job14": "find jav/hentai code for SpermLord",
        "job15": "play Yasuo and carry your team"
    }
}

module.exports.run = async ({ event, api, Currencies, getText }) => {
    const { threadID, messageID, senderID } = event;

    const cooldown = module.exports.config.envConfig.cooldownTime || 60000;
    let userData = await Currencies.getData(senderID);
    let data = userData.data || {};

    if (!data.workTime) data.workTime = 0;

    let remainingTime = cooldown - (Date.now() - data.workTime);
    if (remainingTime > 0) {
        let seconds = Math.floor(remainingTime / 1000);
        return api.sendMessage(
            `⏳ Bạn đã làm việc rồi! Hãy nghỉ ngơi và quay lại sau **${seconds} giây**.`,
            threadID,
            messageID
        );
    }

    const jobs = [
        "🎟️ " + getText("job1"),
        "🔧 " + getText("job2"),
        "💻 " + getText("job3"),
        "🕵️ " + getText("job4"),
        "👨‍🍳 " + getText("job5"),
        "🏗️ " + getText("job6"),
        "🚖 " + getText("job7"),
        "🔥 " + getText("job8"),
        "🔧 " + getText("job9"),
        "🎥 " + getText("job10"),
        "🛒 " + getText("job11"),
        "🏠 " + getText("job12"),
        "🌸 " + getText("job13"),
        "🔍 " + getText("job14"),
        "⚔️ " + getText("job15")
    ].filter(Boolean); 

    const job = jobs[Math.floor(Math.random() * jobs.length)] || "một công việc bí ẩn";
    const amount = Math.floor(Math.random() * (1000 - 100 + 1)) + 100;

    data.workTime = Date.now();
    await Currencies.increaseMoney(senderID, amount);
    await Currencies.setData(senderID, { data });

    const message = `🎉 Bạn vừa hoàn thành công việc **${job}** và kiếm được **${amount}$** 💰`;
    
    return api.sendMessage(message, threadID, messageID);
};
