const axios = require("axios");

module.exports.config = {
  name: "manga",
  version: "1.4.0",
  hasPermssion: 0,
  credits: "qm",
  description: "Đọc manga từ MangaDex",
  commandCategory: "Giải trí",
  usages: "[manga]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event }) {
  return api.sendMessage("📖 Vui lòng nhập tên manga!", event.threadID, (err, info) => {
    global.client.handleReply.push({
      name: module.exports.config.name,
      messageID: info.messageID,
      author: event.senderID,
      step: "getMangaName"
    });
  });
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
  if (event.senderID !== handleReply.author) return;

  if (handleReply.step === "getMangaName") {
    const mangaName = encodeURIComponent(event.body.trim());
    const searchUrl = `https://api.mangadex.org/manga?title=${mangaName}`;
    try {
      const searchResponse = await axios.get(searchUrl);
      const mangaResults = searchResponse.data.data;
      
      if (!mangaResults.length) {
        return api.sendMessage("❌ Không tìm thấy truyện nào với tên đó!", event.threadID);
      }
      
      const mangaID = mangaResults[0].id;
      const mangaInfo = mangaResults[0].attributes;
      
      const infoMessage = `📘 Tên: ${mangaInfo.title.en || "Không có dữ liệu"}\n📝 Mô tả: ${mangaInfo.description.en || "Không có dữ liệu"}\n📅 Ngày phát hành: ${mangaInfo.year || "Không có dữ liệu"}\n💬 Trạng thái: ${mangaInfo.status || "Không có dữ liệu"}`;
      
      return api.sendMessage(infoMessage + "\n\n🌍 Vui lòng chọn ngôn ngữ:\n1️⃣ Tiếng Anh\n2️⃣ Tiếng Việt\n💬 Reply với số tương ứng!", event.threadID, (err, info) => {
        global.client.handleReply.push({
          name: module.exports.config.name,
          messageID: info.messageID,
          author: event.senderID,
          step: "chooseLanguage",
          mangaID
        });
      });
    } catch (error) {
      console.error("❌ Lỗi tìm kiếm manga:", error);
      return api.sendMessage("⚠️ Lỗi tìm kiếm manga!", event.threadID);
    }
  }

  if (handleReply.step === "chooseLanguage") {
    let language = "en";
    if (event.body.trim() === "2") language = "vi";
    
    const mangaID = handleReply.mangaID;
    const apiUrl = `https://api.mangadex.org/manga/${mangaID}/feed?translatedLanguage[]=${language}`;
    try {
      const response = await axios.get(apiUrl);
      const chapters = response.data.data;
      
      if (!chapters.length) {
        return api.sendMessage("❌ Không tìm thấy chương nào!", event.threadID);
      }
      
      let chapterList = "✨ Danh sách chương:\n";
      chapters.forEach((ch, index) => {
        chapterList += `📖 ${index + 1}. Chương ${ch.attributes.chapter} - ${ch.id}\n`;
      });
      
      return api.sendMessage(chapterList + "\n💬 Reply với số thứ tự chương để đọc!", event.threadID, (err, info) => {
        global.client.handleReply.push({
          name: module.exports.config.name,
          messageID: info.messageID,
          author: event.senderID,
          step: "getChapter",
          chapters
        });
      });
    } catch (error) {
      console.error("❌ Lỗi lấy danh sách chương:", error);
      return api.sendMessage("⚠️ Lỗi lấy danh sách chương!", event.threadID);
    }
  }

  if (handleReply.step === "getChapter") {
    const selectedIndex = parseInt(event.body) - 1;
    if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= handleReply.chapters.length) {
      return api.sendMessage("⚠️ Số thứ tự không hợp lệ!", event.threadID);
    }
    
    const chapterID = handleReply.chapters[selectedIndex].id;
    const chapterApiUrl = `https://api.mangadex.org/at-home/server/${chapterID}`;
    try {
      const chapterData = await axios.get(chapterApiUrl);
      const { baseUrl, chapter } = chapterData.data;
      const imageUrls = chapter.data.map(img => `${baseUrl}/data/${chapter.hash}/${img}`);
      
      const attachments = await Promise.all(imageUrls.map(async url => {
        return axios({ url, responseType: "stream" }).then(res => res.data);
      }));
      
      return api.sendMessage({
        body: "📖 Đây là chương bạn chọn:",
        attachment: attachments
      }, event.threadID);
    } catch (error) {
      console.error("❌ Lỗi lấy nội dung chương:", error);
      return api.sendMessage("⚠️ Lỗi tải nội dung chương!", event.threadID);
    }
  }
};
