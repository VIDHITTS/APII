const express = require("express");
const controller = require("./controller");

const router = express.Router();

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/:id/resolve", controller.resolve);
router.post("/:id/keep-local", controller.keepLocal);
router.post("/:id/keep-remote", controller.keepRemote);
router.post("/:id/merge", controller.merge);

module.exports = router;
