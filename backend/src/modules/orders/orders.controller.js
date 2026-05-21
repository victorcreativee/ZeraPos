const ordersService = require("./orders.service");

async function createOrder(req, res) {
  try {
    const order = await ordersService.createOrder({
      ...req.body,
      server_id: req.body.server_id || req.user.id,
    });

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
      req.body.print_type || "kitchen_bar_ticket"
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

async function updateOrderItemStatus(req, res) {
  try {
    const result = await ordersService.updateOrderItemStatus({
      order_id: req.params.orderId,
      item_id: req.params.itemId,
      status: req.body.status,
    });

    res.json({
      success: true,
      message: "Order item status updated",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function cancelOrder(req, res) {
  try {
    const result = await ordersService.cancelOrder({
      order_id: req.params.id,
      reason: req.body.reason,
      cancelled_by: req.user.id,
    });

    await ordersService.logPrint(req.params.id, req.user.id, "order_cancelled");

    res.json({
      success: true,
      message: "Order cancelled successfully",
      data: result,
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
async function getKitchenQueue(req, res) {
  try {
    const items = await ordersService.getPreparationQueue("kitchen");

    res.json({
      success: true,
      data: items,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function getBarQueue(req, res) {
  try {
    const items = await ordersService.getPreparationQueue("bar");

    res.json({
      success: true,
      data: items,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
async function printCombinedTableBill(req, res) {
  try {
    const tableId = req.params.tableId;

    const bill = await ordersService.getCombinedTableBill(tableId);

    if (!bill.orders.length) {
      return res.status(400).json({
        success: false,
        message: "No unpaid orders found for this table",
      });
    }

    await ordersService.markCombinedTableBillPrinted(tableId);

    res.json({
      success: true,
      message: "Combined customer bill generated",
      data: bill,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}
async function payTableOrders(req, res) {
  try {
    const result = await ordersService.payTableOrders({
      table_id: req.params.tableId,
      method: req.body.method,
      reference: req.body.reference,
      received_by: req.user.id,
    });

    res.json({
      success: true,
      message: "Combined table payment completed successfully",
      data: result,
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
  updateOrderItemStatus,
  cancelOrder,
  payOrder,
  printPaidReceipt,
  getKitchenQueue,
  getBarQueue,
  printCombinedTableBill,
  payTableOrders,
};
