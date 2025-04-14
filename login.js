const fs = require("fs-extra");
const readline = require("readline");
const totp = require("totp-generator");
const login = require("helyt");
login({email: "123@gmail.com", password: "123"}, (err, api) => {
    if(err) return console.error(err);
    const json = JSON.stringify(api.getAppState());
    fs.writeFileSync(`./${config.APPSTATEPATH}`, json);
    console.log("Đã ghi xong appstate!");
    process.exit(0);
});
