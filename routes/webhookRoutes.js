// routes/webhookRoutes.js
const express = require("express");
const router = express.Router();
const { handleIncomingMessage } = require("../controllers/webhookController");


router.get("/", (req, res) => {
  res.send("Hello from the webhook route!");
});

router.post("/", async (req, res) => {
  try {
    const data = req.body;

    if (data) {
      // Call the controller function
      await handleIncomingMessage(data);

      // Respond to the client
      res.sendStatus(200);
    } else {
      res.sendStatus(403);
    }
  } catch (error) {
    // Handle errors
    logger.error(error);
    res.sendStatus(500);
  }
});

module.exports = router;
