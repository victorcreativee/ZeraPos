const express = require("express");
const reportsController = require("./reports.controller");
const { requireAuth } = require("../../middleware/auth.middleware");

const router = express.Router();

router.get("/my-dashboard", requireAuth, reportsController.getMyDashboardStats);

module.exports = router;
