const supabase = require("../database/supabase");
const config = require("../config/config");
const { sendMessage } = require("../telegram/telegramClient");
const {
  generateResetOtp,
  hashOtp,
  generateSalt,
  expiry
} = require("../utils/otp");

function cleanUsername(value) {
  return String(value || "")
    .replace("@", "")
    .trim()
    .toLowerCase();
}

async function sendResetOtp(chatId, telegramUsername) {
  const username = cleanUsername(telegramUsername);

  if (!username) {
    await sendMessage(chatId, "Telegram username is required.");
    return;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("telegram_id, telegram_username, password_hash, password_salt")
    .eq("telegram_username", username)
    .single();

  if (
    !profile ||
    !profile.telegram_id ||
    !profile.password_hash ||
    !profile.password_salt
  ) {
    await sendMessage(chatId, "Account not found.");
    return;
  }

  const cooldownTime = new Date(
    Date.now() - config.otp.cooldownSeconds * 1000
  ).toISOString();

  const { data: recentOtp } = await supabase
    .from("password_reset_otps")
    .select("id, created_at")
    .eq("telegram_username", username)
    .eq("used", false)
    .gt("created_at", cooldownTime)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (recentOtp) {
    await sendMessage(
      chatId,
      "Please wait 60 seconds before requesting another OTP."
    );
    return;
  }

  const otp = generateResetOtp();
  const otpSalt = generateSalt();
  const otpHash = hashOtp(otp, otpSalt);
  const expiresAt = expiry(config.otp.expirySeconds);

  const { error } = await supabase.from("password_reset_otps").insert({
    telegram_id: profile.telegram_id,
    telegram_username: username,
    otp_hash: otpHash,
    otp_salt: otpSalt,
    used: false,
    expires_at: expiresAt
  });

  if (error) {
    await sendMessage(chatId, `Database error: ${error.message}`);
    return;
  }

  await sendMessage(
    profile.telegram_id,
    `🔐 <b>Viltrum Password Reset OTP</b>\n\n` +
      `Your reset OTP is:\n\n` +
      `<code>${otp}</code>\n\n` +
      `This OTP is valid for <b>1 minute</b>.`
  );

  await sendMessage(
    chatId,
    "✅ Reset OTP sent to your Telegram bot chat. Return to Viltrum and enter the OTP."
  );
}

module.exports = {
  sendResetOtp,
  cleanUsername
};
