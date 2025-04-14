const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
    name: "github",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "yourname",
    description: "Lấy thông tin user hoặc repo GitHub",
    commandCategory: "Công cụ",
    usages: "github [username] hoặc github [username/repo]",
    cooldowns: 5
};

module.exports.run = async function({
    api,
    event,
    args
}) {
    if (args.length === 0) {
        return api.sendMessage("📌 Vui lòng nhập username hoặc username/repo trên GitHub!", event.threadID);
    }

    const query = args[0];
    const isRepo = query.includes("/");

    try {
        if (isRepo) {
            const [username, repo] = query.split("/");
            const repoUrl = `https://api.github.com/repos/${username}/${repo}`;

            const repoResponse = await axios.get(repoUrl);
            const repoData = repoResponse.data;

            let repoMessage = `📂 **Thông tin Repository** 📂\n\n` +
                `🔷 Tên repo: ${repoData.name}\n` +
                `👤 Chủ sở hữu: ${repoData.owner.login}\n` +
                `📝 Mô tả: ${repoData.description || "Không có mô tả"}\n` +
                `⭐ Stars: ${repoData.stargazers_count}\n` +
                `👀 Watchers: ${repoData.watchers_count}\n` +
                `🍴 Forks: ${repoData.forks_count}\n` +
                `🌐 Ngôn ngữ: ${repoData.language || "Không xác định"}\n` +
                `📜 License: ${repoData.license?.name || "Không có"}\n` +
                `📅 Ngày tạo: ${new Date(repoData.created_at).toLocaleDateString()}\n` +
                `🔄 Lần cập nhật cuối: ${new Date(repoData.updated_at).toLocaleDateString()}\n\n` +
                `🔗 Link: ${repoData.html_url}`;

            if (repoData.owner.avatar_url) {
                const avatarResponse = await axios({
                    url: repoData.owner.avatar_url,
                    responseType: "arraybuffer"
                });

                const avatarPath = path.join(__dirname, "github_avatar.jpg");
                fs.writeFileSync(avatarPath, Buffer.from(avatarResponse.data, "binary"));

                return api.sendMessage({
                    body: repoMessage,
                    attachment: fs.createReadStream(avatarPath)
                }, event.threadID, () => fs.unlinkSync(avatarPath));
            } else {
                return api.sendMessage(repoMessage, event.threadID);
            }
        } else {
            const userUrl = `https://api.github.com/users/${query}`;
            const userResponse = await axios.get(userUrl);
            const userData = userResponse.data;

            let userMessage = `👤 **Thông tin GitHub User** 👤\n\n` +
                `🔷 Tên: ${userData.name || userData.login}\n` +
                `📝 Bio: ${userData.bio || "Không có bio"}\n` +
                `🏢 Công ty: ${userData.company || "Không có"}\n` +
                `🌍 Vị trí: ${userData.location || "Không có"}\n` +
                `📌 Blog/Website: ${userData.blog || "Không có"}\n` +
                `👥 Followers: ${userData.followers}\n` +
                `👣 Following: ${userData.following}\n` +
                `📂 Public repos: ${userData.public_repos}\n` +
                `📅 Ngày tạo: ${new Date(userData.created_at).toLocaleDateString()}\n\n` +
                `🔗 Link: ${userData.html_url}`;

            if (userData.avatar_url) {
                const avatarResponse = await axios({
                    url: userData.avatar_url,
                    responseType: "arraybuffer"
                });

                const avatarPath = path.join(__dirname, "github_avatar.jpg");
                fs.writeFileSync(avatarPath, Buffer.from(avatarResponse.data, "binary"));

                return api.sendMessage({
                    body: userMessage,
                    attachment: fs.createReadStream(avatarPath)
                }, event.threadID, () => fs.unlinkSync(avatarPath));
            } else {
                return api.sendMessage(userMessage, event.threadID);
            }
        }
    } catch (error) {
        console.error("Lỗi khi lấy thông tin GitHub:", error);
        if (error.response && error.response.status === 404) {
            return api.sendMessage("❌ Không tìm thấy user hoặc repo trên GitHub!", event.threadID);
        }
        return api.sendMessage("⚠️ Đã xảy ra lỗi khi lấy thông tin từ GitHub, vui lòng thử lại sau!", event.threadID);
    }
};
