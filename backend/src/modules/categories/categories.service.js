const db = require("../../database/db");

function getCategories() {
  return new Promise((resolve, reject) => {
    db.all(
      `
      SELECT *
      FROM categories
      WHERE is_active = 1
      ORDER BY sort_order ASC, name ASC
      `,
      [],
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      }
    );
  });
}

function createCategory(data) {
  return new Promise((resolve, reject) => {
    const { name, type = "general", sort_order = 0 } = data;

    db.run(
      `
      INSERT INTO categories (name, type, sort_order)
      VALUES (?, ?, ?)
      `,
      [name, type, sort_order],
      function (err) {
        if (err) return reject(err);

        resolve({
          id: this.lastID,
          name,
          type,
          sort_order,
        });
      }
    );
  });
}

module.exports = {
  getCategories,
  createCategory,
};
