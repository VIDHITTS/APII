require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const contactRouter = require("./contactService/router");
const companyRouter = require("./companyService/router");
const syncRouter = require("./syncService/router");
const webhookRouter = require("./webhookService/router");
const conflictRouter = require("./conflictService/router");
const logRouter = require("./logService/router");
const queueRouter = require("./queueService/router");
const { createWorker } = require("./queueService/worker");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    mongodb:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

app.use("/api/contacts", contactRouter);
app.use("/api/companies", companyRouter);
app.use("/api/sync", syncRouter);
app.use("/api/webhooks", webhookRouter);
app.use("/api/conflicts", conflictRouter);
app.use("/api/logs", logRouter);
app.use("/api/queue", queueRouter);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  createWorker();
  console.log("BullMQ worker started");
  
  app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
  });
});

module.exports = app;
