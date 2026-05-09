const db = require("../../database/db");

function getMyDashboardStats(userId) {
  return new Promise((resolve, reject) => {
    db.get(
      `
      SELECT 
        COALESCE(SUM(total), 0) AS my_sales_today
      FROM orders
      WHERE server_id = ?
      AND status = 'paid'
      AND DATE(closed_at) = DATE('now', 'localtime')
      `,
      [userId],
      (salesErr, salesRow) => {
        if (salesErr) return reject(salesErr);

        db.get(
          `
          SELECT COUNT(*) AS my_open_orders
          FROM orders
          WHERE server_id = ?
          AND status != 'paid'
          AND status != 'cancelled'
          `,
          [userId],
          (ordersErr, ordersRow) => {
            if (ordersErr) return reject(ordersErr);

            resolve({
              my_sales_today: salesRow?.my_sales_today || 0,
              my_open_orders: ordersRow?.my_open_orders || 0,
            });
          }
        );
      }
    );
  });
}

module.exports = {
  getMyDashboardStats,
};
