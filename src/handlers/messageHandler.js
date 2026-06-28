const { sendMessage } = require("../telegram/telegramClient");
const { sendSignupOtp } = require("../services/signupService");
const { sendResetOtp } = require("../services/resetService");

const resetSessions = new Map();

async function handleMessage(message) {
  const chatId = message.chat?.id;

  if (!chatId) return;

  const text = String(message.text || "").trim();

  if (!text) return;

  if (text === "/start") {
    resetSessions.delete(chatId);
    await sendSignupOtp(message);
    return;
  }

  if (text === "/reset") {
    resetSessions.set(chatId, true);

    await sendMessage(
      chatId,
      "Please send your Telegram username without @."
    );

    return;
  }

  if (resetSessions.has(chatId)) {
    resetSessions.delete(chatId);

    await sendResetOtp(chatId, text);

    return;
  }

  await sendMessage(
    chatId,
    "Use /start for Signup OTP\nUse /reset for Password Reset OTP"
  );
}

module.exports = {
  handleMessage
};
