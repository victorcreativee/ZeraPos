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

async function getOrderDetails(req, res) {
  try {
    const order = await ordersService.getOrderDetails(req.params.id);

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
}

async function printTicket(req, res) {
  try {
    const order = await ordersService.getOrderDetails(req.params.id);

    await ordersService.logPrint(
      req.params.id,
      req.user.id,
      "kitchen_bar_ticket"
    );

    res.json({
      success: true,
      message: "Kitchen/Bar ticket generated",
      data: order,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function printBill(req, res) {
  try {
    const order = await ordersService.getOrderDetails(req.params.id);

    await ordersService.logPrint(req.params.id, req.user.id, "customer_bill");
    await ordersService.markBillPrinted(req.params.id);

    res.json({
      success: true,
      message: "Customer bill generated",
      data: order,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}
async function payOrder(req, res) {
  try {
    const orderId = req.params.id;

    const result = await ordersService.payOrder({
      order_id: orderId,
      amount: req.body.amount,
      method: req.body.method,
      reference: req.body.reference,
      received_by: req.user.id,
    });

    const order = await ordersService.getOrderDetails(orderId);

    await ordersService.logPrint(orderId, req.user.id, "paid_receipt");

    res.json({
      success: true,
      message: "Payment completed successfully",
      data: order,
      payment: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}
async function printPaidReceipt(req, res) {
  try {
    const result = await ordersService.printPaidReceipt(
      req.params.id,
      req.user.id
    );

    const order = await ordersService.getOrderDetails(req.params.id);

    res.json({
      success: true,
      message: "Paid receipt generated",
      data: order,
      print: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}
module.exports = {
  createOrder,
  getOrders,
  getOrderDetails,
  printTicket,
  printBill,
  payOrder,
  printPaidReceipt,
};
