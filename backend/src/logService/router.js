const express = require("express");
const controller = require("./controller");

const router = express.Router();

router.get("/", controller.getAll);
router.get("/stats", controller.getStats);
router.get("/:entityType/:entityId", controller.getByEntity);

module.exports = router;
