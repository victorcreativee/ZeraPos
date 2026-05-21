const db = require("../../database/db");

const ORDER_STATUSES = {
  OPEN: "open",
  SENT: "sent",
  BILL_PRINTED: "bill_printed",
  PAID: "paid",
  CANCELLED: "cancelled",
};

const ITEM_STATUSES = {
  PENDING: "pending",
  PREPARING: "preparing",
  READY: "ready",
  SERVED: "served",
  CANCELLED: "cancelled",
};

function generateOrderNumber() {
  return new Promise((resolve, reject) => {
    db.get(
      `
      SELECT id 
      FROM orders 
      ORDER BY id DESC 
      LIMIT 1
      `,
      [],
      (err, row) => {
        if (err) return reject(err);

        const nextNumber = row ? row.id + 1 : 1;
        resolve(`ORD-${String(nextNumber).padStart(4, "0")}`);
      }
    );
  });
}

function validateItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Order items are required");
  }

  items.forEach((item) => {
    if (!item.id || !item.name) {
      throw new Error("Each order item must have product details");
    }

    if (!Number(item.quantity) || Number(item.quantity) <= 0) {
      throw new Error(`Invalid quantity for ${item.name}`);
    }

    if (Number(item.price) < 0) {
      throw new Error(`Invalid price for ${item.name}`);
    }
  });
}
function refreshTableStatus(tableId) {
  if (!tableId) return;

  db.get(
    `
    SELECT COUNT(*) AS open_count
    FROM orders
    WHERE table_id = ?
    AND status NOT IN ('paid', 'cancelled')
    `,
    [tableId],
    (err, row) => {
      if (err) {
        console.log("Failed to refresh table status", err.message);
        return;
      }

      const nextStatus =
        Number(row?.open_count || 0) > 0 ? "occupied" : "available";

      db.run(
        `
        UPDATE restaurant_tables
        SET status = ?
        WHERE id = ?
        `,
        [nextStatus, tableId]
      );
    }
  );
}

async function createOrder(data) {
  const orderNumber = await generateOrderNumber();

  return new Promise((resolve, reject) => {
    try {
      const {
        table_id = null,
        server_id,
        order_type = "table",
        items = [],
        discount = 0,
      } = data;

      validateItems(items);

      const subtotal = items.reduce((sum, item) => {
        return sum + Number(item.price) * Number(item.quantity);
      }, 0);

      const safeDiscount = Math.max(
        0,
        Math.min(Number(discount) || 0, subtotal)
      );
      const total = subtotal - safeDiscount;

      db.run(
        `
        INSERT INTO orders
        (
          order_number,
          table_id,
          server_id,
          order_type,
          status,
          subtotal,
          discount,
          total,
          balance
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          orderNumber,
          table_id,
          server_id,
          order_type,
          ORDER_STATUSES.SENT,
          subtotal,
          safeDiscount,
          total,
          total,
        ],
        function (err) {
          if (err) return reject(err);

          const orderId = this.lastID;

          const stmt = db.prepare(`
            INSERT INTO order_items
            (
              order_id,
              product_id,
              product_name,
              quantity,
              unit_price,
              total_price,
              status,
              send_to
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `);

          items.forEach((item) => {
            stmt.run([
              orderId,
              item.id,
              item.name,
              Number(item.quantity),
              Number(item.price),
              Number(item.price) * Number(item.quantity),
              ITEM_STATUSES.PENDING,
              item.send_to || "none",
            ]);

            if (item.track_stock) {
              db.run(
                `
                UPDATE products
                SET stock_quantity = stock_quantity - ?
                WHERE id = ?
                `,
                [Number(item.quantity), item.id]
              );
            }
          });

          stmt.finalize();

          if (table_id) {
            db.run(
              `
              UPDATE restaurant_tables
              SET status = 'occupied'
              WHERE id = ?
              `,
              [table_id]
            );
          }

          resolve({
            id: orderId,
            order_number: orderNumber,
            status: ORDER_STATUSES.SENT,
            subtotal,
            discount: safeDiscount,
            total,
            balance: total,
          });
        }
      );
    } catch (error) {
      reject(error);
    }
  });
}

function getOrders() {
  return new Promise((resolve, reject) => {
    db.all(
      `
      SELECT
        orders.*,
        users.name AS server_name,
        restaurant_tables.name AS table_name
      FROM orders
      LEFT JOIN users ON orders.server_id = users.id
      LEFT JOIN restaurant_tables ON orders.table_id = restaurant_tables.id
      ORDER BY orders.created_at DESC
      `,
      [],
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      }
    );
  });
}

function getOrderDetails(orderId) {
  return new Promise((resolve, reject) => {
    db.get(
      `
      SELECT
        orders.*,
        users.name AS server_name,
        restaurant_tables.name AS table_name
      FROM orders
      LEFT JOIN users ON orders.server_id = users.id
      LEFT JOIN restaurant_tables ON orders.table_id = restaurant_tables.id
      WHERE orders.id = ?
      `,
      [orderId],
      (err, order) => {
        if (err) return reject(err);

        if (!order) {
          return reject(new Error("Order not found"));
        }

        db.all(
          `
          SELECT *
          FROM order_items
          WHERE order_id = ?
          ORDER BY send_to ASC, product_name ASC
          `,
          [orderId],
          (itemsErr, items) => {
            if (itemsErr) return reject(itemsErr);

            resolve({
              ...order,
              items,
            });
          }
        );
      }
    );
  });
}

function logPrint(orderId, printedBy, printType) {
  return new Promise((resolve, reject) => {
    db.run(
      `
      INSERT INTO print_logs (order_id, printed_by, print_type)
      VALUES (?, ?, ?)
      `,
      [orderId, printedBy, printType],
      function (err) {
        if (err) return reject(err);

        resolve({
          id: this.lastID,
          order_id: orderId,
          print_type: printType,
        });
      }
    );
  });
}

function markBillPrinted(orderId) {
  return new Promise((resolve, reject) => {
    db.run(
      `
      UPDATE orders
      SET status = ?
      WHERE id = ?
      AND status NOT IN (?, ?)
      `,
      [
        ORDER_STATUSES.BILL_PRINTED,
        orderId,
        ORDER_STATUSES.PAID,
        ORDER_STATUSES.CANCELLED,
      ],
      function (err) {
        if (err) return reject(err);
        resolve(true);
      }
    );
  });
}

function updateOrderItemStatus({ order_id, item_id, status }) {
  return new Promise((resolve, reject) => {
    const allowedStatuses = Object.values(ITEM_STATUSES);

    if (!allowedStatuses.includes(status)) {
      return reject(new Error("Invalid item status"));
    }

    let timestampField = null;

    if (status === ITEM_STATUSES.PREPARING) timestampField = "prepared_at";
    if (status === ITEM_STATUSES.READY) timestampField = "ready_at";
    if (status === ITEM_STATUSES.SERVED) timestampField = "served_at";

    const timestampSql = timestampField
      ? `, ${timestampField} = CURRENT_TIMESTAMP`
      : "";

    db.run(
      `
      UPDATE order_items
      SET status = ? ${timestampSql}
      WHERE id = ?
      AND order_id = ?
      `,
      [status, item_id, order_id],
      function (err) {
        if (err) return reject(err);

        if (this.changes === 0) {
          return reject(new Error("Order item not found"));
        }

        resolve({
          order_id,
          item_id,
          status,
        });
      }
    );
  });
}

function cancelOrder({ order_id, reason, cancelled_by }) {
  return new Promise((resolve, reject) => {
    if (!reason || !reason.trim()) {
      return reject(new Error("Cancel reason is required"));
    }

    db.get(
      `
      SELECT *
      FROM orders
      WHERE id = ?
      `,
      [order_id],
      (err, order) => {
        if (err) return reject(err);

        if (!order) {
          return reject(new Error("Order not found"));
        }

        if (order.status === ORDER_STATUSES.PAID) {
          return reject(new Error("Paid orders cannot be cancelled"));
        }

        if (order.status === ORDER_STATUSES.CANCELLED) {
          return reject(new Error("Order already cancelled"));
        }

        db.run(
          `
          UPDATE orders
          SET
            status = ?,
            cancel_reason = ?,
            cancelled_by = ?,
            cancelled_at = CURRENT_TIMESTAMP,
            balance = 0
          WHERE id = ?
          `,
          [ORDER_STATUSES.CANCELLED, reason.trim(), cancelled_by, order_id],
          function (updateErr) {
            if (updateErr) return reject(updateErr);

            db.run(
              `
              UPDATE order_items
              SET status = ?
              WHERE order_id = ?
              `,
              [ITEM_STATUSES.CANCELLED, order_id]
            );

            refreshTableStatus(order.table_id);

            resolve({
              success: true,
              order_id,
              status: ORDER_STATUSES.CANCELLED,
              reason: reason.trim(),
            });
          }
        );
      }
    );
  });
}

function payOrder(data) {
  return new Promise((resolve, reject) => {
    const { order_id, amount, method, reference = null, received_by } = data;

    if (!method) {
      return reject(new Error("Payment method is required"));
    }

    db.get(
      `
      SELECT *
      FROM orders
      WHERE id = ?
      `,
      [order_id],
      (err, order) => {
        if (err) return reject(err);

        if (!order) {
          return reject(new Error("Order not found"));
        }

        if (order.status === ORDER_STATUSES.PAID) {
          return reject(new Error("Order already paid"));
        }

        if (order.status === ORDER_STATUSES.CANCELLED) {
          return reject(new Error("Cancelled orders cannot be paid"));
        }

        const paymentAmount = Number(amount);

        if (!paymentAmount || paymentAmount <= 0) {
          return reject(new Error("Valid payment amount is required"));
        }

        if (paymentAmount < Number(order.total)) {
          return reject(new Error("Partial payment is not enabled yet"));
        }

        db.run(
          `
          INSERT INTO payments
          (
            order_id,
            method,
            amount,
            reference,
            received_by
          )
          VALUES (?, ?, ?, ?, ?)
          `,
          [order_id, method, paymentAmount, reference, received_by],
          function (paymentErr) {
            if (paymentErr) return reject(paymentErr);

            db.run(
              `
              UPDATE orders
              SET
                paid_amount = ?,
                balance = 0,
                status = ?,
                closed_at = CURRENT_TIMESTAMP
              WHERE id = ?
              `,
              [paymentAmount, ORDER_STATUSES.PAID, order_id],
              (updateErr) => {
                if (updateErr) return reject(updateErr);

                db.run(
                  `
                  UPDATE order_items
                  SET status = ?
                  WHERE order_id = ?
                  AND status != ?
                  `,
                  [ITEM_STATUSES.SERVED, order_id, ITEM_STATUSES.CANCELLED]
                );

                refreshTableStatus(order.table_id);

                resolve({
                  success: true,
                  order_id,
                  amount: paymentAmount,
                  method,
                });
              }
            );
          }
        );
      }
    );
  });
}

function printPaidReceipt(orderId, printedBy) {
  return new Promise((resolve, reject) => {
    db.get(
      `
      SELECT *
      FROM orders
      WHERE id = ?
      `,
      [orderId],
      (err, order) => {
        if (err) return reject(err);

        if (!order) {
          return reject(new Error("Order not found"));
        }

        if (order.status !== ORDER_STATUSES.PAID) {
          return reject(new Error("Order is not paid yet"));
        }

        db.run(
          `
          INSERT INTO print_logs (order_id, printed_by, print_type)
          VALUES (?, ?, ?)
          `,
          [orderId, printedBy, "paid_receipt"],
          function (printErr) {
            if (printErr) return reject(printErr);

            resolve({
              success: true,
              order_id: orderId,
              print_log_id: this.lastID,
            });
          }
        );
      }
    );
  });
}
function getPreparationQueue(sendTo) {
  return new Promise((resolve, reject) => {
    db.all(
      `
      SELECT
        order_items.*,
        orders.order_number,
        orders.order_type,
        orders.created_at,
        restaurant_tables.name AS table_name
      FROM order_items
      LEFT JOIN orders
        ON order_items.order_id = orders.id
      LEFT JOIN restaurant_tables
        ON orders.table_id = restaurant_tables.id
      WHERE
        order_items.send_to = ?
        AND order_items.status IN ('pending', 'preparing', 'ready')
        AND orders.status NOT IN ('paid', 'cancelled')
      ORDER BY orders.created_at ASC
      `,
      [sendTo],
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      }
    );
  });
}
function getCombinedTableBill(tableId) {
  return new Promise((resolve, reject) => {
    db.get(
      `
      SELECT *
      FROM restaurant_tables
      WHERE id = ?
      `,
      [tableId],
      (tableErr, table) => {
        if (tableErr) return reject(tableErr);
        if (!table) return reject(new Error("Table not found"));

        db.all(
          `
          SELECT
            orders.*,
            users.name AS server_name,
            restaurant_tables.name AS table_name
          FROM orders
          LEFT JOIN users ON orders.server_id = users.id
          LEFT JOIN restaurant_tables ON orders.table_id = restaurant_tables.id
          WHERE orders.table_id = ?
          AND orders.status NOT IN ('paid', 'cancelled')
          ORDER BY orders.created_at ASC
          `,
          [tableId],
          (ordersErr, orders) => {
            if (ordersErr) return reject(ordersErr);

            if (orders.length === 0) {
              return resolve({
                table,
                orders: [],
                items: [],
                total: 0,
              });
            }

            const orderIds = orders.map((order) => order.id);
            const placeholders = orderIds.map(() => "?").join(",");

            db.all(
              `
              SELECT *
              FROM order_items
              WHERE order_id IN (${placeholders})
              AND status != 'cancelled'
              ORDER BY order_id ASC, product_name ASC
              `,
              orderIds,
              (itemsErr, items) => {
                if (itemsErr) return reject(itemsErr);

                resolve({
                  table,
                  orders,
                  items,
                  total: orders.reduce(
                    (sum, order) =>
                      sum + Number(order.balance || order.total || 0),
                    0
                  ),
                });
              }
            );
          }
        );
      }
    );
  });
}

function markCombinedTableBillPrinted(tableId) {
  return new Promise((resolve, reject) => {
    db.run(
      `
      UPDATE orders
      SET status = ?
      WHERE table_id = ?
      AND status NOT IN ('paid', 'cancelled')
      `,
      [ORDER_STATUSES.BILL_PRINTED, tableId],
      function (err) {
        if (err) return reject(err);

        resolve({
          success: true,
          table_id: tableId,
          updated_orders: this.changes,
        });
      }
    );
  });
}
function payTableOrders({ table_id, method, reference = null, received_by }) {
  return new Promise((resolve, reject) => {
    if (!table_id) return reject(new Error("Table ID is required"));
    if (!method) return reject(new Error("Payment method is required"));

    db.all(
      `
      SELECT *
      FROM orders
      WHERE table_id = ?
      AND status NOT IN ('paid', 'cancelled')
      ORDER BY created_at ASC
      `,
      [table_id],
      (err, orders) => {
        if (err) return reject(err);

        if (!orders.length) {
          return reject(new Error("No unpaid orders found for this table"));
        }

        const totalAmount = orders.reduce(
          (sum, order) => sum + Number(order.balance || order.total || 0),
          0
        );

        db.serialize(() => {
          db.run("BEGIN TRANSACTION");

          const paymentStmt = db.prepare(`
            INSERT INTO payments
            (
              order_id,
              method,
              amount,
              reference,
              received_by
            )
            VALUES (?, ?, ?, ?, ?)
          `);

          const orderStmt = db.prepare(`
            UPDATE orders
            SET
              paid_amount = ?,
              balance = 0,
              status = ?,
              closed_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `);

          const itemStmt = db.prepare(`
            UPDATE order_items
            SET status = ?
            WHERE order_id = ?
            AND status != ?
          `);

          try {
            orders.forEach((order) => {
              const amount = Number(order.balance || order.total || 0);

              paymentStmt.run([
                order.id,
                method,
                amount,
                reference,
                received_by,
              ]);

              orderStmt.run([amount, ORDER_STATUSES.PAID, order.id]);

              itemStmt.run([
                ITEM_STATUSES.SERVED,
                order.id,
                ITEM_STATUSES.CANCELLED,
              ]);
            });

            paymentStmt.finalize();
            orderStmt.finalize();
            itemStmt.finalize();

            db.run(
              `
              UPDATE restaurant_tables
              SET status = 'available'
              WHERE id = ?
              `,
              [table_id],
              (tableErr) => {
                if (tableErr) {
                  db.run("ROLLBACK");
                  return reject(tableErr);
                }

                db.run("COMMIT", (commitErr) => {
                  if (commitErr) return reject(commitErr);

                  resolve({
                    success: true,
                    table_id,
                    orders_paid: orders.length,
                    amount: totalAmount,
                    method,
                  });
                });
              }
            );
          } catch (error) {
            db.run("ROLLBACK");
            reject(error);
          }
        });
      }
    );
  });
}
module.exports = {
  createOrder,
  getOrders,
  getOrderDetails,
  logPrint,
  markBillPrinted,
  updateOrderItemStatus,
  cancelOrder,
  payOrder,
  printPaidReceipt,
  getPreparationQueue,
  getCombinedTableBill,
  markCombinedTableBillPrinted,
  payTableOrders,
};
