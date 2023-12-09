const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const functions = require("firebase-functions");
const { setGlobalOptions } = require("firebase-functions/v2");
const axios = require("axios");
const express = require("express");
const cors = require("cors");

// Set global options for Firebase Functions
setGlobalOptions({
  maxInstances: 5,
});

// Create an Express app
const app = express();

// Enable CORS for the app
app.use(cors());

// Test route for verification
app.get("/test", (req, res) => {
  res.json({
    message: "TESTINGG webhookkkk",
  });
});

// Main route for WhatsApp webhook
app.get("/", (req, res) => {
  const verifyToken = "reverr_token";
  const mode = req.query["hub.mode"];
  const challenge = req.query["hub.challenge"];
  const token = req.query["hub.verify_token"];

  // Handle subscription verification
  if (mode === "subscribe" && token === verifyToken) {
    res.send(challenge);
  } else {
    res.sendStatus(403); // Forbidden if verification fails
  }
});

// Handle incoming messages
app.post("/", async (req, res) => {
  try {
    const data = req.body;

    if (data) {
      logger.log("Received request body:", data);
      const changes = data?.entry[0]?.changes[0];

      // Check message type and take appropriate actions
      if (changes && changes.field === "messages") {
        const messageType = changes.value.messages[0].type;

        if (messageType === "text" || messageType === "image" || messageType === "sticker" || messageType === "video" || messageType === "audio") {
          logger.log(`Received ${messageType} message`);
          
          // Send payload to an external webhook URL
          const response = await axios.post(
            "https://whatsapp-api-alg6.onrender.com/api/webhook",
            {
              payload: data,
            }
          );

          res.sendStatus(200);
        } else {
          logger.log("Unsupported message type");
          res.sendStatus(200);
        }
      } else {
        logger.log("No Text Data or Invalid Field");
        res.sendStatus(200);
      }
    } else {
      logger.log("No Valid Data");
      res.sendStatus(403);
    }
  } catch (error) {
    logger.error(error);
    res.sendStatus(500);
  }
});

// Export Firebase Cloud Functions
exports.webhook = onRequest(app);

exports.helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", { structuredData: true });
  response.json({
    message: "HIII",
  });
});
