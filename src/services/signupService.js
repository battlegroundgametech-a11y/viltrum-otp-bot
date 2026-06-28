const supabase = require("../database/supabase");
const config = require("../config/config");
const { sendMessage } = require("../telegram/telegramClient");
const {
  generateSignupOtp,
  expiry
} = require("../utils/otp");

async function sendSignupOtp(message) {
  const chatId = message.chat.id;

  const telegramId = String(message.from.id);

  const telegramUsername = String(
    message.from.username || ""
  )
    .replace("@", "")
    .toLowerCase();

  const otp = generateSignupOtp();

  const expiresAt = expiry(config.otp.expirySeconds);

  const { error } = await supabase
    .from("signup_otps")
    .insert({
      telegram_id: telegramId,
      telegram_username: telegramUsername,
      otp,
      used: false,
      expires_at: expiresAt
    });

  if (error) {
    console.error(error);

    await sendMessage(
      chatId,
      `Database error:\n${error.message}`
    );

    return;
  }

  await sendMessage(
    chatId,
    `🔐 <b>Viltrum Signup OTP</b>

Your OTP is:

<code>${otp}</code>

Valid for <b>1 minute</b>.`,
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
