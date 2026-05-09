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
        subtotal,
        total,
        balance
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [orderNumber, table_id, server_id, order_type, subtotal, total, total],
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
      LEFT JOIN restaurant_tables
      ON orders.table_id = restaurant_tables.id
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

module.exports = {
  createOrder,
  getOrders,
};
