const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const defaultDbPath = path.join(__dirname, "../../zeraPOS.db");

const dataDir = process.env.ZERAPOS_DATA_DIR || path.join(__dirname, "../../");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "zeraPOS.db");

if (!fs.existsSync(dbPath) && fs.existsSync(defaultDbPath)) {
  fs.copyFileSync(defaultDbPath, dbPath);
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("SQLite connection error:", err.message);
  } else {
    console.log("SQLite database connected");
    console.log("Database path:", dbPath);
  }
});

module.exports = db;
