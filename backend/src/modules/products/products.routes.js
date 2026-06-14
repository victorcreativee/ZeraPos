const express = require("express");
const productsController = require("./products.controller");
const { requireAuth, allowRoles } = require("../../middleware/auth.middleware");

const router = express.Router();

router.get("/", requireAuth, productsController.getProducts);

router.post(
  "/",
  requireAuth,
  allowRoles("admin", "manager"),
  productsController.createProduct
);

router.put(
  "/:id",
  requireAuth,
  allowRoles("admin", "manager"),
  productsController.updateProduct
);

router.patch(
  "/:id/deactivate",
  requireAuth,
  allowRoles("admin", "manager"),
  productsController.deactivateProduct
);

module.exports = router;
