// controllers/webhookController.js
const logger = require("firebase-functions/logger");
const axios = require("axios");

async function handleIncomingMessage(data) {
  logger.log("Received request body:", data);
  const changes = data?.entry[0]?.changes[0];

  if (changes && changes.field === "messages") {
    const messageType = changes.value.messages[0].type;

    if (["text", "image", "sticker", "video", "audio"].includes(messageType)) {
      logger.log(`Received ${messageType} message`);
      
      // Send payload to an external webhook URL
      const response = await axios.post(
        "https://whatsapp-api-alg6.onrender.com/api/webhook",
        {
          payload: data,
        }
      );
    } else {
      logger.log("Unsupported message type");
    }
  } else {
    logger.log("No Text Data or Invalid Field");
  }
}

module.exports = {
  handleIncomingMessage,
};
