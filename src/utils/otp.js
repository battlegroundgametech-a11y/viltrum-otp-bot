const crypto = require("crypto");

function generateSignupOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function generateResetOtp() {
  return String(crypto.randomInt(100000, 1000000));
}

function hashOtp(value, salt) {
  return crypto
    .pbkdf2Sync(value, salt, 100000, 64, "sha512")
    .toString("hex");
}

function generateSalt() {
  return crypto.randomBytes(16).toString("hex");
}

function expiry(seconds) {
  return new Date(Date.now() + seconds * 1000).toISOString();
}

module.exports = {
  generateSignupOtp,
  generateResetOtp,
  hashOtp,
  generateSalt,
  expiry
};
