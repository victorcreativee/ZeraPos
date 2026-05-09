const express = require("express");
const ordersController = require("./orders.controller");
const { requireAuth } = require("../../middleware/auth.middleware");

const router = express.Router();

router.get("/", requireAuth, ordersController.getOrders);

router.post("/", requireAuth, ordersController.createOrder);

module.exports = router;
