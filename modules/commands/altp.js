module.exports.config = {
    name: "altp",
    version: "2.5.0",
    hasPermssion: 0,
    credits: "Eddy ",
    description: "Game Ai Là Triệu Phú",
    commandCategory: "Game",
    usages: "[start]",
    cooldowns: 5,
    dependencies: {
        "fs-extra": "",
        "path": ""
    }
};

const fs = require("fs-extra");
const path = require("path");
const filePath = path.join(__dirname, "cache", "altp.json");

// Khởi tạo dữ liệu câu hỏi
let questions = [];
try {
    questions = fs.readJsonSync(filePath);
    if (!Array.isArray(questions)) throw new Error("Dữ liệu không hợp lệ");
} catch (e) {
    console.error("Lỗi khi đọc file câu hỏi:", e.message);
    questions = require("./altp_questions.json");
}

// Cấu trúc giải thưởng (đã giảm 50% so với bản gốc)
const PRIZES = [
    100, 200, 300, 500, 1000,
    1500, 3000, 5000, 7000, 11000,
    15000, 20000, 30000, 42500, 75000
];

module.exports.run = async ({
    api,
    event,
    args,
    Currencies
}) => {
    const {
        threadID,
        messageID,
        senderID
    } = event;

    if (!args[0] || args[0].toLowerCase() !== "start") {
        return api.sendMessage(
            `🎮 WHO WANTS TO BE A MILLIONAIRE\n\n` +
            `📌 How to play: !altp start\n\n` +
            `💰 Prize: 15 questions from $100 to $75,000\n` +
            `⏳ Time: 30 seconds/question\n\n` +
            `🛠 LIFELINES (each can be used once):\n` +
            `• 50/50 - Remove 2 wrong answers\n` +
            `• call - Phone a friend (85% accurate)\n` +
            `• audience - Ask the audience (60% accurate)\n\n` +
            `💵 Entry fee: $1000`,
            threadID,
            messageID
        );
    }

    const userMoney = (await Currencies.getData(senderID)).money;
    if (userMoney < 1000) {
        return api.sendMessage("❌ You need at least $1000 to join!", threadID, messageID);
    }

    await Currencies.decreaseMoney(senderID, 10);
    startGame(api, event, Currencies);
};

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

async function askNextQuestion(api, event, gameData, Currencies) {
    const {
        threadID,
        senderID
    } = event;
    const {
        questionIndex,
        score,
        lifelines,
        shuffledQuestions
    } = gameData;

    if (questionIndex >= 15) {
        const totalPrize = score > 0 ? PRIZES[score - 1] : 0;
        if (totalPrize > 0) await Currencies.increaseMoney(senderID, totalPrize);
        return api.sendMessage(
            `🏆 CONGRATULATIONS!\n` +
            `💰 You won: $${formatMoney(totalPrize)}\n` +
            `✅ Correct answers: ${score}/15\n` +
            `🎮 Thanks for playing!`,
            threadID
        );
    }

    const question = shuffledQuestions[questionIndex];
    const labels = ["A", "B", "C", "D"];

    console.log('\n=== NEW QUESTION ===');
    console.log('Question:', question.question);
    console.log('Correct answer:', question.answer);
    console.log('Options:', question.options);

    let msg = `💰 CURRENT PRIZE: $${formatMoney(PRIZES[questionIndex])}\n\n` +
        `❓ QUESTION ${questionIndex + 1}: ${question.question}\n\n`;

    question.options.forEach((opt, i) => msg += `🔹 ${labels[i]}. ${opt}\n`);

    msg += `\n⏳ Time left: 30 seconds\n` +
        `🛠 Available lifelines: ${getAvailableLifelines(lifelines)}\n` +
        `👉 Enter A/B/C/D or lifeline name`;

    api.sendMessage(msg, threadID, (err, info) => {
        if (err) return console.error(err);

        const timeout = setTimeout(async () => {
            global.client.handleReply = global.client.handleReply.filter(item => item.messageID !== info.messageID);
            const totalPrize = score > 0 ? PRIZES[score - 1] : 0;
            if (totalPrize > 0) await Currencies.increaseMoney(senderID, totalPrize);
            api.sendMessage(
                `⏰ TIME'S UP!\n` +
                `💵 You earned: $${formatMoney(totalPrize)}\n` +
                `🔹 Correct answer: ${question.answer}`,
                threadID
            );
        }, 30000);

        global.client.handleReply.push({
            name: "altp",
            author: senderID,
            messageID: info.messageID,
            questionIndex,
            score,
            lifelines,
            currentQuestion: question,
            shuffledQuestions,
            timeout
        });
    });
}

function startGame(api, event, Currencies) {
    const gameData = {
        questionIndex: 0,
        score: 0,
        lifelines: {
            "50/50": true,
            "call": true,
            "audience": true
        },
        shuffledQuestions: shuffleArray([...questions]).slice(0, 15)
    };
    askNextQuestion(api, event, gameData, Currencies);
}

module.exports.handleReply = async ({
    api,
    event,
    handleReply,
    Currencies
}) => {
    const {
        threadID,
        senderID,
        body
    } = event;
    if (handleReply.author !== senderID) return;

    const {
        questionIndex,
        score,
        lifelines,
        currentQuestion,
        timeout,
        shuffledQuestions
    } = handleReply;
    clearTimeout(timeout);

    console.log('\n=== PLAYER INPUT ===');
    console.log('Player entered:', body);
    console.log('Correct answer:', currentQuestion.answer);
    console.log('Current options:', currentQuestion.options);

    const userAnswer = body.trim().toUpperCase();
    const correctAnswer = currentQuestion.answer.toUpperCase();
    const labels = ["A", "B", "C", "D"];

    // 50/50 Lifeline
    if (userAnswer === "50/50" && lifelines["50/50"]) {
        lifelines["50/50"] = false;
        const options = currentQuestion.options.map((opt, i) => ({
            opt,
            label: labels[i]
        }));
        const wrongOptions = options.filter(item => item.opt !== currentQuestion.answer);
        const removedOptions = shuffleArray([...wrongOptions]).slice(0, 2);
        const remainingOptions = options.filter(opt =>
            !removedOptions.some(r => r.label === opt.label)
        );

        console.log('\n=== 50/50 DEBUG ===');
        console.log('Removed options:', removedOptions.map(o => o.label));
        console.log('Remaining options:', remainingOptions.map(o => o.label));

        return api.sendMessage(
            `🛠 50/50: Removed:\n` +
            removedOptions.map(item => `❌ ${item.label}. ${item.opt}`).join("\n") +
            `\n\n👉 Please choose between: ${remainingOptions.map(opt => opt.label).join("/")}`,
            threadID,
            (err, info) => {
                if (err) return;
                global.client.handleReply.push({
                    ...handleReply,
                    messageID: info.messageID,
                    lifelines: {
                        ...lifelines,
                        "50/50": false
                    }
                });
            }
        );
    }

    // Phone a Friend
    if (userAnswer === "CALL" && lifelines["call"]) {
        lifelines["call"] = false;
        const isCorrect = Math.random() < 0.85;
        const suggestedAnswer = isCorrect ? correctAnswer :
            labels.find(label => label !== correctAnswer && currentQuestion.options[labels.indexOf(label)] !== undefined);

        return api.sendMessage(
            `📞 FRIEND SAYS:\n"I'm ${isCorrect ? 85 : 15}% sure it's ${suggestedAnswer}"\n\n` +
            `👉 Please enter your answer (A/B/C/D)`,
            threadID,
            (err, info) => {
                if (err) return;
                global.client.handleReply.push({
                    ...handleReply,
                    messageID: info.messageID,
                    lifelines: {
                        ...lifelines,
                        "call": false
                    }
                });
            }
        );
    }

    // Ask the Audience
    if (userAnswer === "AUDIENCE" && lifelines["audience"]) {
        lifelines["audience"] = false;
        const votes = {};
        labels.forEach(label => {
            votes[label] = label === correctAnswer ?
                Math.floor(Math.random() * 30) + 60 :
                Math.floor(Math.random() * 30);
        });

        return api.sendMessage(
            `👥 AUDIENCE VOTES:\n` +
            Object.entries(votes).map(([label, percent]) => `🔹 ${label}: ${percent}%`).join("\n") +
            `\n\n👉 Please enter your answer (A/B/C/D)`,
            threadID,
            (err, info) => {
                if (err) return;
                global.client.handleReply.push({
                    ...handleReply,
                    messageID: info.messageID,
                    lifelines: {
                        ...lifelines,
                        "audience": false
                    }
                });
            }
        );
    }

    // Check answer
    if (labels.includes(userAnswer)) {
        if (userAnswer === correctAnswer) {
            const newScore = score + 1;
            const prize = PRIZES[questionIndex];
            await Currencies.increaseMoney(senderID, prize);

            api.sendMessage(
                `✅ CORRECT!\n` +
                `💵 You earned: +$${formatMoney(prize)}\n` +
                `💰 Total prize: $${formatMoney(PRIZES[newScore - 1])}`,
                threadID,
                () => askNextQuestion(api, event, {
                    questionIndex: questionIndex + 1,
                    score: newScore,
                    lifelines,
                    shuffledQuestions
                }, Currencies)
            );
        } else {
            const totalPrize = score > 0 ? PRIZES[score - 1] : 0;
            if (totalPrize > 0) await Currencies.increaseMoney(senderID, totalPrize);
            api.sendMessage(
                `❌ WRONG!\n` +
                `🔹 Correct answer: ${correctAnswer}\n` +
                `💵 You earned: $${formatMoney(totalPrize)}`,
                threadID
            );
        }
    }
};

function formatMoney(amount) {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function getAvailableLifelines(lifelines) {
    return Object.entries(lifelines)
        .filter(([_, available]) => available)
        .map(([name]) => name)
        .join(", ") || "None left";
}
