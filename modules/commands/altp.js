module.exports.config = {
    name: "altp",
    version: "2.1.2",
    hasPermssion: 0,
    credits: "Eddy (Updated by Dev)",
    description: "Chơi game Ai Là Triệu Phú",
    commandCategory: "Game",
    usages: "[create/start]",
    cooldowns: 5
};

const fs = require("fs");
const path = require("path");
const filePath = path.resolve("C:/Users/quang/Desktop/Mirai-Bot-V3/modules/commands/cache/altp.json");

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
            `📢 Cách chơi: nhập '!altp create' để tạo trò chơi, '!altp start' để bắt đầu.
🧠 Trả lời 15 câu hỏi, mỗi câu có 30 giây.
🛠 Trợ giúp: 50/50, gọi điện thoại, hỏi khán giả (mỗi loại chỉ được dùng 1 lần).`,
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

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function askNextQuestion(api, event, questionIndex, score, lifelines, shuffledQuestions) {
    let { threadID, senderID } = event;

    if (questionIndex >= shuffledQuestions.length) {
        return api.sendMessage(`🏆 Chúc mừng! Bạn đã hoàn thành trò chơi với số điểm: ${score}`, threadID);
    }

    let question = shuffledQuestions[questionIndex];
    let correct = question.answer;
    let options = question.options;
    let labels = ["A", "B", "C", "D"];
    
    console.log(`Câu hỏi: ${question.question}`);
    console.log(`Đáp án đúng: ${correct}`);
    
    let msg = `🎯 Câu ${questionIndex + 1}: ${question.question}\n\n`;
    options.forEach((opt, i) => msg += `🔹 ${labels[i]}. ${opt}\n`);
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
            timeout,
            shuffledQuestions
        });
    });
}

function startGame(api, event) {
    let { threadID, senderID } = event;
    let score = 0;
    let lifelines = { "50/50": true, "call": true, "audience": true };
    let shuffledQuestions = [...questions];
    shuffleArray(shuffledQuestions);
    let questionIndex = 0;
    askNextQuestion(api, event, questionIndex, score, lifelines, shuffledQuestions);
}

module.exports.handleReply = async ({ api, event, handleReply }) => {
    let { threadID, senderID, body } = event;
    if (handleReply.author !== senderID) return;

    let { questionIndex, score, lifelines, correct, timeout, shuffledQuestions } = handleReply;
    clearTimeout(timeout);

    let userAnswer = body.toUpperCase();
    api.unsendMessage(handleReply.messageID);

    console.log(`Người chơi trả lời: ${userAnswer}`);
    
    if (userAnswer === "50/50" && lifelines["50/50"]) {
        lifelines["50/50"] = false;
        return api.sendMessage("🛠 50/50: Đã loại bỏ 2 đáp án sai!", threadID);
    }
    
    if (userAnswer === "CALL" && lifelines["call"]) {
        lifelines["call"] = false;
        return api.sendMessage("📞 Gọi điện thoại: Người trợ giúp nghĩ rằng đáp án đúng là: " + correct, threadID);
    }
    
    if (userAnswer === "AUDIENCE" && lifelines["audience"]) {
        lifelines["audience"] = false;
        return api.sendMessage("👥 Hỏi khán giả: Đám đông chọn nhiều nhất: " + correct, threadID);
    }
    
    if (userAnswer === correct) {
        score++;
        api.sendMessage(`✅ Chính xác! Số điểm hiện tại: ${score}`, threadID, (err, info) => {
            if (!err) setTimeout(() => api.unsendMessage(info.messageID), 50000);
            questionIndex++;
            askNextQuestion(api, event, questionIndex, score, lifelines, shuffledQuestions);
        });
    } else {
        api.sendMessage(`❌ Sai rồi! Đáp án đúng là ${correct}.\n🏆 Tổng điểm: ${score}`, threadID, (err, info) => {
            if (!err) setTimeout(() => api.unsendMessage(info.messageID), 50000);
        });
    }
};
