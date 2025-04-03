module.exports.config = {
    name: "twitterinfo",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "qm",
    description: "Xem thông tin tài khoản Twitter/X bằng username",
    commandCategory: "Thông tin",
    usages: "twitterinfo [username]",
    cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
    const axios = require('axios');
    const fs = require("fs-extra");
    
    if (!args[0]) {
        return api.sendMessage("Vui lòng nhập username Twitter (ví dụ: twitterdev):", event.threadID, (error, info) => {
            global.client.handleReply.push({
                name: this.config.name,
                messageID: info.messageID,
                author: event.senderID,
                type: "username"
            });
        }, event.messageID);
    }

    const handleReply = async ({ api, event, handleReply }) => {
        const username = event.body.trim();
        const bearerToken = "AAAAAAAAAAAAAAAAAAAAAK9O0QEAAAAAorNCF9lNW%2Bwl1qn21%2B7r3E61m2Q%3DXIvtIVQYLv11qG9hyM11XxilLFi2YRQYdONyEN3S8BPaa47fQ5";
        
        try {
            api.sendMessage(`🔍 Đang tìm kiếm @${username} trên Twitter...`, event.threadID, event.messageID);

            const userResponse = await axios.get(`https://api.twitter.com/2/users/by/username/${username}`, {
                headers: { 
                    "Authorization": `Bearer ${bearerToken}` 
                }
            });

            if (!userResponse.data.data) {
                return api.sendMessage("Không tìm thấy tài khoản Twitter này!", event.threadID, event.messageID);
            }

            const userId = userResponse.data.data.id;

            const detailResponse = await axios.get(`https://api.twitter.com/2/users/${userId}?user.fields=description,profile_image_url,public_metrics,verified,created_at`, {
                headers: { 
                    "Authorization": `Bearer ${bearerToken}` 
                }
            });

            const userInfo = detailResponse.data.data;
            const metrics = userInfo.public_metrics;

            let message = `🐦 THÔNG TIN TWITTER/X\n\n`;
            message += `👤 Username: @${userInfo.username}\n`;
            message += `📛 Tên: ${userInfo.name}\n`;
            message += `🆔 ID: ${userInfo.id}\n`;
            message += `📅 Ngày tạo: ${new Date(userInfo.created_at).toLocaleDateString()}\n`;
            message += `📝 Bio: ${userInfo.description || "Không có"}\n`;
            message += `👥 Theo dõi: ${metrics.following_count}\n`;
            message += `👀 Người theo dõi: ${metrics.followers_count}\n`;
            message += `💬 Số tweet: ${metrics.tweet_count}\n`;
            message += `✅ Xác thực: ${userInfo.verified ? "Có" : "Không"}\n`;

            if (userInfo.profile_image_url) {
                const avatarUrl = userInfo.profile_image_url.replace("_normal", "_400x400");
                const path = __dirname + `/cache/twitter_${username}.jpg`;
                
                const getAvatar = (await axios.get(avatarUrl, { responseType: "arraybuffer" })).data;
                fs.writeFileSync(path, Buffer.from(getAvatar, "utf-8"));
                
                api.sendMessage({
                    body: message,
                    attachment: fs.createReadStream(path)
                }, event.threadID, () => fs.unlinkSync(path), event.messageID);
            } else {
                api.sendMessage(message, event.threadID, event.messageID);
            }

        } catch (error) {
            console.error(error);
            if (error.response?.data?.title === "Not Found Error") {
                api.sendMessage("Không tìm thấy tài khoản Twitter này!", event.threadID, event.messageID);
            } else {
                api.sendMessage("Đã xảy ra lỗi khi lấy thông tin Twitter. Vui lòng thử lại sau!", event.threadID, event.messageID);
            }
        }
    };

    if (event.type === "message_reply" && global.client.handleReply.find(reply => reply.messageID === event.messageReply.messageID)) {
        return handleReply({ api, event, handleReply: global.client.handleReply.find(reply => reply.messageID === event.messageReply.messageID) });
    }

    const username = args[0].replace("@", "");
    const bearerToken = "AAAAAAAAAAAAAAAAAAAAAK9O0QEAAAAAorNCF9lNW%2Bwl1qn21%2B7r3E61m2Q%3DXIvtIVQYLv11qG9hyM11XxilLFi2YRQYdONyEN3S8BPaa47fQ5";
    
    try {
        api.sendMessage(`🔍 Đang tìm kiếm @${username} trên Twitter...`, event.threadID, event.messageID);

        const userResponse = await axios.get(`https://api.twitter.com/2/users/by/username/${username}`, {
            headers: { 
                "Authorization": `Bearer ${bearerToken}` 
            }
        });

        if (!userResponse.data.data) {
            return api.sendMessage("Không tìm thấy tài khoản Twitter này!", event.threadID, event.messageID);
        }

        const userId = userResponse.data.data.id;

        const detailResponse = await axios.get(`https://api.twitter.com/2/users/${userId}?user.fields=description,profile_image_url,public_metrics,verified,created_at`, {
            headers: { 
                "Authorization": `Bearer ${bearerToken}` 
            }
        });

        const userInfo = detailResponse.data.data;
        const metrics = userInfo.public_metrics;

        let message = `🐦 THÔNG TIN TWITTER/X\n\n`;
        message += `👤 Username: @${userInfo.username}\n`;
        message += `📛 Tên: ${userInfo.name}\n`;
        message += `🆔 ID: ${userInfo.id}\n`;
        message += `📅 Ngày tạo: ${new Date(userInfo.created_at).toLocaleDateString()}\n`;
        message += `📝 Bio: ${userInfo.description || "Không có"}\n`;
        message += `👥 Theo dõi: ${metrics.following_count}\n`;
        message += `👀 Người theo dõi: ${metrics.followers_count}\n`;
        message += `💬 Số tweet: ${metrics.tweet_count}\n`;
        message += `✅ Xác thực: ${userInfo.verified ? "Có" : "Không"}\n`;

        if (userInfo.profile_image_url) {
            const avatarUrl = userInfo.profile_image_url.replace("_normal", "_400x400");
            const path = __dirname + `/cache/twitter_${username}.jpg`;
            
            const getAvatar = (await axios.get(avatarUrl, { responseType: "arraybuffer" })).data;
            fs.writeFileSync(path, Buffer.from(getAvatar, "utf-8"));
            
            api.sendMessage({
                body: message,
                attachment: fs.createReadStream(path)
            }, event.threadID, () => fs.unlinkSync(path), event.messageID);
        } else {
            api.sendMessage(message, event.threadID, event.messageID);
        }

    } catch (error) {
        console.error(error);
        if (error.response?.data?.title === "Not Found Error") {
            api.sendMessage("Không tìm thấy tài khoản Twitter này!", event.threadID, event.messageID);
        } else {
            api.sendMessage("Đã xảy ra lỗi khi lấy thông tin Twitter. Vui lòng thử lại sau!", event.threadID, event.messageID);
        }
    }
};