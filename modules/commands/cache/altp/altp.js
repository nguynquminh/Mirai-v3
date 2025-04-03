module.exports.config = {
    name: "altp",
    version: "2.0.1",
    hasPermssion: 0,
    credits: "Eddy",
    description: "Chơi game Ai Là Triệu Phú",
    commandCategory: "Game",
    usages: "[create/start]",
    cooldowns: 5
};

const fs = require("fs");
const path = require("path");

const filePath = path.resolve("C:/Users/quang/Desktop/tools/Mirai-Bot-V3/modules/commands/cache/altp/altp.json");

if (!fs.existsSync(filePath)) {
    console.error("LỖI: Không tìm thấy file JSON!");
} else {
    try {
        var questions = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        if (!Array.isArray(questions)) throw new Error("Dữ liệu không đúng định dạng!");
    } catch (error) {
        console.error("Lỗi khi đọc JSON:", error.message);
        var questions = [];
    }
}

module.exports.run = async ({ api, event, args }) => {
    let { threadID, messageID } = event;

    if (!args[0] || !["create", "start"].includes(args[0].toLowerCase())) {
        return api.sendMessage(
            `📢 Cách chơi: nhập '!altp create' để tạo trò chơi, '!altp start' để bắt đầu.\n🧠 Trả lời 150 câu hỏi, mỗi câu có 30 giây.\n🛠 Trợ giúp: 50/50, gọi điện thoại, hỏi khán giả.`,
            threadID,
            messageID
        );
    }

    if (args[0].toLowerCase() === "create") {
        return api.sendMessage("🎮 Trò chơi đã được tạo! Nhập !altp start để bắt đầu.", threadID, messageID);
    }

    if (args[0].toLowerCase() === "start") {
        startGame(api, event);
    }
};

function askNextQuestion(api, event, questionIndex, score, lifelines) {
    let { threadID, senderID } = event;

    if (questionIndex >= questions.length) {
        return api.sendMessage(`🏆 Chúc mừng! Bạn đã hoàn thành trò chơi với số điểm: ${score}`, threadID);
    }

    let question = questions[questionIndex];
    let correct = question.answer;

    let msg = `❓ Câu ${questionIndex + 1}: ${question.question}\n`;
    question.options.forEach((opt, i) => msg += `${opt}\n`);
    msg += `\n⏳ Bạn có 30 giây để trả lời.\n🔹 Nhập A/B/C/D hoặc dùng trợ giúp: \n  - "50/50"\n  - "call"\n  - "audience"`;

    api.sendMessage(msg, threadID, (err, info) => {
        if (err) return;
        let timeout = setTimeout(() => {
            api.sendMessage("⏰ Hết giờ! Bạn đã trả lời quá lâu.", threadID);
            return;
        }, 30000);

        global.client.handleReply.push({
            name: "altp",
            author: senderID,
            messageID: info.messageID,
            questionIndex,
            score,
            lifelines,
            correct,
            timeout
        });
    });
}

function startGame(api, event) {
    let { threadID, senderID } = event;
    let score = 0;
    let lifelines = { "50/50": true, "call": true, "audience": true };
    let questionIndex = 0;
    askNextQuestion(api, event, questionIndex, score, lifelines);
}

module.exports.handleReply = async ({ api, event, handleReply }) => {
    let { threadID, messageID, senderID, body } = event;
    if (handleReply.author !== senderID) return;

    let { questionIndex, score, lifelines, correct, timeout } = handleReply;

    clearTimeout(timeout);

    let userAnswer = body.toUpperCase();

    api.unsendMessage(handleReply.messageID);

    if (userAnswer === correct) {
        score++;
        api.sendMessage(`✅ Chính xác! Số điểm hiện tại: ${score}`, threadID, (err, info) => {
            if (!err) setTimeout(() => api.unsendMessage(info.messageID), 50000);
            questionIndex++;
            askNextQuestion(api, event, questionIndex, score, lifelines);
        });
    } else {
        api.sendMessage(`❌ Sai rồi! Đáp án đúng là ${correct}.\n🏆 Tổng điểm: ${score}`, threadID, (err, info) => {
            if (!err) setTimeout(() => api.unsendMessage(info.messageID), 50000);
        });
    }
};