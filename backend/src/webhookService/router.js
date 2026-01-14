const express = require("express");
const router = express.Router();
const { processWebhookEvents } = require("./handler");

router.post("/hubspot", async (req, res) => {
  try {
    const events = Array.isArray(req.body) ? req.body : [req.body];
    const results = await processWebhookEvents(events);
    res.status(200).json({ received: true, processed: results.length });
  } catch (error) {
    console.error("Webhook error:", error.message);
    res.status(200).json({ received: true, error: error.message });
  }
});

router.get("/hubspot", (req, res) => {
  res.json({ status: "Webhook endpoint active" });
});

module.exports = router;
