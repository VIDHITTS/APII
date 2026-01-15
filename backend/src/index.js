require("dotenv").config();
const mongoose = require("mongoose");
const { createApp } = require("./app");
const { createWorker } = require("./queueService/worker");
const { schedulePullAll, schedulePushPending } = require("./queueService/queue");

const app = createApp();

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

  schedulePullAll();
  schedulePushPending();
  console.log("Periodic sync jobs scheduled");

  app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
  });
});

module.exports = app;
