module.exports.config = {
	name: "info",
	version: "2.1.0",
	hasPermssion: 0,
	credits: "HungCho",
	description: "Advanced group, user, and admin information",
	commandCategory: "Utility",
	usages: "[user/box/admin] [@tag/ID]",
	cooldowns: 5,
	dependencies: {
		"axios": "",
		"fs-extra": "",
		"moment-timezone": ""
	}
};

module.exports.run = async ({ api, event, args, Threads }) => {
	const fs = require('fs-extra');
	const axios = require('axios');
	const moment = require('moment-timezone');
	
	// Set timezone to Vietnam
	moment.tz.setDefault('Asia/Ho_Chi_Minh');
	
	// Get group prefix
	const threadSetting = (await Threads.getData(String(event.threadID))).data || {};
	const prefix = threadSetting.PREFIX || global.config.PREFIX;

	// Help menu
	if (args.length === 0 || args[0] === "help") {
		const helpMessage = `📌 𝐈𝐍𝐅𝐎 𝐂𝐎𝐌𝐌𝐀𝐍𝐃 𝐆𝐔𝐈𝐃𝐄 📌
━━━━━━━━━━━━━━━━━
🔹 ${prefix}info user - Your profile info
🔹 ${prefix}info user @tag - Tagged user's info
🔹 ${prefix}info box - Current group info
🔹 ${prefix}info box [threadID] - Specific group info
🔹 ${prefix}info admin - Bot admin info
━━━━━━━━━━━━━━━━━
🎨 cặc cặc cặc cặc cặc cặc cặc cặc`;
		return api.sendMessage(helpMessage, event.threadID, event.messageID);
	}

	// Group info handler
	if (args[0] === "box") {
		try {
			const threadID = args[1] || event.threadID;
			const threadInfo = await api.getThreadInfo(threadID);
			
			// Calculate gender statistics
			let maleCount = 0, femaleCount = 0, otherCount = 0;
			for (const user of Object.values(threadInfo.userInfo)) {
				if (user.gender === "MALE") maleCount++;
				else if (user.gender === "FEMALE") femaleCount++;
				else otherCount++;
			}
			
			// Format creation date
			const creationDate = threadInfo.threadMetadata 
				? moment(threadInfo.threadMetadata.createdAt).format('DD/MM/YYYY HH:mm:ss')
				: "Unknown";
			
			// Create info message with emoji visuals
			const boxInfo = `🎪 𝐆𝐑𝐎𝐔𝐏 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐓𝐈𝐎𝐍 🎪
━━━━━━━━━━━━━━━━━━━━
🔸 𝗡𝗮𝗺𝗲: ${threadInfo.threadName}
🔸 𝗜𝗗: ${threadID}
🔸 𝗖𝗿𝗲𝗮𝘁𝗲𝗱: ${creationDate}
🔸 𝗠𝗲𝗺𝗯𝗲𝗿𝘀: ${threadInfo.participantIDs.length} users
   👨 ${maleCount} male | 👩 ${femaleCount} female | 🧑 ${otherCount} other
🔸 𝗔𝗱𝗺𝗶𝗻𝘀: ${threadInfo.adminIDs.length} admins
🔸 𝗔𝗽𝗽𝗿𝗼𝘃𝗮𝗹 𝗠𝗼𝗱𝗲: ${threadInfo.approvalMode ? "✅ ON" : "❌ OFF"}
🔸 𝗘𝗺𝗼𝗷𝗶: ${threadInfo.emoji || "None"}
🔸 𝗠𝗲𝘀𝘀𝗮𝗴𝗲𝘀: ${threadInfo.messageCount.toLocaleString()}
━━━━━━━━━━━━━━━━━━━━`;
			
			// Send with group image if available
			if (threadInfo.imageSrc) {
				const path = __dirname + '/cache/group_info.png';
				const { data } = await axios.get(threadInfo.imageSrc, { responseType: 'arraybuffer' });
				fs.writeFileSync(path, Buffer.from(data, 'binary'));
				
				return api.sendMessage({
					body: boxInfo,
					attachment: fs.createReadStream(path)
				}, event.threadID, () => fs.unlinkSync(path), event.messageID);
			}
			
			return api.sendMessage(boxInfo, event.threadID, event.messageID);
			
		} catch (error) {
			console.error(error);
			return api.sendMessage("❌ An error occurred while fetching group information.", event.threadID, event.messageID);
		}
	}

	// Admin info handler
	if (args[0] === "admin") {
		try {
			const adminInfo = {
				name: "Nguyễn Quang Minh",
				nickname: "Minh",
				birthday: "26/08/2006",
				age: moment().diff(moment("26/08/2006", "DD/MM/YYYY"), 'years'),
				gender: "Male",
				relationship: "Single",
				hometown: "Thái Nguyên",
				location: "TP.HCM",
				interests: "Coding, Gaming, Music",
				personality: "Friendly but busy",
				contact: `Facebook: https://facebook.com/profile.php?id=${global.config.FACEBOOK_ADMIN || "Not provided"}`
			};
			
			// Create ASCII-style card
			const adminCard = `╔════════════════════════════╗
║       👑 ADMIN PROFILE 👑      ║
╠════════════════════════════╣
║ 𝗡𝗮𝗺𝗲: ${adminInfo.name.padEnd(20)} ║
║ 𝗡𝗶𝗰𝗸𝗻𝗮𝗺𝗲: ${adminInfo.nickname.padEnd(16)} ║
║ 𝗔𝗴𝗲: ${String(adminInfo.age).padEnd(21)} ║
║ 𝗕𝗶𝗿𝘁𝗵𝗱𝗮𝘆: ${adminInfo.birthday.padEnd(15)} ║
║ 𝗚𝗲𝗻𝗱𝗲𝗿: ${adminInfo.gender.padEnd(17)} ║
║ 𝗥𝗲𝗹𝗮𝘁𝗶𝗼𝗻𝘀𝗵𝗶𝗽: ${adminInfo.relationship.padEnd(9)} ║
║ 𝗟𝗼𝗰𝗮𝘁𝗶𝗼𝗻: ${adminInfo.location.padEnd(15)} ║
║ 𝗛𝗼𝗺𝗲𝘁𝗼𝘄𝗻: ${adminInfo.hometown.padEnd(13)} ║
║ 𝗜𝗻𝘁𝗲𝗿𝗲𝘀𝘁𝘀: ${adminInfo.interests.padEnd(12)} ║
║ 𝗣𝗲𝗿𝘀𝗼𝗻𝗮𝗹𝗶𝘁𝘆: ${adminInfo.personality.padEnd(10)} ║
╠════════════════════════════╣
║ 📞 𝗖𝗼𝗻𝘁𝗮𝗰𝘁 𝗜𝗻𝗳𝗼:          ║
║ ${adminInfo.contact.padEnd(25)} ║
╚════════════════════════════╝`;
			
			// Try to get admin profile picture
			try {
				const path = __dirname + '/cache/admin_profile.png';
				const { data } = await axios.get(`https://graph.facebook.com/100084924943916/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { 
					responseType: 'arraybuffer' 
				});
				fs.writeFileSync(path, Buffer.from(data, 'binary'));
				
				return api.sendMessage({
					body: adminCard,
					attachment: fs.createReadStream(path)
				}, event.threadID, () => fs.unlinkSync(path), event.messageID);
			} catch (e) {
				// If image fails, send text only
				return api.sendMessage(adminCard, event.threadID, event.messageID);
			}
			
		} catch (error) {
			console.error(error);
			return api.sendMessage("❌ An error occurred while fetching admin information.", event.threadID, event.messageID);
		}
	}

	// User info handler
	if (args[0] === "user") {
		try {
			let userID;
			if (!args[1]) {
				userID = event.type === "message_reply" ? event.messageReply.senderID : event.senderID;
			} else if (Object.keys(event.mentions).length > 0) {
				userID = Object.keys(event.mentions)[0];
			} else {
				userID = args[1];
			}
			
			const userInfo = await api.getUserInfo(userID);
			const userData = userInfo[userID];
			
			if (!userData) {
				return api.sendMessage("❌ User not found.", event.threadID, event.messageID);
			}
			
			// Format gender
			let gender;
			switch (userData.gender) {
				case 1: gender = "Female 👩"; break;
				case 2: gender = "Male 👨"; break;
				default: gender = "Other 🧑"; break;
			}
			
			// Format relationship status
			let relationship = "Unknown";
			if (userData.love) {
				relationship = `In relationship with ${userData.love.name}`;
			} else if (userData.relationship_status) {
				relationship = userData.relationship_status;
			}
			
			// Create user profile with box design
			const userProfile = `╔════════════════════════════╗
║        👤 USER PROFILE 👤       ║
╠════════════════════════════╣
║ 𝗡𝗮𝗺𝗲: ${userData.name.padEnd(22)} ║
║ 𝗨𝗜𝗗: ${String(userID).padEnd(22)} ║
║ 𝗚𝗲𝗻𝗱𝗲𝗿: ${gender.padEnd(19)} ║
║ 𝗙𝗿𝗶𝗲𝗻𝗱𝘀 𝘄𝗶𝘁𝗵 𝗯𝗼𝘁: ${userData.isFriend ? "✅ Yes".padEnd(14) : "❌ No".padEnd(14)} ║
║ 𝗥𝗲𝗹𝗮𝘁𝗶𝗼𝗻𝘀𝗵𝗶𝗽: ${relationship.padEnd(12)} ║
║ 𝗙𝗼𝗹𝗹𝗼𝘄𝗲𝗿𝘀: ${String(userData.follow || "Unknown").padEnd(16)} ║
║ 𝗩𝗮𝗻𝗶𝘁𝘆: ${String(userData.vanity || "None").padEnd(18)} ║
╠════════════════════════════╣
║ 🔗 https://facebook.com/${String(userID).padEnd(11)} ║
╚════════════════════════════╝`;
			
			// Get user profile picture
			const path = __dirname + '/cache/user_profile.png';
			const { data } = await axios.get(`https://graph.facebook.com/${userID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { 
				responseType: 'arraybuffer' 
			});
			fs.writeFileSync(path, Buffer.from(data, 'binary'));
			
			return api.sendMessage({
				body: userProfile,
				attachment: fs.createReadStream(path)
			}, event.threadID, () => fs.unlinkSync(path), event.messageID);
			
		} catch (error) {
			console.error(error);
			return api.sendMessage("❌ An error occurred while fetching user information.", event.threadID, event.messageID);
		}
	}
};