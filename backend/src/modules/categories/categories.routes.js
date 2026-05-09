const express = require("express");
const categoriesController = require("./categories.controller");
const { requireAuth, allowRoles } = require("../../middleware/auth.middleware");

const router = express.Router();

router.get("/", requireAuth, categoriesController.getCategories);

router.post(
  "/",
  requireAuth,
  allowRoles("admin", "manager"),
  categoriesController.createCategory
);

module.exports = router;
