const express = require("express");
const authController = require("./auth.controller");

const router = express.Router();

router.post("/login-password", authController.loginPassword);
router.post("/login-pin", authController.loginPin);

module.exports = router;
