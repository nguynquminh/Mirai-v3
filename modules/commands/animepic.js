module.exports.config = {
	name: "animepic",
	version: "1.0.0",
	hasPermssion: 0,
	credits: "qm",
	description: "Gửi một ảnh anime ngẫu nhiên",
	commandCategory: "Giải trí",
	usages: "[animepic]",
	cooldowns: 5
};

const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.run = async function({
	api,
	event
}) {
	try {
		const startTime = Date.now();

		const imageUrl = "https://api.nekosapi.com/v4/images/random/file";
		const filePath = path.join(__dirname, "random_anime_image.webp");

		console.log("📥 Bắt đầu tải ảnh...");

		const response = await axios({
			method: "GET",
			url: imageUrl,
			responseType: "stream",
		});

		const writer = fs.createWriteStream(filePath);
		response.data.pipe(writer);

		writer.on("finish", () => {
			const endTime = Date.now();
			const processingTime = ((endTime - startTime) / 1000).toFixed(2);
			console.log(`✅ Ảnh đã tải xong! Thời gian xử lý: ${processingTime} giây`);

			api.sendMessage({
				body: `🎴 Ảnh anime đây!`,
				attachment: fs.createReadStream(filePath)
			}, event.threadID, () => {
				fs.unlinkSync(filePath);
			});
		});

	} catch (error) {
		console.log("⚠️ Lỗi khi tải ảnh:", error);
		api.sendMessage("⚠️ Lỗi khi tải ảnh!", event.threadID);
	}
};