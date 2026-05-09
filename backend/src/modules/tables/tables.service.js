const db = require("../../database/db");

function getTables() {
  return new Promise((resolve, reject) => {
    db.all(
      `
      SELECT *
      FROM restaurant_tables
      ORDER BY id ASC
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

module.exports = {
  getTables,
  createTable,
};
