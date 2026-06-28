const config = require("../config/config");

async function callTelegram(method, body = {}) {
  const response = await fetch(
    `https://api.telegram.org/bot${config.telegram.token}/${method}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    }
  );

  const data = await response.json();

  if (!data.ok) {
    console.error("Telegram API error:", method, data);
  }

  return data;
}

async function sendMessage(chatId, text, replyMarkup) {
  return callTelegram("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    reply_markup: replyMarkup
  });
}

async function getUpdates(offset) {
  return callTelegram("getUpdates", {
    offset,
    timeout: 30,
    allowed_updates: ["message"]
  });
}

async function deleteWebhook() {
  return callTelegram("deleteWebhook", {
    drop_pending_updates: true
  });
}

async function getMe() {
  return callTelegram("getMe");
}

module.exports = {
  callTelegram,
  sendMessage,
  getUpdates,
  deleteWebhook,
  getMe
};
