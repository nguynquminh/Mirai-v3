const axios = require("axios");

const API_KEY = "a7479b6170bcbd5d7997eb80845e7d98";

module.exports.config = {
    name: "lyrics",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "qm",
    description: "Tìm lời bài hát từ Musixmatch",
    commandCategory: "Tiện ích",
    usages: "lyrics",
    cooldowns: 5
};

module.exports.run = async function({ api, event }) {
    return api.sendMessage("🎵 Reply tin nhắn này để nhập tên bài hát:", event.threadID, (err, info) => {
        global.client.handleReply.push({
            step: "getQuery",
            name: this.config.name,
            messageID: info.messageID,
            author: event.senderID
        });
    });
};

module.exports.handleReply = async function({ api, event, handleReply }) {
    if (event.senderID !== handleReply.author) return;

    switch (handleReply.step) {
        case "getQuery": {
            const query = encodeURIComponent(event.body.trim());
            const res = await axios.get(`https://api.musixmatch.com/ws/1.1/track.search?q_track=${query}&apikey=${API_KEY}`);
            const tracks = res.data.message.body.track_list;

            if (!tracks.length) {
                return api.sendMessage("❌ Không tìm thấy bài hát nào!", event.threadID);
            }

            const list = tracks.map((item, index) => `${index + 1}. ${item.track.track_name} - ${item.track.artist_name}`).join("\n");

            api.sendMessage(`🎧 Kết quả tìm thấy:\n${list}\n\n📥 Reply số thứ tự để xem lời bài hát.`, event.threadID, (err, info) => {
                global.client.handleReply.push({
                    step: "chooseTrack",
                    name: module.exports.config.name,
                    messageID: info.messageID,
                    author: event.senderID,
                    tracks
                });
            });
            break;
        }

        case "chooseTrack": {
            const index = parseInt(event.body) - 1;
            if (isNaN(index) || index < 0 || index >= handleReply.tracks.length) {
                return api.sendMessage("⚠️ Số không hợp lệ!", event.threadID);
            }

            const trackId = handleReply.tracks[index].track.track_id;
            const res = await axios.get(`https://api.musixmatch.com/ws/1.1/track.lyrics.get?track_id=${trackId}&apikey=${API_KEY}`);
            const lyrics = res.data.message.body.lyrics?.lyrics_body;

            if (!lyrics) {
                return api.sendMessage("❌ Không tìm thấy lời bài hát!", event.threadID);
            }

            return api.sendMessage(`🎼 Lời bài hát:\n\n${lyrics}`, event.threadID);
        }
    }
};
