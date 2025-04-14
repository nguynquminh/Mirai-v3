module.exports.config = {
    name: "bmi",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "qm",
    description: "Tính chỉ số BMI, trạng thái cơ thể và khuyến nghị calo",
    commandCategory: "Sức khỏe",
    usages: "[chiều cao cm] [cân nặng kg]",
    cooldowns: 5,
};

module.exports.run = async ({
    api,
    event,
    args
}) => {
    const heightCm = parseFloat(args[0]);
    const weightKg = parseFloat(args[1]);

    if (isNaN(heightCm) || isNaN(weightKg)) {
        return api.sendMessage("⚠️ Vui lòng nhập đúng định dạng: .bmi <chiều cao cm> <cân nặng kg>", event.threadID, event.messageID);
    }

    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);
    const roundedBmi = bmi.toFixed(2);

    let status = "",
        advice = "";
    if (bmi < 18.5) {
        status = "Gầy";
        advice = "Bạn nên tăng cân bằng cách ăn đủ chất và luyện tập hợp lý.";
    } else if (bmi < 24.9) {
        status = "Bình thường";
        advice = "Chúc mừng! Hãy duy trì chế độ ăn uống và tập luyện hiện tại.";
    } else if (bmi < 29.9) {
        status = "Thừa cân";
        advice = "Hãy bắt đầu kiểm soát chế độ ăn và luyện tập để giảm cân.";
    } else {
        status = "Béo phì";
        advice = "Bạn nên tham khảo bác sĩ để có kế hoạch giảm cân an toàn.";
    }

    const idealWeight = (22 * heightM * heightM).toFixed(1); // BMI lý tưởng = 22
    const diff = (idealWeight - weightKg).toFixed(1);
    const kcal = Math.round(24 * weightKg * 1.65); // TDEE trung bình

    const userInfo = await api.getUserInfo(event.senderID);
    const name = userInfo[event.senderID]?.name || "Không rõ";

    const result = `📊 𝗞Ế𝗧 𝗤𝗨Ả 𝗕𝗠𝗜 𝗖Ủ𝗔 𝗕Ạ𝗡 📊
  
  👤 Tên: ${name}
  📏 Chiều cao: ${(heightM).toFixed(2)} mét (${heightCm} cm)
  ⚖️ Cân nặng: ${weightKg} kg
  
  📐 Chỉ số BMI: ${roundedBmi}
  ✅ Tình trạng: ${status}
  
  📝 Lời khuyên: ${advice}
  
  ⚖️ Cân nặng lý tưởng: ${idealWeight}kg
  📄 Bạn ${diff > 0 ? "cần tăng" : "cần giảm"} khoảng ${Math.abs(diff)}kg để đạt cân nặng lý tưởng.
  
  🔥 Nhu cầu calo hàng ngày: ~${kcal} kcal
  
  📌 Lưu ý: Đây chỉ là ước tính, hãy tham khảo ý kiến chuyên gia dinh dưỡng hoặc bác sĩ để có kết quả chính xác nhất.`;

    api.sendMessage(result, event.threadID, event.messageID);
};
