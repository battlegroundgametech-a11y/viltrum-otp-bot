const {
  getUpdates,
  deleteWebhook,
  getMe
} = require("./telegramClient");

const { handleMessage } = require("../handlers/messageHandler");

let offset = 0;

async function poll() {
  try {
    const updates = await getUpdates(offset);

    if (
      updates.ok &&
      Array.isArray(updates.result)
    ) {
      for (const update of updates.result) {

        offset = update.update_id + 1;

        if (update.message) {
          await handleMessage(update.message);
        }
      }
    }

  } catch (err) {

    console.error(
      "Polling Error:",
      err.message
    );

    await new Promise(resolve =>
      setTimeout(resolve, 3000)
    );
  }

  setImmediate(poll);
}

async function startBot() {

  console.log(
    "Removing old webhook..."
  );

  await deleteWebhook();

  const me = await getMe();

  console.log(
    "Connected as:",
    me.result.username
  );

  console.log(
    "Long polling started."
  );

  poll();
}

module.exports = {
  startBot
};
