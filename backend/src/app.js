require("dotenv").config();

const express = require("express");
const cors = require("cors");

const initDatabase = require("./database/init");
const authRoutes = require("./modules/auth/auth.routes");
const usersRoutes = require("./modules/users/users.routes");
const { requireAuth, allowRoles } = require("./middleware/auth.middleware");
const categoriesRoutes = require("./modules/categories/categories.routes");
const productsRoutes = require("./modules/products/products.routes");
const tablesRoutes = require("./modules/tables/tables.routes");
const ordersRoutes = require("./modules/orders/orders.routes");
const reportsRoutes = require("./modules/reports/reports.routes");
const settingsRoutes = require("./modules/settings/settings.routes");
const app = express();

initDatabase();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "zeraPOS API running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/tables", tablesRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/settings", settingsRoutes);

app.get("/api/protected", requireAuth, (req, res) => {
  res.json({
    success: true,
    message: "You are authenticated",
    user: req.user,
  });
});

app.get("/api/admin-only", requireAuth, allowRoles("admin"), (req, res) => {
  res.json({
    success: true,
    message: "Welcome admin",
  });
});

module.exports = app;
