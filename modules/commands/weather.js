module.exports.config = {
    name: "weather",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "D-Jukie convert từ Goat",
    description: "Xem thời tiết trong 5 ngày",
    commandCategory: "Công Cụ",
    usages: "[location]",
    cooldowns: 5
};
module.exports.run = async function ({
    api,
    event,
    args,
    utils
}) {
    const axios = require("axios");
    const apikey = "d7e795ae6a0d44aaa8abb1a0a7ac19e4"
    const moment = require("moment-timezone");
    const Canvas = require("canvas");
    const fs = require("fs-extra");
    const area = args.join(" ");
    if (!area) return api.sendMessage(`Vui lòng nhập địa điểm!`, event.threadID, event.messageID)
    let areaKey, location = {},
        dataWeather;
    if (!fs.existsSync(__dirname + '/cache/bgweather.jpg')) {
        let getbg = (await axios.get(`https://i.imgur.com/1Rx88Te.jpg`, {
            responseType: "arraybuffer"
        })).data;
        fs.writeFileSync(__dirname + "/cache/bgweather.jpg", Buffer.from(getbg, "utf-8"));
    }
    if (!fs.existsSync(__dirname + "/cache/JetBrainsMono-Bold.ttf")) {
        let getfont = (await axios.get("https://drive.google.com/u/0/uc?id=1eWoy7vapDavOCHSkPQlTPtP-2kTGZrJW&export=download", {
            responseType: "arraybuffer"
        })).data;
        fs.writeFileSync(__dirname + "/cache/JetBrainsMono-Bold.ttf", Buffer.from(getfont, "utf-8"));
    };
    try {
        const response = (await axios.get(`https://api.accuweather.com/locations/v1/cities/search.json?q=${encodeURIComponent(area)}&apikey=${apikey}&language=vi-vn`)).data;
        if (response.length == 0) return api.sendMessage(`Không tìm thấy địa điểm này!`, event.threadID, event.messageID)
        const data = response[0];
        areaKey = data.Key;
        location = { latitude: data.GeoPosition.Latitude, longitude: data.GeoPosition.Longitude };
    } catch (err) {
        return api.sendMessage(`Đã có lỗi xảy ra!!`, event.threadID, event.messageID)
    }
    try {
        dataWeather = (await axios.get(`http://api.accuweather.com/forecasts/v1/daily/10day/${areaKey}?apikey=${apikey}&details=true&language=vi`)).data;
    } catch (err) {
        return api.sendMessage(`Đã có lỗi xảy ra!!`, event.threadID, event.messageID)
    }

    function convertFtoC(F) { return Math.floor((F - 32) / 1.8); }
    function formatHours(hours) { return moment(hours).tz("Asia/Ho_Chi_Minh").format("HH[h]mm[p]"); }
    const dataWeatherDaily = dataWeather.DailyForecasts;
    const dataWeatherToday = dataWeatherDaily[0];
    let msg = `Thời tiết hôm nay:\n${dataWeather.Headline.Text}` +
        `\n🌡 Nhiệt độ thấp nhất - cao nhất: ${convertFtoC(dataWeatherToday.Temperature.Minimum.Value)}°C - ${convertFtoC(dataWeatherToday.Temperature.Maximum.Value)}°C` +
        `\n🌡 Nhiệt độ cảm nhận được: ${convertFtoC(dataWeatherToday.RealFeelTemperature.Minimum.Value)}°C - ${convertFtoC(dataWeatherToday.RealFeelTemperature.Maximum.Value)}°C` +
        `\n🌅 Mặt trời mọc: ${formatHours(dataWeatherToday.Sun.Rise)}` +
        `\n🌄 Mặt trời lặn ${formatHours(dataWeatherToday.Sun.Set)}` +
        `\n🌃 Mặt trăng mọc: ${formatHours(dataWeatherToday.Moon.Rise)}` +
        `\n🏙️ Mặt trăng lặn: ${formatHours(dataWeatherToday.Moon.Set)}` +
        `\n🌞 Ban ngày: ${dataWeatherToday.Day.LongPhrase}` +
        `\n🌙 Ban đêm: ${dataWeatherToday.Night.LongPhrase}` +
        `\n🌧️ Lượng mưa: ${dataWeatherToday.Day.RainProbability}%` +
        `\n📍Địa điểm: ${area}`;
    Canvas.registerFont(__dirname + "/cache/JetBrainsMono-Bold.ttf", { family: "JetBrainsMono-Bold" });
    const bg = await Canvas.loadImage(__dirname + "/cache/bgweather.jpg");
    const {
        width,
        height
    } = bg;
    const canvas = Canvas.createCanvas(width, height);
    const ctx = canvas.getContext(`2d`);
    ctx.drawImage(bg, 0, 0, width, height);
    let X = 100;
    ctx.fillStyle = "#ffffff";
    const data = dataWeather.DailyForecasts.slice(0, 7);
    for (let item of data) {
        const icon = await Canvas.loadImage("http://vortex.accuweather.com/adc2010/images/slate/icons/" + item.Day.Icon + ".svg");
        ctx.drawImage(icon, X, 210, 80, 80);
        ctx.font = "22px JetBrainsMono-Bold";
        const maxC = `${convertFtoC(item.Temperature.Maximum.Value)}°C `;
        ctx.fillText(maxC, X, 366);
        ctx.font = "22px JetBrainsMono-Bold";
        const minC = String(`${convertFtoC(item.Temperature.Minimum.Value)}°C`);
        const day = moment(item.Date).format("DD");
        ctx.fillText(minC, X, 445);
        ctx.fillText(day, X + 20, 140);
        X += 135;
    }
    const pathSaveImg = __dirname + "/cache/weather.jpg";
    fs.writeFileSync(pathSaveImg, canvas.toBuffer());
    return api.sendMessage({
            body: `${msg}`,
            attachment: fs.createReadStream(pathSaveImg)
        }, event.threadID,
        () => fs.unlinkSync(pathSaveImg), event.messageID)

}