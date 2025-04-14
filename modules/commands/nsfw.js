module.exports.config = {
    name: "nsfw",
    version: "1.0.1",
    hasPermssion: 1,
    credits: "Mirai Team",
    description: "Bật/tắt quyền sử dụng các lệnh NSFW",
    commandCategory: "system",
    usages: "[on/off]",
    cooldowns: 5,
    dependencies: {}
};

module.exports.languages = {
    "vi": {
        "returnSuccessEnable": "✅ Đã bật chế độ NSFW cho nhóm này",
        "returnSuccessDisable": "✅ Đã tắt chế độ NSFW cho nhóm này",
        "missingChoice": "⚠️ Vui lòng chọn 'on' hoặc 'off'",
        "error": "❌ Đã có lỗi xảy ra, vui lòng thử lại sau"
    },
    "en": {
        "returnSuccessEnable": "✅ Successfully enabled NSFW commands for this group",
        "returnSuccessDisable": "✅ Successfully disabled NSFW commands for this group",
        "missingChoice": "⚠️ Please choose 'on' or 'off'",
        "error": "❌ An error occurred, please try again later"
    }
};

module.exports.run = async function({ event, api, Threads, args, getText }) {
    const { threadID, messageID } = event;
    const { getData, setData } = Threads;
    
    try {
        const choice = args[0]?.toLowerCase();
        if (!choice || (choice !== "on" && choice !== "off")) {
            return api.sendMessage(getText("missingChoice"), threadID, messageID);
        }

        let threadData = await getData(threadID);
        threadData.data = threadData.data || {};
        
        threadData.data.nsfw = (choice === "on");
        await setData(threadID, threadData);

        const successMessage = choice === "on" 
            ? getText("returnSuccessEnable") 
            : getText("returnSuccessDisable");
        
        return api.sendMessage(successMessage, threadID, messageID);
    } catch (e) {
        console.error("NSFW Command Error:", e);
        return api.sendMessage(getText("error"), threadID, messageID);
    }
};