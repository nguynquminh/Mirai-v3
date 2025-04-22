const axios = require("axios");

module.exports.config = {
    name: "bloxfruit",
    version: "1.1.0",
    hasPermssion: 0,
    credits: "qm",
    description: "Tra cứu stock Blox Fruits (all/normal/mirage)",
    commandCategory: "Game",
    usages: "[all/normal/mirage]",
    cooldowns: 5
};

module.exports.run = async function({
    api,
    event,
    args
}) {
    const {
        threadID,
        messageID
    } = event;
    const API_URL = "https://bloxfruit-stock.onrender.com/stockcheck";

    // Determine which dealer to show based on args
    const mode = args[0]?.toLowerCase() || "all";

    try {
        // Call API
        const response = await axios.get(API_URL);
        const data = response.data;

        // Check API status
        if (data.status !== "success") {
            return api.sendMessage("❌ Lỗi: Không thể lấy dữ liệu stock Blox Fruits!", threadID);
        }

        // Get data
        const {
            refreshTime,
            fruits
        } = data;
        const {
            mirage,
            normal
        } = fruits;

        // Format message based on mode
        let message = "";

        if (mode === "all" || mode === "both") {
            message = formatFullStock(refreshTime, mirage, normal);
        } else if (mode === "mirage") {
            message = formatMirageStock(refreshTime.mirage, mirage);
        } else if (mode === "normal") {
            message = formatNormalStock(refreshTime.normal, normal);
        } else {
            message = `❓ Tùy chọn không hợp lệ: "${mode}"\n`;
            message += "✅ Sử dụng: .bloxfruit [all/normal/mirage]";
            return api.sendMessage(message, threadID);
        }

        // Send message
        api.sendMessage(message, threadID, (error, info) => {
            if (error) {
                console.error("❌ Lỗi khi gửi tin nhắn:", error);
            }
        });

    } catch (error) {
        console.error("❌ Lỗi khi lấy stock Blox Fruits:", error);
        let errorMessage = "⚠️ Đã xảy ra lỗi khi lấy stock Blox Fruits!";

        if (error.response) {
            if (error.response.status === 404) {
                errorMessage = "❌ Không tìm thấy dữ liệu stock!";
            } else if (error.response.status === 429) {
                errorMessage = "⚠️ Quá nhiều yêu cầu! Vui lòng thử lại sau.";
            } else if (error.response.status >= 500) {
                errorMessage = "⚠️ Lỗi server API! Vui lòng thử lại sau.";
            }
        } else if (error.code === "ECONNABORTED") {
            errorMessage = "⚠️ Hết thời gian kết nối! Vui lòng thử lại.";
        }

        api.sendMessage(errorMessage, threadID);
    }
};

// Helper function to format fruit info
function formatFruit(fruit, index) {
    let line = `│   ${index + 1}. ${fruit.name}\n`;
    line += `│      💰 ${fruit.value.toLocaleString()} $\n`;

    line += `│      💎 ${fruit.price.toLocaleString()} R$\n`;

    return line;
}

function formatFullStock(refreshTime, mirage, normal) {
    let message = "╭━━━「 🍎 BLOX FRUITS STOCK 」━━━╮\n";
    message += "│\n";
    message += "│ 📊 TRẠNG THÁI STOCK HIỆN TẠI\n";
    message += "│\n";

    // Mirage Dealer
    message += "├─────「 🔮 MIRAGE DEALER 」─────┤\n";
    message += `│ ⏰ Refresh sau: ${refreshTime.mirage}\n`;
    message += "│ 🍇 Trái cây:\n";

    if (mirage.length === 0) {
        message += "│   (Không có trái cây nào)\n";
    } else {
        mirage.forEach((fruit, index) => {
            message += formatFruit(fruit, index);
        });
    }

    // Normal Dealer
    message += "├─────「 🛒 NORMAL DEALER 」─────┤\n";
    message += `│ ⏰ Refresh sau: ${refreshTime.normal}\n`;
    message += "│ 🍇 Trái cây:\n";

    if (normal.length === 0) {
        message += "│   (Không có trái cây nào)\n";
    } else {
        normal.forEach((fruit, index) => {
            message += formatFruit(fruit, index);
        });
    }

    message += "╰─────「 QMINH 」─────╯";

    return message;
}

function formatMirageStock(refreshTime, mirage) {
    let message = "╭━━━「 🔮 MIRAGE DEALER 」━━━╮\n";
    message += "│\n";
    message += `│ ⏰ Refresh sau: ${refreshTime}\n`;
    message += "│ 🍇 Trái cây:\n";

    if (mirage.length === 0) {
        message += "│   (Không có trái cây nào)\n";
    } else {
        mirage.forEach((fruit, index) => {
            message += formatFruit(fruit, index);
        });
    }

    message += "╰─────「 QMINH 」─────╯";

    return message;
}

function formatNormalStock(refreshTime, normal) {
    let message = "╭━━━「 🛒 NORMAL DEALER 」━━━╮\n";
    message += "│\n";
    message += `│ ⏰ Refresh sau: ${refreshTime}\n`;
    message += "│ 🍇 Trái cây:\n";

    if (normal.length === 0) {
        message += "│   (Không có trái cây nào)\n";
    } else {
        normal.forEach((fruit, index) => {
            message += formatFruit(fruit, index);
        });
    }

    message += "╰─────「 QMINH 」─────╯";

    return message;
}
