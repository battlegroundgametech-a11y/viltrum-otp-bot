const { sendMessage } = require("../telegram/telegramClient");
const { sendSignupOtp } = require("../services/signupService");
const { sendResetOtp } = require("../services/resetService");

const resetSessions = new Map();

function getStartPayload(text) {
  if (!text.startsWith("/start")) {
    return "";
  }

  return text.replace("/start", "").trim().toLowerCase();
}

async function handleMessage(message) {
  const chatId = message.chat?.id;

  if (!chatId) return;

  const text = String(message.text || "").trim();

  if (!text) return;

  const payload = getStartPayload(text);

  // Signup
  if (
    text === "/start" ||
    payload === "signup"
  ) {
    resetSessions.delete(chatId);

    await sendSignupOtp(message);

    return;
  }

  // Reset via deep link
  if (
    payload === "reset" ||
    text === "/reset"
  ) {
    resetSessions.set(chatId, true);

    await sendMessage(
      chatId,
      "Please send your Telegram username without @."
    );

    return;
  }

  // Waiting for username
  if (resetSessions.has(chatId)) {
    resetSessions.delete(chatId);

    await sendResetOtp(chatId, text);

    return;
  }

  await sendMessage(
    chatId,
    "Welcome to Viltrum.\n\nChoose one:\n\n/start - Signup OTP\n/reset - Password Reset OTP"
  );
}

module.exports = {
  handleMessage
};
