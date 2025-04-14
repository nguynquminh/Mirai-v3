module.exports.config = {
  name: "money",
  version: "1.1.1",
  hasPermssion: 0,
  credits: "Quất",
  description: "Kiểm tra và chỉnh sửa tiền người dùng với nhiều tùy chọn",
  commandCategory: "Người dùng",
  usages: "[ add | sub | mul | div | inf | zero | set | pow | sqrt | add% | sub% | pay ] [số tiền]",
  cooldowns: 0,
  usePrefix: false,
};

const axios = require("axios");
const moment = require("moment-timezone");

module.exports.run = async function({
  Currencies,
  api,
  event,
  args,
  Users,
  permssion
}) {
  const {
      threadID,
      messageID,
      senderID,
      mentions,
      type,
      messageReply
  } = event;

  // Xác định đối tượng
  let targetID = senderID;
  if (type === 'message_reply') targetID = messageReply.senderID;
  else if (Object.keys(mentions).length > 0) targetID = Object.keys(mentions)[0];

  const name = await Users.getNameUser(targetID);
  const linkGif = "https://files.catbox.moe/shxujt.gif";
  const image = await axios.get(linkGif, {
      responseType: "stream"
  }).then(res => res.data);
  const time = moment.tz("Asia/Ho_Chi_Minh").format('HH:mm:ss - DD/MM/YYYY');

  const targetData = await Currencies.getData(targetID);
  const senderData = await Currencies.getData(senderID);
  const money = targetData.money || 0;
  const value = parseFloat(args[1]);

  const noPerm = () => api.sendMessage("🚫 Bạn không đủ quyền để thực hiện hành động này!", threadID, messageID);

  try {
      switch (args[0]) {
          case "add":
              if (permssion < 2) return noPerm();
              await Currencies.increaseMoney(targetID, value);
              break;

          case "sub":
              if (permssion < 2) return noPerm();
              await Currencies.increaseMoney(targetID, -value);
              break;

          case "mul":
              if (permssion < 2) return noPerm();
              await Currencies.increaseMoney(targetID, parseInt(money * (value - 1)));
              break;

          case "div":
              if (permssion < 2) return noPerm();
              await Currencies.increaseMoney(targetID, parseInt(-money + (money / value)));
              break;

          case "inf":
              if (permssion < 2) return noPerm();
              await Currencies.increaseMoney(targetID, Infinity);
              break;

          case "zero":
              if (permssion < 2) return noPerm();
              await Currencies.setData(targetID, {
                  id: targetID,
                  money: 0
              });
              break;

          case "set":
              if (permssion < 2) return noPerm();
              await Currencies.setData(targetID, {
                  id: targetID,
                  money: value
              });
              break;

          case "pow":
              if (permssion < 2) return noPerm();
              await Currencies.increaseMoney(targetID, parseInt(Math.pow(money, value) - money));
              break;

          case "sqrt":
              if (permssion < 2) return noPerm();
              await Currencies.increaseMoney(targetID, parseInt(Math.pow(money, 1 / value) - money));
              break;

          case "add%":
              if (permssion < 2) return noPerm();
              await Currencies.increaseMoney(targetID, parseInt((money * value) / 100));
              break;

          case "sub%":
              if (permssion < 2) return noPerm();
              await Currencies.increaseMoney(targetID, parseInt(-(money * value) / 100));
              break;

          case "pay": {
              const bet = args[1] === 'all' ? senderData.money : parseInt(args[1]);
              if (bet > senderData.money || bet <= 0) {
                  return api.sendMessage({
                      body: "⚠️ Số tiền không hợp lệ hoặc bạn không đủ tiền!",
                      attachment: image
                  }, threadID);
              }
              await Currencies.increaseMoney(senderID, -bet);
              await Currencies.increaseMoney(targetID, bet);
              return api.sendMessage({
                  body: `💸 Đã chuyển ${bet}$ cho ${name}`,
                  attachment: image
              }, threadID);
          }

          default:
              return api.sendMessage({
                  body: `💰 ${name} hiện có ${money === Infinity ? 'vô hạn' : money + '$'}
⏰ ${time}`,
                  attachment: image
              }, threadID);
      }

      const newMoney = (await Currencies.getData(targetID)).money;
      return api.sendMessage({
          body: `💸 Money của ${name} hiện tại là ${newMoney}$
⏰ ${time}`,
          attachment: image
      }, threadID);

  } catch (e) {
      console.error(e);
      return api.sendMessage("❌ Đã xảy ra lỗi!", threadID);
  }
};
