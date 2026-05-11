const express = require("express");
const reportsController = require("./reports.controller");
const { requireAuth, allowRoles } = require("../../middleware/auth.middleware");

const router = express.Router();

router.get("/my-dashboard", requireAuth, reportsController.getMyDashboardStats);
router.get(
  "/my-orders-history",
  requireAuth,
  reportsController.getMyOrdersHistory
);
router.get(
  "/manager-dashboard",
  requireAuth,
  allowRoles("admin", "manager"),
  reportsController.getManagerDashboardStats
);
router.get(
  "/manager-restaurant-dashboard",
  requireAuth,
  allowRoles("admin", "manager"),
  reportsController.getManagerRestaurantDashboard
);

module.exports = router;
