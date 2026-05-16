const express = require("express");
const ordersController = require("./orders.controller");
const { requireAuth, allowRoles } = require("../../middleware/auth.middleware");

const router = express.Router();

router.get("/", requireAuth, ordersController.getOrders);

router.get("/:id", requireAuth, ordersController.getOrderDetails);

router.post("/", requireAuth, ordersController.createOrder);

router.post("/:id/print-ticket", requireAuth, ordersController.printTicket);

router.post("/:id/print-bill", requireAuth, ordersController.printBill);

router.patch(
  "/:orderId/items/:itemId/status",
  requireAuth,
  allowRoles("admin", "manager", "kitchen", "bar"),
  ordersController.updateOrderItemStatus
);

router.patch(
  "/:id/cancel",
  requireAuth,
  allowRoles("admin", "manager"),
  ordersController.cancelOrder
);

router.post(
  "/:id/pay",
  requireAuth,
  allowRoles("admin", "manager", "cashier"),
  ordersController.payOrder
);

router.post(
  "/:id/print-paid-receipt",
  requireAuth,
  allowRoles("admin", "manager", "cashier"),
  ordersController.printPaidReceipt
);

router.get(
  "/kitchen/queue",
  requireAuth,
  allowRoles("admin", "manager", "kitchen"),
  ordersController.getKitchenQueue
);
router.get(
  "/bar/queue",
  requireAuth,
  allowRoles("admin", "manager", "bar"),
  ordersController.getBarQueue
);
module.exports = router;
