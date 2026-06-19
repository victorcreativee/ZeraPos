const express = require("express");
const backupsController = require("./backups.controller");
const { requireAuth, allowRoles } = require("../../middleware/auth.middleware");

const router = express.Router();

router.get(
  "/",
  requireAuth,
  allowRoles("admin", "manager"),
  backupsController.listBackups
);

router.post(
  "/",
  requireAuth,
  allowRoles("admin"),
  backupsController.createBackup
);
router.post(
  "/restore",
  requireAuth,
  allowRoles("admin"),
  backupsController.restoreBackup
);
router.post(
  "/open-folder",
  requireAuth,
  allowRoles("admin", "manager"),
  backupsController.openBackupsFolder
);

module.exports = router;
