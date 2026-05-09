const express = require("express");
const ordersController = require("./orders.controller");
const { requireAuth } = require("../../middleware/auth.middleware");

const router = express.Router();

router.get("/", requireAuth, ordersController.getOrders);

router.get("/:id", requireAuth, ordersController.getOrderDetails);

router.post("/", requireAuth, ordersController.createOrder);

router.post("/:id/print-ticket", requireAuth, ordersController.printTicket);

router.post("/:id/print-bill", requireAuth, ordersController.printBill);
router.post("/:id/pay", requireAuth, ordersController.payOrder);

module.exports = router;
