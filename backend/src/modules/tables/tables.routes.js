const express = require("express");
const tablesController = require("./tables.controller");
const { requireAuth, allowRoles } = require("../../middleware/auth.middleware");

const router = express.Router();

router.get("/", requireAuth, tablesController.getTables);

router.post(
  "/",
  requireAuth,
  allowRoles("admin", "manager"),
  tablesController.createTable
);

module.exports = router;
