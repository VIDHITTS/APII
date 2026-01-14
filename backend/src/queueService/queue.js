const { Queue, Worker } = require("bullmq");
const Redis = require("ioredis");

const connection = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

const syncQueue = new Queue("sync", { connection });

const addSyncJob = async (type, data, options = {}) => {
  return syncQueue.add(type, data, {
    attempts: 3,
    backoff: { type: "exponential", delay: 1000 },
    ...options,
  });
};

const addContactSyncJob = async (contactId, direction = "outbound") => {
  return addSyncJob("contact-sync", { contactId, direction });
};

const addCompanySyncJob = async (companyId, direction = "outbound") => {
  return addSyncJob("company-sync", { companyId, direction });
};

const addPullAllJob = async () => {
  return addSyncJob("pull-all", {}, { jobId: "pull-all-scheduled" });
};

const addPushPendingJob = async () => {
  return addSyncJob("push-pending", {}, { jobId: "push-pending-scheduled" });
};

const schedulePullAll = async (intervalMs = 5 * 60 * 1000) => {
  await syncQueue.add(
    "pull-all",
    {},
    {
      repeat: { every: intervalMs },
      jobId: "pull-all-repeating",
    }
  );
};

const schedulePushPending = async (intervalMs = 2 * 60 * 1000) => {
  await syncQueue.add(
    "push-pending",
    {},
    {
      repeat: { every: intervalMs },
      jobId: "push-pending-repeating",
    }
  );
};

const getQueueStats = async () => {
  const waiting = await syncQueue.getWaitingCount();
  const active = await syncQueue.getActiveCount();
  const completed = await syncQueue.getCompletedCount();
  const failed = await syncQueue.getFailedCount();
  return { waiting, active, completed, failed };
};

const getFailedJobs = async (start = 0, end = 10) => {
  const jobs = await syncQueue.getFailed(start, end);
  return jobs.map((job) => ({
    id: job.id,
    name: job.name,
    data: job.data,
    failedReason: job.failedReason,
    attemptsMade: job.attemptsMade,
    timestamp: job.timestamp,
    finishedOn: job.finishedOn,
  }));
};

const retryFailedJob = async (jobId) => {
  const job = await syncQueue.getJob(jobId);
  if (!job) throw new Error("Job not found");
  await job.retry();
  return { message: "Job requeued", jobId };
};

const clearFailedJobs = async () => {
  await syncQueue.clean(0, 0, "failed");
  return { message: "Failed jobs cleared" };
};

module.exports = {
  syncQueue,
  connection,
  addSyncJob,
  addContactSyncJob,
  addCompanySyncJob,
  addPullAllJob,
  addPushPendingJob,
  schedulePullAll,
  schedulePushPending,
  getQueueStats,
  getFailedJobs,
  retryFailedJob,
  clearFailedJobs,
};
