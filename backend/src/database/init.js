const bcrypt = require("bcryptjs");
const db = require("./db");

function initDatabase() {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE,
        phone TEXT,
        role TEXT NOT NULL,
        pin_hash TEXT,
        password_hash TEXT,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT DEFAULT 'general',
        sort_order INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        cost_price REAL DEFAULT 0,
        item_type TEXT DEFAULT 'general',
        send_to TEXT DEFAULT 'none',
        stock_quantity REAL DEFAULT 0,
        low_stock_level REAL DEFAULT 0,
        track_stock INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS restaurant_tables (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        status TEXT DEFAULT 'available',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_number TEXT UNIQUE,
        table_id INTEGER,
        server_id INTEGER,
        order_type TEXT DEFAULT 'table',
        status TEXT DEFAULT 'open',
        subtotal REAL DEFAULT 0,
        discount REAL DEFAULT 0,
        tax REAL DEFAULT 0,
        total REAL DEFAULT 0,
        paid_amount REAL DEFAULT 0,
        balance REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        closed_at DATETIME,
        FOREIGN KEY (table_id) REFERENCES restaurant_tables(id),
        FOREIGN KEY (server_id) REFERENCES users(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER,
        product_name TEXT NOT NULL,
        quantity REAL NOT NULL,
        unit_price REAL NOT NULL,
        total_price REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        send_to TEXT DEFAULT 'none',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        method TEXT NOT NULL,
        amount REAL NOT NULL,
        reference TEXT,
        received_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (received_by) REFERENCES users(id)
      )
    `);

    seedDefaultAdmin();
    seedDefaultPOSData();
  });
}

function seedDefaultAdmin() {
  db.get(
    "SELECT * FROM users WHERE role = 'admin' LIMIT 1",
    async (err, user) => {
      if (err) {
        console.error("Admin check failed:", err.message);
        return;
      }

      if (!user) {
        const passwordHash = await bcrypt.hash("admin123", 10);
        const pinHash = await bcrypt.hash("1234", 10);

        db.run(
          `
        INSERT INTO users (name, email, phone, role, pin_hash, password_hash)
        VALUES (?, ?, ?, ?, ?, ?)
        `,
          [
            "System Admin",
            "admin@zerapos.com",
            "0700000000",
            "admin",
            pinHash,
            passwordHash,
          ],
          (insertErr) => {
            if (insertErr) {
              console.error(
                "Default admin creation failed:",
                insertErr.message
              );
            } else {
              console.log("Default admin ready");
            }
          }
        );
      }
    }
  );
}

function seedDefaultPOSData() {
  db.get("SELECT * FROM categories LIMIT 1", (err, category) => {
    if (err) {
      console.error("Category seed check failed:", err.message);
      return;
    }

    if (!category) {
      db.run(
        `INSERT INTO categories (name, type, sort_order) VALUES ('Drinks', 'drink', 1)`
      );
      db.run(
        `INSERT INTO categories (name, type, sort_order) VALUES ('Food', 'food', 2)`
      );
      db.run(
        `INSERT INTO categories (name, type, sort_order) VALUES ('Specials', 'general', 3)`
      );

      db.run(`
        INSERT INTO products 
        (category_id, name, price, cost_price, item_type, send_to, stock_quantity, low_stock_level, track_stock)
        VALUES 
        (1, 'Nile Special', 5000, 3500, 'drink', 'bar', 50, 10, 1),
        (1, 'Club Beer', 5000, 3500, 'drink', 'bar', 50, 10, 1),
        (1, 'Soda', 2000, 1200, 'drink', 'bar', 100, 20, 1),
        (2, 'Chips', 8000, 4000, 'food', 'kitchen', 0, 0, 0),
        (2, 'Chicken', 15000, 9000, 'food', 'kitchen', 0, 0, 0)
      `);

      db.run(`INSERT INTO restaurant_tables (name) VALUES ('Table 1')`);
      db.run(`INSERT INTO restaurant_tables (name) VALUES ('Table 2')`);
      db.run(`INSERT INTO restaurant_tables (name) VALUES ('Table 3')`);

      console.log("Default POS data created");
    }
  });
}

module.exports = initDatabase;
