const db = require("../../database/db");

const UGANDA_UTC_OFFSET_HOURS = 3;
const BUSINESS_DAY_START_HOUR = 5;

function formatSqlDate(date) {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

function getBusinessDayRangeUtc(selectedDate) {
  const now = new Date();

  let ugandaDate;

  if (selectedDate) {
    ugandaDate = new Date(`${selectedDate}T00:00:00Z`);
  } else {
    ugandaDate = new Date(
      now.getTime() + UGANDA_UTC_OFFSET_HOURS * 60 * 60 * 1000
    );
  }

  const year = ugandaDate.getUTCFullYear();
  const month = ugandaDate.getUTCMonth();
  const day = ugandaDate.getUTCDate();
  const hour = ugandaDate.getUTCHours();

  let businessStartLocal = new Date(
    Date.UTC(year, month, day, BUSINESS_DAY_START_HOUR, 0, 0)
  );

  // Important: for dashboard only
  // If it is before 5 AM, we are still in yesterday's business day
  if (!selectedDate && hour < BUSINESS_DAY_START_HOUR) {
    businessStartLocal.setUTCDate(businessStartLocal.getUTCDate() - 1);
  }

  const businessEndLocal = new Date(
    businessStartLocal.getTime() + 24 * 60 * 60 * 1000
  );

  const businessStartUtc = new Date(
    businessStartLocal.getTime() - UGANDA_UTC_OFFSET_HOURS * 60 * 60 * 1000
  );

  const businessEndUtc = new Date(
    businessEndLocal.getTime() - UGANDA_UTC_OFFSET_HOURS * 60 * 60 * 1000
  );

  return {
    start: formatSqlDate(businessStartUtc),
    end: formatSqlDate(businessEndUtc),
  };
}

function getMyDashboardStats(userId) {
  const businessDay = getBusinessDayRangeUtc();

  return new Promise((resolve, reject) => {
    db.get(
      `
      SELECT 
        COALESCE(SUM(total), 0) AS my_sales_today,
        COUNT(*) AS my_paid_orders_today
      FROM orders
      WHERE server_id = ?
      AND status = 'paid'
      AND closed_at >= ?
      AND closed_at < ?
      `,
      [userId, businessDay.start, businessDay.end],
      (salesErr, salesRow) => {
        if (salesErr) return reject(salesErr);

        db.get(
          `
          SELECT COUNT(*) AS my_open_orders
          FROM orders
          WHERE server_id = ?
          AND status NOT IN ('paid', 'cancelled')
          `,
          [userId],
          (ordersErr, ordersRow) => {
            if (ordersErr) return reject(ordersErr);

            db.all(
              `
              SELECT DISTINCT
                restaurant_tables.id,
                restaurant_tables.name,
                orders.id AS order_id,
                orders.total,
                orders.status AS order_status,
                orders.created_at
              FROM orders
              LEFT JOIN restaurant_tables 
                ON orders.table_id = restaurant_tables.id
              WHERE orders.server_id = ?
              AND orders.table_id IS NOT NULL
              AND orders.created_at >= ?
              AND orders.created_at < ?
              ORDER BY orders.id DESC
              `,
              [userId, businessDay.start, businessDay.end],
              (tablesErr, tablesRows) => {
                if (tablesErr) return reject(tablesErr);

                db.all(
                  `
                  SELECT
                    orders.id,
                    orders.order_number,
                    orders.total,
                    orders.status,
                    orders.created_at,
                    orders.closed_at,
                    restaurant_tables.name AS table_name
                  FROM orders
                  LEFT JOIN restaurant_tables 
                    ON orders.table_id = restaurant_tables.id
                  WHERE orders.server_id = ?
                  AND orders.created_at >= ?
                  AND orders.created_at < ?
                  ORDER BY orders.id DESC
                  LIMIT 8
                  `,
                  [userId, businessDay.start, businessDay.end],
                  (recentErr, recentOrders) => {
                    if (recentErr) return reject(recentErr);

                    resolve({
                      my_sales_today: salesRow?.my_sales_today || 0,
                      my_paid_orders_today: salesRow?.my_paid_orders_today || 0,
                      my_open_orders: ordersRow?.my_open_orders || 0,
                      my_tables_served_today: tablesRows.length || 0,
                      tables_served: tablesRows || [],
                      recent_orders: recentOrders || [],
                    });
                  }
                );
              }
            );
          }
        );
      }
    );
  });
}

function getMyOrdersHistory(userId, date) {
  const businessDay = getBusinessDayRangeUtc(date);

  return new Promise((resolve, reject) => {
    db.get(
      `
      SELECT
        COALESCE(SUM(CASE WHEN status = 'paid' THEN total ELSE 0 END), 0) AS total_sales,
        COUNT(*) AS total_orders,
        SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) AS paid_orders
      FROM orders
      WHERE server_id = ?
      AND created_at >= ?
      AND created_at < ?
      `,
      [userId, businessDay.start, businessDay.end],
      (summaryErr, summary) => {
        if (summaryErr) return reject(summaryErr);

        db.all(
          `
          SELECT
            orders.id,
            orders.order_number,
            orders.total,
            orders.status,
            orders.created_at,
            orders.closed_at,
            restaurant_tables.name AS table_name
          FROM orders
          LEFT JOIN restaurant_tables 
            ON orders.table_id = restaurant_tables.id
          WHERE orders.server_id = ?
          AND orders.created_at >= ?
          AND orders.created_at < ?
          ORDER BY datetime(orders.created_at) ASC
          `,
          [userId, businessDay.start, businessDay.end],
          (ordersErr, orders) => {
            if (ordersErr) return reject(ordersErr);

            resolve({
              date,
              business_day_start: businessDay.start,
              business_day_end: businessDay.end,
              total_sales: summary?.total_sales || 0,
              total_orders: summary?.total_orders || 0,
              paid_orders: summary?.paid_orders || 0,
              orders: orders || [],
            });
          }
        );
      }
    );
  });
}

function getManagerDashboardStats() {
  return new Promise((resolve, reject) => {
    db.get(
      `
      SELECT
        COALESCE(SUM(CASE WHEN status = 'paid' THEN total ELSE 0 END), 0) AS total_sales_today,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) AS paid_orders_today,
        COUNT(CASE WHEN status NOT IN ('paid', 'cancelled') THEN 1 END) AS open_orders,
        COUNT(*) AS total_orders_today
      FROM orders
      WHERE DATE(created_at) = DATE('now', 'localtime')
      `,
      [],
      (summaryErr, summary) => {
        if (summaryErr) return reject(summaryErr);

        db.all(
          `
          SELECT
            users.id,
            users.name,
            users.role,
            COALESCE(SUM(CASE WHEN orders.status = 'paid' THEN orders.total ELSE 0 END), 0) AS total_sales,
            COUNT(CASE WHEN orders.status = 'paid' THEN 1 END) AS paid_orders,
            COUNT(CASE WHEN orders.status NOT IN ('paid', 'cancelled') THEN 1 END) AS open_orders
          FROM users
          LEFT JOIN orders 
            ON orders.server_id = users.id
            AND DATE(orders.created_at) = DATE('now', 'localtime')
          WHERE users.role = 'server'
          GROUP BY users.id
          ORDER BY total_sales DESC
          `,
          [],
          (serversErr, servers) => {
            if (serversErr) return reject(serversErr);

            db.all(
              `
              SELECT
                orders.id,
                orders.order_number,
                orders.total,
                orders.status,
                orders.created_at,
                users.name AS server_name,
                restaurant_tables.name AS table_name
              FROM orders
              LEFT JOIN users ON orders.server_id = users.id
              LEFT JOIN restaurant_tables ON orders.table_id = restaurant_tables.id
              WHERE DATE(orders.created_at) = DATE('now', 'localtime')
              ORDER BY orders.id DESC
              LIMIT 10
              `,
              [],
              (recentErr, recentOrders) => {
                if (recentErr) return reject(recentErr);

                resolve({
                  summary: summary || {},
                  servers: servers || [],
                  recent_orders: recentOrders || [],
                });
              }
            );
          }
        );
      }
    );
  });
}

function getManagerRestaurantDashboard() {
  const businessDay = getBusinessDayRangeUtc();

  return new Promise((resolve, reject) => {
    db.get(
      `
      SELECT
        COALESCE(SUM(CASE WHEN status = 'paid' THEN total ELSE 0 END), 0) AS today_revenue,
        COUNT(*) AS orders_today,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) AS paid_orders,
        COUNT(CASE WHEN status NOT IN ('paid', 'cancelled') THEN 1 END) AS open_orders,
        COALESCE(AVG(CASE WHEN status = 'paid' THEN total END), 0) AS average_ticket
      FROM orders
      WHERE created_at >= ?
      AND created_at < ?
      `,
      [businessDay.start, businessDay.end],
      (summaryErr, summary) => {
        if (summaryErr) return reject(summaryErr);

        db.all(
          `
          SELECT
            restaurant_tables.id,
            restaurant_tables.name,
            restaurant_tables.status,
            orders.id AS order_id,
            orders.total,
            orders.status AS order_status,
            users.name AS server_name
          FROM restaurant_tables
          LEFT JOIN orders 
            ON orders.table_id = restaurant_tables.id
            AND orders.status NOT IN ('paid', 'cancelled')
          LEFT JOIN users 
            ON orders.server_id = users.id
          ORDER BY restaurant_tables.id ASC
          `,
          [],
          (tablesErr, tables) => {
            if (tablesErr) return reject(tablesErr);

            db.all(
              `
              SELECT
                users.id,
                users.name,
                COALESCE(SUM(CASE WHEN orders.status = 'paid' THEN orders.total ELSE 0 END), 0) AS total_sales,
                COUNT(CASE WHEN orders.status = 'paid' THEN 1 END) AS paid_orders,
                COUNT(CASE WHEN orders.status NOT IN ('paid', 'cancelled') THEN 1 END) AS open_orders,
                COUNT(DISTINCT orders.table_id) AS tables_served
              FROM users
              LEFT JOIN orders
                ON orders.server_id = users.id
                AND orders.created_at >= ?
                AND orders.created_at < ?
              WHERE users.role = 'server'
              GROUP BY users.id
              ORDER BY total_sales DESC
              `,
              [businessDay.start, businessDay.end],
              (waitersErr, waiters) => {
                if (waitersErr) return reject(waitersErr);

                db.all(
                  `
                  SELECT
                    orders.id,
                    orders.order_number,
                    orders.total,
                    orders.status,
                    orders.created_at,
                    restaurant_tables.name AS table_name,
                    users.name AS server_name
                  FROM orders
                  LEFT JOIN restaurant_tables ON orders.table_id = restaurant_tables.id
                  LEFT JOIN users ON orders.server_id = users.id
                  WHERE orders.created_at >= ?
                  AND orders.created_at < ?
                  ORDER BY orders.id DESC
                  LIMIT 10
                  `,
                  [businessDay.start, businessDay.end],
                  (recentErr, recentOrders) => {
                    if (recentErr) return reject(recentErr);

                    resolve({
                      summary: summary || {},
                      tables: tables || [],
                      waiters: waiters || [],
                      recent_orders: recentOrders || [],
                    });
                  }
                );
              }
            );
          }
        );
      }
    );
  });
}

function getCounterDashboardStats(userId) {
  const businessDay = getBusinessDayRangeUtc();

  return new Promise((resolve, reject) => {
    db.get(
      `
      SELECT
        COUNT(*) AS open_bills,
        COALESCE(SUM(balance), 0) AS open_bill_amount
      FROM orders
      WHERE status IN ('open', 'sent', 'bill_printed')
      `,
      [],
      (openErr, openSummary) => {
        if (openErr) return reject(openErr);

        db.get(
          `
          SELECT
            COUNT(*) AS paid_orders_today,
            COALESCE(SUM(amount), 0) AS total_collected_today,
            COALESCE(SUM(CASE WHEN method = 'cash' THEN amount ELSE 0 END), 0) AS cash_collected,
            COALESCE(SUM(CASE WHEN method = 'mobile_money' THEN amount ELSE 0 END), 0) AS mobile_money_collected,
            COALESCE(SUM(CASE WHEN method = 'card' THEN amount ELSE 0 END), 0) AS card_collected
          FROM payments
          WHERE received_by = ?
          AND created_at >= ?
          AND created_at < ?
          `,
          [userId, businessDay.start, businessDay.end],
          (paymentErr, paymentSummary) => {
            if (paymentErr) return reject(paymentErr);

            db.all(
              `
              SELECT
                orders.id,
                orders.order_number,
                orders.total,
                orders.balance,
                orders.status,
                orders.created_at,
                restaurant_tables.name AS table_name,
                users.name AS server_name
              FROM orders
              LEFT JOIN restaurant_tables ON orders.table_id = restaurant_tables.id
              LEFT JOIN users ON orders.server_id = users.id
              WHERE orders.status IN ('open', 'sent', 'bill_printed')
              ORDER BY orders.id DESC
              `,
              [],
              (openOrdersErr, openOrders) => {
                if (openOrdersErr) return reject(openOrdersErr);

                db.all(
                  `
                  SELECT
                    payments.id,
                    payments.order_id,
                    payments.method,
                    payments.amount,
                    payments.reference,
                    payments.created_at,
                    orders.order_number,
                    restaurant_tables.name AS table_name,
                    users.name AS server_name
                  FROM payments
                  LEFT JOIN orders ON payments.order_id = orders.id
                  LEFT JOIN restaurant_tables ON orders.table_id = restaurant_tables.id
                  LEFT JOIN users ON orders.server_id = users.id
                  WHERE payments.received_by = ?
                  AND payments.created_at >= ?
                  AND payments.created_at < ?
                  ORDER BY payments.id DESC
                  LIMIT 10
                  `,
                  [userId, businessDay.start, businessDay.end],
                  (recentPaymentsErr, recentPayments) => {
                    if (recentPaymentsErr) return reject(recentPaymentsErr);

                    resolve({
                      open_bills: openSummary?.open_bills || 0,
                      open_bill_amount: openSummary?.open_bill_amount || 0,
                      paid_orders_today: paymentSummary?.paid_orders_today || 0,
                      total_collected_today:
                        paymentSummary?.total_collected_today || 0,
                      cash_collected: paymentSummary?.cash_collected || 0,
                      mobile_money_collected:
                        paymentSummary?.mobile_money_collected || 0,
                      card_collected: paymentSummary?.card_collected || 0,
                      open_orders: openOrders || [],
                      recent_payments: recentPayments || [],
                    });
                  }
                );
              }
            );
          }
        );
      }
    );
  });
}
module.exports = {
  getMyDashboardStats,
  getMyOrdersHistory,
  getManagerDashboardStats,
  getManagerRestaurantDashboard,
  getCounterDashboardStats,
};
