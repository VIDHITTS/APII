const express = require("express");
const cors = require("cors");

const contactRouter = require("./contactService/router");
const companyRouter = require("./companyService/router");
const syncRouter = require("./syncService/router");
const webhookRouter = require("./webhookService/router");
const conflictRouter = require("./conflictService/router");
const logRouter = require("./logService/router");
const queueRouter = require("./queueService/router");
const { apiLimiter, webhookLimiter } = require("./middleware/rateLimiter");

const createApp = () => {
    const app = express();

    app.use(cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        credentials: true
    }));
    app.use(express.json());

    app.get("/health", (req, res) => {
        res.json({
            status: "ok",
            timestamp: new Date().toISOString(),
        });
    });

    app.use("/api/contacts", apiLimiter, contactRouter);
    app.use("/api/companies", apiLimiter, companyRouter);
    app.use("/api/sync", apiLimiter, syncRouter);
    app.use("/api/webhooks", webhookLimiter, webhookRouter);
    app.use("/api/conflicts", apiLimiter, conflictRouter);
    app.use("/api/logs", apiLimiter, logRouter);
    app.use("/api/queue", apiLimiter, queueRouter);

    return app;
};

module.exports = { createApp };
