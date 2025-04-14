const axios = require("axios");
const fs = require("fs");
const { exec } = require("child_process");
const { performance } = require("perf_hooks");

const CLIENT_ID = "e7627efa9d404f42927ca1e51cf845df";
const CLIENT_SECRET = "02d2967645df412ebeb2943519f5e9bb";
const YOUTUBE_API_KEY = "AIzaSyB7xzteIRvqCBURoCWP5Ui14haTnte55jU";

async function getSpotifyToken() {
    const authBuffer = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
    try {
        const response = await axios.post("https://accounts.spotify.com/api/token", 
            "grant_type=client_credentials",
            { headers: { Authorization: `Basic ${authBuffer}`, "Content-Type": "application/x-www-form-urlencoded" } }
        );
        return response.data.access_token;
    } catch (error) {
        console.error("❌ Lỗi khi lấy Spotify Token:", error.response?.data || error);
        return null;
    }
}

const checkCommand = (cmd) => new Promise((resolve) => {
    exec(`where ${cmd}`, (err, stdout) => resolve(!err && stdout.trim().length > 0));
});

module.exports.config = {
    name: "music",
    version: "1.1.0",
    hasPermssion: 0,
    credits: "Bạn",
    description: "Tìm kiếm và phát nhạc từ Spotify và YouTube",
    commandCategory: "Giải trí",
    usages: "music [tên bài hát]",
    cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
    if (!args.length) {
        return api.sendMessage("📢 Vui lòng nhập tên bài hát cần tìm!", event.threadID);
    }

    const query = args.join(" ");
    api.sendMessage(`🔍 Đang tìm bài hát: ${query}`, event.threadID);

    const startTime = performance.now();
    try {
        const token = await getSpotifyToken();
        if (!token) return api.sendMessage("❌ Không thể lấy token Spotify!", event.threadID);

        const spotifyRes = await axios.get(`https://api.spotify.com/v1/search`, {
            headers: { "Authorization": `Bearer ${token}` },
            params: { q: query, type: "track", limit: 1 }
        });

        if (!spotifyRes.data.tracks.items.length) {
            return api.sendMessage("❌ Không tìm thấy bài hát trên Spotify!", event.threadID);
        }

        const song = spotifyRes.data.tracks.items[0];
        const songInfo = {
            title: song.name.replace(/[<>:"\/\\|?*]+/g, "_"),
            artist: song.artists.map(a => a.name).join(", "),
            cover: song.album.images[0]?.url || null,
            youtubeSearch: `${song.name} ${song.artists[0].name}`
        };

        let message = `🎶 **Bài hát**: ${songInfo.title}\n👤 **Nghệ sĩ**: ${songInfo.artist}\n💿 **Album**: ${song.album.name}\n➡️ Reply \"play\" để phát nhạc.`;

        const msgData = { body: message };
        if (songInfo.cover) {
            const imgStream = (await axios({ url: songInfo.cover, responseType: "stream" })).data;
            msgData.attachment = imgStream;
        }

        api.sendMessage(msgData, event.threadID, (err, info) => {
            global.client.handleReply.push({
                name: module.exports.config.name,
                messageID: info.messageID,
                author: event.senderID,
                songInfo
            });
        });
    } catch (error) {
        console.error("❌ Lỗi khi tìm kiếm bài hát:", error);
        api.sendMessage("⚠️ Đã xảy ra lỗi khi tìm kiếm bài hát!", event.threadID);
    }
    console.log(`⏱️ Thời gian xử lý tìm kiếm: ${(performance.now() - startTime).toFixed(2)}ms`);
};

module.exports.handleReply = async function({ api, event, handleReply }) {
    if (event.body.toLowerCase() !== "play") return;
    if (event.senderID !== handleReply.author) return;

    const ytDlpExists = await checkCommand("yt-dlp");
    const ffmpegExists = await checkCommand("ffmpeg");

    if (!ytDlpExists || !ffmpegExists) {
        return api.sendMessage("❌ Không tìm thấy yt-dlp hoặc ffmpeg! Vui lòng kiểm tra cài đặt.", event.threadID);
    }

    api.sendMessage("⏳ Đang tải nhạc, vui lòng chờ...", event.threadID);
    const songInfo = handleReply.songInfo;
    const startTime = performance.now();
    try {
        const ytSearch = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
            params: {
                part: "snippet",
                q: songInfo.youtubeSearch,
                key: YOUTUBE_API_KEY,
                maxResults: 1,
                type: "video"
            }
        }).catch(error => {
            console.error("❌ Lỗi API YouTube:", error);
            return null;
        });

        if (!ytSearch || !ytSearch.data.items.length) {
            return api.sendMessage("❌ Không tìm thấy video YouTube phù hợp!", event.threadID);
        }

        const youtubeURL = `https://www.youtube.com/watch?v=${ytSearch.data.items[0].id.videoId}`;
        const filePath = `C:/Users/quang/Desktop/Mirai-Bot-V3/modules/commands/cache/${songInfo.title}.mp3`;

        exec(`yt-dlp -f bestaudio "${youtubeURL}" -o "${filePath}.webm" && ffmpeg -i "${filePath}.webm" -q:a 0 -map a "${filePath}"`, async (err) => {
            if (err) {
                console.error("❌ Lỗi khi tải nhạc:", err);
                return api.sendMessage("⚠️ Đã xảy ra lỗi khi tải nhạc!", event.threadID);
            }

            api.sendMessage({
                body: `🎶 **Phát nhạc**: ${songInfo.title} - ${songInfo.artist}`,
                attachment: fs.createReadStream(filePath)
            }, event.threadID, () => {
                fs.unlinkSync(`${filePath}.webm`);
                fs.unlinkSync(filePath);
            });
        });
    } catch (error) {
        console.error("❌ Lỗi khi tải nhạc:", error);
        return api.sendMessage("⚠️ Đã xảy ra lỗi khi tải nhạc!", event.threadID);
    }
    console.log(`⏱️ Thời gian xử lý tải nhạc: ${(performance.now() - startTime).toFixed(2)}ms`);
};
