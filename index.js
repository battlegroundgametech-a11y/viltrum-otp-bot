require("dotenv").config();

const { startBot } = require("./src/telegram/bot");

async function main() {
  console.log("=================================");
  console.log("   Viltrum OTP Bot Starting");
  console.log("=================================");

  try {
    await startBot();
  } catch (err) {
    console.error("Fatal error:", err);
    process.exit(1);
  }
}

main();
