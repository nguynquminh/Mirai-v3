module.exports.config = {
    name: "weather",
    version: "1.2.0",
    hasPermssion: 0,
    credits: "qm",
    description: "Xem thời tiết trong 5 ngày",
    commandCategory: "Công Cụ",
    usages: "[địa điểm]",
    cooldowns: 10,
    dependencies: {
        "axios": "",
        "moment-timezone": "",
        "canvas": "",
        "fs-extra": ""
    }
};

module.exports.run = async function({
    api,
    event,
    args
}) {
    try {
        const axios = require("axios");
        const moment = require("moment-timezone");
        const {
            createCanvas,
            loadImage,
            registerFont
        } = require("canvas");
        const fs = require("fs-extra");
        const path = require("path");

        const apikey = "d7e795ae6a0d44aaa8abb1a0a7ac19e4";
        const area = args.join(" ");

        if (!area) return api.sendMessage("⚠️ Vui lòng nhập địa điểm cần xem thời tiết!", event.threadID, event.messageID);

        // Tải font và background
        const assets = {
            bg: {
                url: "https://i.imgur.com/1Rx88Te.jpg",
                path: path.join(__dirname, 'cache', 'bgweather.jpg')
            },
            font: {
                url: "https://github.com/JetBrains/JetBrainsMono/raw/master/fonts/ttf/JetBrainsMono-Bold.ttf",
                path: path.join(__dirname, 'cache', 'JetBrainsMono-Bold.ttf')
            }
        };

        await Promise.all(Object.values(assets).map(async asset => {
            if (!fs.existsSync(asset.path)) {
                const data = (await axios.get(asset.url, {
                    responseType: "arraybuffer"
                })).data;
                fs.writeFileSync(asset.path, Buffer.from(data));
            }
        }));

        // Lấy thông tin địa điểm
        const locationResponse = await axios.get(`https://api.accuweather.com/locations/v1/cities/search.json?q=${encodeURIComponent(area)}&apikey=${apikey}&language=vi-vn`);
        if (locationResponse.data.length === 0) {
            return api.sendMessage("❌ Không tìm thấy địa điểm này!", event.threadID, event.messageID);
        }

        const locationData = locationResponse.data[0];
        const areaKey = locationData.Key;

        // Lấy dữ liệu thời tiết
        const weatherResponse = await axios.get(`http://api.accuweather.com/forecasts/v1/daily/5day/${areaKey}?apikey=${apikey}&details=true&language=vi`);
        const weatherData = weatherResponse.data;

        // Hàm chuyển đổi
        const convertFtoC = (F) => Math.floor((F - 32) / 1.8);
        const formatTime = (time) => moment(time).tz("Asia/Ho_Chi_Minh").format("HH[h]mm[p]");

        // Tạo thông báo
        const today = weatherData.DailyForecasts[0];
        let msg = `🌤️ Thời tiết tại ${area}\n` +
            `📌 ${weatherData.Headline.Text}\n\n` +
            `🌡 Nhiệt độ: ${convertFtoC(today.Temperature.Minimum.Value)}°C - ${convertFtoC(today.Temperature.Maximum.Value)}°C\n` +
            `🌡 Cảm nhận: ${convertFtoC(today.RealFeelTemperature.Minimum.Value)}°C - ${convertFtoC(today.RealFeelTemperature.Maximum.Value)}°C\n` +
            `🌅 Mặt trời: ${formatTime(today.Sun.Rise)} - ${formatTime(today.Sun.Set)}\n` +
            `🌙 Mặt trăng: ${formatTime(today.Moon.Rise)} - ${formatTime(today.Moon.Set)}\n` +
            `☀️ Ban ngày: ${today.Day.LongPhrase}\n` +
            `🌙 Ban đêm: ${today.Night.LongPhrase}\n` +
            `🌧️ Lượng mưa: ${today.Day.RainProbability}%`;

        // Tạo hình ảnh dự báo
        registerFont(assets.font.path, {
            family: "JetBrainsMono"
        });
        const bg = await loadImage(assets.bg.path);
        const canvas = createCanvas(bg.width, bg.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

        let xPos = 100;
        const forecastDays = weatherData.DailyForecasts.slice(0, 5);

        // Sử dụng biểu tượng mặc định nếu không tải được SVG
        const defaultIcon = await loadImage('https://i.imgur.com/7W2YJpL.png'); // Ảnh mặc định

        for (const day of forecastDays) {
            try {
                const iconUrl = `https://developer.accuweather.com/sites/default/files/${String(day.Day.Icon).padStart(2, '0')}-s.png`;
                let icon;

                try {
                    const iconRes = await axios.get(iconUrl, {
                        responseType: "arraybuffer"
                    });
                    icon = await loadImage(Buffer.from(iconRes.data));
                } catch {
                    icon = defaultIcon; // Sử dụng ảnh mặc định nếu lỗi
                }

                ctx.drawImage(icon, xPos, 210, 80, 80);

                ctx.fillStyle = "#ffffff";
                ctx.font = "22px JetBrainsMono";

                // Nhiệt độ cao nhất
                ctx.fillText(`${convertFtoC(day.Temperature.Maximum.Value)}°C`, xPos, 366);

                // Nhiệt độ thấp nhất
                ctx.fillText(`${convertFtoC(day.Temperature.Minimum.Value)}°C`, xPos, 445);

                // Ngày
                const date = moment(day.Date).format("DD/MM");
                ctx.fillText(date, xPos, 140);

                xPos += 135;
            } catch (e) {
                console.error("Error drawing day:", e);
                continue;
            }
        }

        // Lưu và gửi ảnh
        const outputPath = path.join(__dirname, 'cache', 'weather_result.jpg');
        const out = fs.createWriteStream(outputPath);
        const stream = canvas.createJPEGStream({
            quality: 0.95
        });
        stream.pipe(out);

        await new Promise((resolve, reject) => {
            out.on('finish', resolve);
            out.on('error', reject);
        });

        return api.sendMessage({
            body: msg,
            attachment: fs.createReadStream(outputPath)
        }, event.threadID, () => fs.unlinkSync(outputPath), event.messageID);

    } catch (error) {
        console.error("Weather Command Error:", error);
        return api.sendMessage("⚠️ Đã xảy ra lỗi khi lấy thông tin thời tiết. Vui lòng thử lại sau!", event.threadID, event.messageID);
    }
};
