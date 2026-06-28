const supabase = require("../database/supabase");
const config = require("../config/config");
const { sendMessage } = require("../telegram/telegramClient");
const { generateSignupOtp, expiry } = require("../utils/otp");

async function sendSignupOtp(message) {
  const chatId = message.chat?.id;

  if (!chatId) {
    return;
  }

  const telegramId = String(message.from?.id || chatId);

  const telegramUsername = String(message.from?.username || "")
    .toLowerCase()
    .replace("@", "");

  const otp = generateSignupOtp();
  const expiresAt = expiry(config.otp.expirySeconds);

  const { error } = await supabase.from("signup_otps").insert({
    telegram_id: telegramId,
    telegram_username: telegramUsername,
    otp,
    used: false,
    expires_at: expiresAt
  });

  if (error) {
    console.log("OTP SUPABASE ERROR:", error.message);
    await sendMessage(chatId, `Database error: ${error.message}`);
    return;
  }

  await sendMessage(
    chatId,
    `🔐 <b>Viltrum Signup OTP</b>\n\n` +
      `Your OTP is:\n\n` +
      `<code>${otp}</code>\n\n` +
      `This OTP is valid for <b>1 minute</b>.`,
    {
      inline_keyboard: [
        [
          {
            text: "Return To Signup",
            url: `${config.site.url}/signup`
          }
        ]
      ]
    }
  );
}

module.exports = {
  sendSignupOtp
};
