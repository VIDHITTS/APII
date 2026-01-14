const express = require("express");
const queue = require("./queue");

const router = express.Router();

router.get("/stats", async (req, res) => {
  try {
    const stats = await queue.getQueueStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/pull-all", async (req, res) => {
  try {
    const job = await queue.addPullAllJob();
    res.json({ message: "Pull job queued", jobId: job.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/push-pending", async (req, res) => {
  try {
    const job = await queue.addPushPendingJob();
    res.json({ message: "Push job queued", jobId: job.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/schedule/pull", async (req, res) => {
  try {
    const interval = parseInt(req.query.interval) || 5 * 60 * 1000;
    await queue.schedulePullAll(interval);
    res.json({ message: `Pull scheduled every ${interval / 1000}s` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/schedule/push", async (req, res) => {
  try {
    const interval = parseInt(req.query.interval) || 2 * 60 * 1000;
    await queue.schedulePushPending(interval);
    res.json({ message: `Push scheduled every ${interval / 1000}s` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/contact/:id", async (req, res) => {
  try {
    const direction = req.query.direction || "outbound";
    const job = await queue.addContactSyncJob(req.params.id, direction);
    res.json({ message: "Contact sync job queued", jobId: job.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/company/:id", async (req, res) => {
  try {
    const direction = req.query.direction || "outbound";
    const job = await queue.addCompanySyncJob(req.params.id, direction);
    res.json({ message: "Company sync job queued", jobId: job.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get failed jobs
router.get("/failed", async (req, res) => {
  try {
    const start = parseInt(req.query.start) || 0;
    const end = parseInt(req.query.end) || 10;
    const jobs = await queue.getFailedJobs(start, end);
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Retry a failed job
router.post("/failed/:jobId/retry", async (req, res) => {
  try {
    const result = await queue.retryFailedJob(req.params.jobId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear all failed jobs
router.delete("/failed", async (req, res) => {
  try {
    const result = await queue.clearFailedJobs();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
