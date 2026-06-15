const db = require("../../database/db");

function getTables() {
  return new Promise((resolve, reject) => {
    db.all(
      `
      SELECT
        restaurant_tables.*,

        COUNT(
          CASE 
            WHEN orders.status NOT IN ('paid', 'cancelled') 
            THEN orders.id 
          END
        ) AS open_orders_count,

        COALESCE(
          SUM(
            CASE 
              WHEN orders.status NOT IN ('paid', 'cancelled') 
              THEN orders.balance 
              ELSE 0 
            END
          ),
          0
        ) AS unpaid_total,

        COUNT(
          CASE 
            WHEN orders.status = 'bill_printed'
            THEN orders.id
          END
        ) AS bill_printed_count

      FROM restaurant_tables
      LEFT JOIN orders
        ON orders.table_id = restaurant_tables.id
      WHERE COALESCE(restaurant_tables.is_active, 1) = 1
      GROUP BY restaurant_tables.id
      ORDER BY restaurant_tables.id ASC
      `,
      [],
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      }
    );
  });
}

function createTable(data) {
  return new Promise((resolve, reject) => {
    const { name } = data;

    db.run(
      `
      INSERT INTO restaurant_tables (name)
      VALUES (?)
      `,
      [name],
      function (err) {
        if (err) return reject(err);

        resolve({
          id: this.lastID,
          name,
          status: "available",
        });
      }
    );
  });
}
function updateTable(tableId, data) {
  return new Promise((resolve, reject) => {
    const { name, status } = data;

    if (!name) {
      return reject(new Error("Table name is required"));
    }

    const nextStatus = status || "available";

    db.run(
      `
      UPDATE restaurant_tables
      SET name = ?, status = ?
      WHERE id = ?
      `,
      [name, nextStatus, tableId],
      function (err) {
        if (err) return reject(err);

        if (this.changes === 0) {
          return reject(new Error("Table not found"));
        }

        resolve({
          id: Number(tableId),
          name,
          status: nextStatus,
        });
      }
    );
  });
}
function getTableActiveBill(tableId) {
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

        if (!table) {
          return reject(new Error("Table not found"));
        }

        db.all(
          `
          SELECT
            orders.*,
            users.name AS server_name
          FROM orders
          LEFT JOIN users ON orders.server_id = users.id
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
                total: 0,
                items_count: 0,
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
              ORDER BY order_id ASC, send_to ASC, product_name ASC
              `,
              orderIds,
              (itemsErr, items) => {
                if (itemsErr) return reject(itemsErr);

                const ordersWithItems = orders.map((order) => ({
                  ...order,
                  items: items.filter((item) => item.order_id === order.id),
                }));

                resolve({
                  table,
                  orders: ordersWithItems,
                  total: orders.reduce(
                    (sum, order) =>
                      sum + Number(order.balance || order.total || 0),
                    0
                  ),
                  items_count: items.length,
                });
              }
            );
          }
        );
      }
    );
  });
}

function deactivateTable(tableId) {
  return new Promise((resolve, reject) => {
    db.get(
      `
      SELECT COUNT(*) AS open_count
      FROM orders
      WHERE table_id = ?
      AND status NOT IN ('paid', 'cancelled')
      `,
      [tableId],
      (countErr, row) => {
        if (countErr) return reject(countErr);

        if (Number(row?.open_count || 0) > 0) {
          return reject(
            new Error("Cannot deactivate a table with open unpaid orders")
          );
        }

        db.run(
          `
          UPDATE restaurant_tables
          SET is_active = 0, status = 'inactive'
          WHERE id = ?
          `,
          [tableId],
          function (err) {
            if (err) return reject(err);
            if (this.changes === 0) return reject(new Error("Table not found"));
            resolve({ id: Number(tableId), is_active: 0, status: "inactive" });
          }
        );
      }
    );
  });
}

module.exports = {
  getTables,
  createTable,
  updateTable,
  getTableActiveBill,
  deactivateTable,
};
