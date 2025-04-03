module.exports.config = {
    name: "money",
    version: "1.1.1",
    hasPermssion: 0,
    credits: "Quất",
    description: "vừa setmoney vừa check money?",
    commandCategory: "Người dùng",
    usages: "!money [ + , - , * , / , ++ , -- , +- , +% , -% ]",
    cooldowns: 0,
    usePrefix: false,
  };
  
  module.exports.run = async function ({ Currencies, api, event, args, Users,permssion }) {
    const axios = require("axios")
    const { threadID, messageID, senderID, mentions, type, messageReply } = event;
    let targetID = senderID;
    if (type == 'message_reply') {
    targetID = messageReply.senderID;
    } else if (Object.keys(mentions).length > 0) {
    targetID = Object.keys(mentions)[0];
    }
    const name = (await Users.getNameUser(targetID))
    const i = (url) => axios.get(url, { responseType: "stream", }).then((r) => r.data);
    const link = "https://files.catbox.moe/shxujt.gif";
    const moment = require("moment-timezone");
    const time = moment.tz("Asia/Ho_Chi_Minh").format('HH:mm:ss - DD/MM/YYYY');
    const money = (await Currencies.getData(targetID)).money;
    const mon = args[1]
    try { switch (args[0]) {
    case "+": {
    if(permssion < 2) return api.sendMessage("Bạn không đủ quyền",event.threadID)
    await Currencies.increaseMoney(targetID,parseInt(mon))
    return api.sendMessage({body:`💸 Money của ${name} được cộng thêm ${mon}$\n💸 Hiện còn ${money + parseInt(mon)}$\n⏰ ${time}`,attachment:await i(link)},event.threadID)}
       
    case "-": {
    if(permssion < 2) return api.sendMessage("Bạn không đủ quyền",event.threadID)
    await Currencies.increaseMoney(targetID,parseInt(-mon))
    return api.sendMessage({body:`💸 Money của ${name} bị trừ đi ${mon}$\n💸 Hiện còn ${money - mon}$\n⏰ ${time}`,attachment:await i(link)},event.threadID)}
       
    case "*": {
    if(permssion < 2) return api.sendMessage("Bạn không đủ quyền",event.threadID)
    await Currencies.increaseMoney(targetID, parseInt(money * (args[1] - 1)))
    return api.sendMessage({body:`💸 Money của ${name} được nhân lên ${mon} lần\n💸 Hiện còn ${money * mon}$\n⏰ ${time}`,attachment:await i(link)},event.threadID)}
       
    case "/": {
    if(permssion < 2) return api.sendMessage("Bạn không đủ quyền",event.threadID)
    await Currencies.increaseMoney(targetID, parseInt(-money + (money / mon)))
    return api.sendMessage({body:`💸 Money của ${name} bị chia đi ${args[1]} lần\n💸 Hiện còn ${money / mon}$\n⏰ ${time}`,attachment:await i(link)},event.threadID)}
       
    case "++": {
    if(permssion < 2) return api.sendMessage("Bạn không đủ quyền",event.threadID)
    await Currencies.increaseMoney(targetID, Infinity);
    return api.sendMessage({body:`💸 Money của ${name} được thay đổi thành vô hạn\n💸 Hiện còn Infinity$\n⏰ ${time}`,attachment:await i(link)},event.threadID)}
       
    case "--": {
    if(permssion < 2) return api.sendMessage("Bạn không đủ quyền",event.threadID)
    await Currencies.decreaseMoney(targetID, parseInt(money))
    return api.sendMessage({body:`💸 Money của ${name} bị reset\n💸 Hiện còn 0$\n⏰ ${time}`,attachment: await i(link)},event.threadID)}
       
    case "+-": {
    if(permssion < 2) return api.sendMessage("Bạn không đủ quyền",event.threadID)
    await Currencies.decreaseMoney(targetID, parseInt(money))
    await Currencies.increaseMoney(targetID, parseInt(mon))
    return api.sendMessage({body:`💸 Money của ${name} được thay đổi thành ${mon}$\n💸 Money hiện tại ${mon}$\n⏰ ${time}`,attachment:await i(link)},event.threadID)}
       
    case "^": {
    if(permssion < 2) return api.sendMessage("Bạn không đủ quyền",event.threadID)
    await Currencies.increaseMoney(targetID, parseInt(-money + Math.pow(money, mon)))
    return api.sendMessage({body:`💸 Money của ${name} được lũy thừa lên ${mon} lần\n💸 Money hiện tại ${Math.pow(money, mon)}$\n⏰ ${time}`,attachment:await i(link)},event.threadID)}
  
    case "√": {
    if(permssion < 2) return api.sendMessage("Bạn không đủ quyền",event.threadID)
    await Currencies.increaseMoney(targetID, parseInt(-money + Math.pow(money, 1/args[1])))
    return api.sendMessage({body:`💸 Money của ${name} được căn bậc ${args[1]}\n💸 Hiện còn ${Math.pow(money, 1/args[1])}$\n⏰ ${time}`,attachment:await i(link)},event.threadID)}
  
    case "+%": {
    if(permssion < 2) return api.sendMessage("Bạn không đủ quyền",event.threadID)
    await Currencies.increaseMoney(targetID, parseInt(money / (100 / args[1])))
    return api.sendMessage({body:`💸 Money của ${name} được cộng thêm ${args[1]}%\n💸 Hiện còn ${money + (money / (100 / args[1]))}$\n⏰ ${time}`,attachment:await i(link)},event.threadID)}
  
    case "-%": {
    if(permssion < 2) return api.sendMessage("Bạn không đủ quyền",event.threadID)
    await Currencies.increaseMoney(targetID, parseInt(-(money / (100 / args[1]))))
    return api.sendMessage({body:`💸 Money của ${name} bị trừ đi ${args[1]}%\n💸 Hiện còn ${money - (money / (100 / args[1]))}$\n⏰ ${time}`,attachment:await i(link)},event.threadID)}
        
    case "pay": {
    const money2 = (await Currencies.getData(event.senderID)).money;
    var bet = args[1] === 'all' ? money2 : args[1]
    if (money < 1) return api.sendMessage({body:"Bạn có ít hơn 1$ hoặc bạn số tiền chuyển lớn hơn số dư của bạn",attachment: await i(link)},event.threadID)
    await Currencies.increaseMoney(event.senderID, parseInt(-bet))
    await Currencies.increaseMoney(targetID, parseInt(bet))
   return api.sendMessage(`Đã chuyển cho ${name} ${bet}$`,event.threadID)}
  } 
        } catch(e) {console.log(e)}
    if (money === Infinity) return api.sendMessage(`${name} có vô hạn tiền`,event.threadID)
    if (money === null) return api.sendMessage(`${name} có 0$`,event.threadID)
    if (!args[0] || !args[1]) return api.sendMessage(`${name} có ${money}$`,event.threadID)
  }