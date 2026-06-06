const db = require("../../database/db");

function getProducts() {
  return new Promise((resolve, reject) => {
    db.all(
      `
      SELECT 
        products.*,
        categories.name AS category_name
      FROM products
      LEFT JOIN categories ON products.category_id = categories.id
      WHERE products.is_active = 1
      ORDER BY products.name ASC
      `,
      [],
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      }
    );
  });
}

function getProductsByCategory(categoryId) {
  return new Promise((resolve, reject) => {
    db.all(
      `
      SELECT *
      FROM products
      WHERE is_active = 1 AND category_id = ?
      ORDER BY name ASC
      `,
      [categoryId],
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      }
    );
  });
}

function createProduct(data) {
  return new Promise((resolve, reject) => {
    const {
      category_id,
      name,
      price,
      cost_price = 0,
      item_type = "general",
      send_to = "none",
      stock_quantity = 0,
      low_stock_level = 0,
      track_stock = 0,
    } = data;

    db.run(
      `
      INSERT INTO products 
      (
        category_id,
        name,
        price,
        cost_price,
        item_type,
        send_to,
        stock_quantity,
        low_stock_level,
        track_stock
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        category_id || null,
        name,
        price,
        cost_price,
        item_type,
        send_to,
        stock_quantity,
        low_stock_level,
        track_stock ? 1 : 0,
      ],
      function (err) {
        if (err) return reject(err);

        resolve({
          id: this.lastID,
          category_id,
          name,
          price,
          cost_price,
          item_type,
          send_to,
          stock_quantity,
          low_stock_level,
          track_stock,
        });
      }
    );
  });
}
function updateProduct(productId, data) {
  return new Promise((resolve, reject) => {
    const {
      name,
      category_id,
      price,
      cost_price,
      item_type,
      send_to,
      track_stock,
      stock_quantity,
      low_stock_level,
    } = data;

    if (!name) return reject(new Error("Product name is required"));
    if (!price) return reject(new Error("Selling price is required"));

    db.run(
      `
      UPDATE products
      SET
        name = ?,
        category_id = ?,
        price = ?,
        cost_price = ?,
        item_type = ?,
        send_to = ?,
        track_stock = ?,
        stock_quantity = ?,
        low_stock_level = ?
      WHERE id = ?
      `,
      [
        name,
        category_id || null,
        Number(price),
        Number(cost_price || 0),
        item_type || "general",
        send_to || "none",
        track_stock ? 1 : 0,
        Number(stock_quantity || 0),
        Number(low_stock_level || 0),
        productId,
      ],
      function (err) {
        if (err) return reject(err);

        if (this.changes === 0) {
          return reject(new Error("Product not found"));
        }

        resolve({
          id: Number(productId),
          ...data,
        });
      }
    );
  });
}
module.exports = {
  getProducts,
  getProductsByCategory,
  createProduct,
  updateProduct,
};
