const axios = require("axios");

module.exports.config = {
    name: "animeinfo",
    version: "1.2.0",
    hasPermssion: 0,
    credits: "Bạn",
    description: "Tìm kiếm thông tin anime hoặc nhân vật từ Kitsu.io",
    commandCategory: "Thông tin",
    usages: "[anime|character] tên",
    cooldowns: 5
};

module.exports.run = async function({
    api,
    event,
    args
}) {
    if (args.length < 2) {
        return api.sendMessage("📢 Vui lòng nhập đúng định dạng: animeinfo [anime|character] tên", event.threadID);
    }

    const type = args[0].toLowerCase();
    const query = encodeURIComponent(args.slice(1).join(" "));
    let apiUrl = "";

    switch (type) {
        case "anime":
            apiUrl = `https://kitsu.io/api/edge/anime?filter[text]=${query}`;
            break;
        case "character":
            apiUrl = `https://kitsu.io/api/edge/characters?filter[name]=${query}`;
            break;
        default:
            return api.sendMessage("❌ Loại tìm kiếm không hợp lệ! Chỉ hỗ trợ 'anime' hoặc 'character'.", event.threadID);
    }

    try {
        const response = await axios.get(apiUrl);
        const results = response.data.data;

        if (!results.length) {
            return api.sendMessage("❌ Không tìm thấy kết quả nào!", event.threadID);
        }

        const info = results[0].attributes;
        let imageUrl = info.posterImage?.original || info.image?.original;
        let message = "";

        switch (type) {
            case "anime":
                message = `🎬 **Anime**: ${info.titles.en_us} (Tên gốc: ${info.titles.ja_jp}) \n📖 **Mô tả**: ${info.description}`;
                break;
            case "character":
                message = `🧑 **Nhân vật**: ${info.names.en} (Tên gốc: ${info.names.ja_jp})\n📖 **Mô tả**: ${info.description}`;
                break;
        }

        if (imageUrl) {
            const imageStream = (await axios({
                url: imageUrl,
                responseType: "stream"
            })).data;
            return api.sendMessage({
                body: message,
                attachment: imageStream
            }, event.threadID);
        } else {
            return api.sendMessage(message, event.threadID);
        }
    } catch (error) {
        console.error("❌ Lỗi khi gọi API Kitsu:", error);
        return api.sendMessage("⚠️ Đã xảy ra lỗi khi lấy dữ liệu, vui lòng thử lại sau!", event.threadID);
    }
};