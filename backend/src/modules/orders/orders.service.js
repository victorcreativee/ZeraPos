const db = require("../../database/db");

function generateOrderNumber() {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${Date.now()}-${random}`;
}

function createOrder(data) {
  return new Promise((resolve, reject) => {
    const {
      table_id = null,
      server_id,
      order_type = "table",
      items = [],
    } = data;

    if (!items.length) {
      return reject(new Error("Order items are required"));
    }

    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const total = subtotal;
    const orderNumber = generateOrderNumber();

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
        total,
        balance
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        orderNumber,
        table_id,
        server_id,
        order_type,
        "sent",
        subtotal,
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
            send_to
          )
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        items.forEach((item) => {
          stmt.run([
            orderId,
            item.id,
            item.name,
            item.quantity,
            item.price,
            item.price * item.quantity,
            item.send_to || "none",
          ]);

          if (item.track_stock) {
            db.run(
              `
              UPDATE products
              SET stock_quantity = stock_quantity - ?
              WHERE id = ?
              `,
              [item.quantity, item.id]
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
          subtotal,
          total,
        });
      }
    );
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
      SET status = 'bill_printed'
      WHERE id = ?
      `,
      [orderId],
      function (err) {
        if (err) return reject(err);
        resolve(true);
      }
    );
  });
}
function payOrder(data) {
  return new Promise((resolve, reject) => {
    const { order_id, amount, method, reference = null, received_by } = data;

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

        if (order.status === "paid") {
          return reject(new Error("Order already paid"));
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
          [order_id, method, amount, reference, received_by],
          function (paymentErr) {
            if (paymentErr) return reject(paymentErr);

            db.run(
              `
                UPDATE orders
                SET
                  paid_amount = ?,
                  balance = 0,
                  status = 'paid',
                  closed_at = CURRENT_TIMESTAMP
                WHERE id = ?
                `,
              [amount, order_id],
              (updateErr) => {
                if (updateErr) return reject(updateErr);

                if (order.table_id) {
                  db.run(
                    `
                      UPDATE restaurant_tables
                      SET status = 'available'
                      WHERE id = ?
                      `,
                    [order.table_id]
                  );
                }

                resolve({
                  success: true,
                  order_id,
                  amount,
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
module.exports = {
  createOrder,
  getOrders,
  getOrderDetails,
  logPrint,
  markBillPrinted,
  payOrder,
};
