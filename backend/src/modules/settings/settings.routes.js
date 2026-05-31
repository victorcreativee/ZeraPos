const express = require("express");
const settingsController = require("./settings.controller");
const { requireAuth, allowRoles } = require("../../middleware/auth.middleware");

const router = express.Router();

router.get(
  "/",
  requireAuth,
  allowRoles("admin", "manager"),
  settingsController.getSettings
);

router.patch(
  "/",
  requireAuth,
  allowRoles("admin"),
  settingsController.updateSettings
);

module.exports = router;
