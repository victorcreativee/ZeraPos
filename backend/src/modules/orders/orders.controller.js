const ordersService = require("./orders.service");

async function createOrder(req, res) {
  try {
    const order = await ordersService.createOrder(req.body);

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function getOrders(req, res) {
  try {
    const orders = await ordersService.getOrders();

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  createOrder,
  getOrders,
};
