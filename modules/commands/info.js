module.exports.config = {
	name: "info",
	version: "1.0.0",
	hasPermssion: 0,
	credits: "HungCho Mod By NguyenHoangAnhProCoder",
	description: "Thông tin nhóm, người dùng, và admin bot.",
	commandCategory: "Nhóm",
	usages: "",
	cooldowns: 4,
	dependencies: {
		"request": "2.88.2",
		"fs": "11.3.0"
	}
};

module.exports.run = async ({
	api,
	event,
	args,
	Threads
}) => {
	const fs = require('fs-extra');
	const request = require('request');

	// Lấy prefix từ settings nhóm
	const threadSetting = (await Threads.getData(String(event.threadID))).data || {};
	const prefix = threadSetting.PREFIX || global.config.PREFIX;

	// Trường hợp không có đối số
	if (args.length === 0) {
		return api.sendMessage(`Bạn có thể dùng:\n\n${prefix}${this.config.name} user => Thông tin cá nhân bạn.\n${prefix}${this.config.name} user @[Tag] => Thông tin người bạn tag.\n${prefix}${this.config.name} box => Thông tin nhóm.\n${prefix}${this.config.name} admin => Thông tin Admin Bot.`, event.threadID, event.messageID);
	}

	// Trường hợp yêu cầu thông tin nhóm
	if (args[0] === "box") {
		let threadInfo;
		if (args[1]) {
			threadInfo = await api.getThreadInfo(args[1]);
		} else {
			threadInfo = await api.getThreadInfo(event.threadID);
		}

		const gendernam = [];
		const gendernu = [];
		for (let z in threadInfo.userInfo) {
			const gioitinhone = threadInfo.userInfo[z].gender;
			if (gioitinhone === "MALE") gendernam.push(gioitinhone);
			else gendernu.push(gioitinhone);
		}

		const nam = gendernam.length;
		const nu = gendernu.length;
		const sex = threadInfo.approvalMode;
		const pd = sex ? "bật" : "tắt";
		const img = threadInfo.imageSrc;

		// Tạo thông báo
		const message = `🍁 𝙄𝙣𝙛𝙤 𝙗𝙤𝙭 🍁\n👀 Tên nhóm: ${threadInfo.threadName}\n🐧 TID: ${args[1] || event.threadID}\n🦋 Phê duyệt: ${pd}\n🐤 Emoji: ${threadInfo.emoji}\n☺️ Thông tin: \n» ${threadInfo.participantIDs.length} thành viên và ${threadInfo.adminIDs.length} quản trị viên.\n» Gồm ${nam} nam và ${nu} nữ.\n» Tổng số tin nhắn: ${threadInfo.messageCount}.`;

		const callback = () => api.sendMessage({
			body: message,
			attachment: fs.createReadStream(__dirname + "/cache/1.png")
		}, event.threadID, () => fs.unlinkSync(__dirname + "/cache/1.png"), event.messageID);

		// Xử lý ảnh nhóm
		if (img) {
			return request(encodeURI(`${img}`)).pipe(fs.createWriteStream(__dirname + '/cache/1.png')).on('close', () => callback());
		} else {
			return api.sendMessage(message, event.threadID, event.messageID);
		}
	}

	// Trường hợp yêu cầu thông tin Admin
	if (args[0] === "admin") {
		const adminInfo = {
			name: "Nguyễn Quang Minh",
			nickname: "Địt mẹ Hoàng An",
			birthday: "26/08/2006",
			gender: "Nam",
			relationship: "Độc thân",
			hometown: "Thái Nguyên",
			location: "TP.HCM",
			preferences: "Đoán Xem",
			personality: "Sống như cặc",
			hobbies: "Chơi game, nghe nhạc, ăn, ngủ",
			contact: "SĐT&Zalo: 0919402200\nFacebook: " + global.config.FACEBOOK_ADMIN
		};

		const callback = () => api.sendMessage({
			body: `✘ 𝑻𝒉𝒐̂𝒏𝒈 𝑻𝒊𝒏 𝑨𝒅𝒎𝒊𝒏 𝑩𝒐𝒕 ✘\n👀 Tên: ${adminInfo.name}\n💮 Biệt danh: ${adminInfo.nickname}\n❎ Ngày tháng năm sinh: ${adminInfo.birthday}\n👤 Giới tính: ${adminInfo.gender}\n💘 Mối quan hệ: ${adminInfo.relationship}\n🌎 Quê quán: ${adminInfo.hometown}\n🏰 Sống tại: ${adminInfo.location}\n👫 Gu: ${adminInfo.preferences}\n🌸 Tính cách: ${adminInfo.personality}\n🌀 Sở thích: ${adminInfo.hobbies}\n💻Contact💻\n☎ SĐT&Zalo: **\n🌐 Facebook: ${adminInfo.contact}`,
			attachment: fs.createReadStream(__dirname + "/cache/1.png")
		}, event.threadID, () => fs.unlinkSync(__dirname + "/cache/1.png"));

		return request(encodeURI(`https://graph.facebook.com/100084924943916/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`))
			.pipe(fs.createWriteStream(__dirname + '/cache/1.png')).on('close', () => callback());
	}

	// Trường hợp yêu cầu thông tin người dùng
	if (args[0] === "user") {
		let id;
		if (!args[1]) {
			id = event.type === "message_reply" ? event.messageReply.senderID : event.senderID;
		} else if (args.join().indexOf('@') !== -1) {
			const mentions = Object.keys(event.mentions);
			id = mentions[0];
		} else {
			id = args[1];
		}

		const data = await api.getUserInfo(id);
		const userData = data[id];
		const gender = userData.gender === 2 ? "Nam" : userData.gender === 1 ? "Nữ" : "Trần Đức Bo";
		const isFriend = userData.isFriend ? "có !" : "không !";
		const message = `🍁 𝙄𝙣𝙛𝙤 𝙪𝙨𝙚𝙧 🍁\n😚Tên: ${userData.name}\n🏝URL cá nhân: m.facebook.com/${id}\n💦Tên người dùng: ${userData.vanity}\n🐧UID: ${id}\n🦋Giới tính: ${gender}\n❄️Kết bạn với bot: ${isFriend}`;

		const callback = () => api.sendMessage({
			body: message,
			attachment: fs.createReadStream(__dirname + "/cache/1.png")
		}, event.threadID, () => fs.unlinkSync(__dirname + "/cache/1.png"), event.messageID);

		return request(encodeURI(`https://graph.facebook.com/${id}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`))
			.pipe(fs.createWriteStream(__dirname + '/cache/1.png')).on('close', () => callback());
	}
};