const express = require("express");
const usersController = require("./users.controller");
const { requireAuth, allowRoles } = require("../../middleware/auth.middleware");

const router = express.Router();

router.get(
  "/",
  requireAuth,
  allowRoles("admin", "manager"),
  usersController.getUsers
);

router.post("/", requireAuth, allowRoles("admin"), usersController.createUser);

router.put(
  "/:id",
  requireAuth,
  allowRoles("admin"),
  usersController.updateUser
);

router.patch(
  "/:id/pin",
  requireAuth,
  allowRoles("admin"),
  usersController.changePin
);

module.exports = router;
