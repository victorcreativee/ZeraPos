const db = require("../../database/db");

function stockStatusSql() {
  return `
    CASE
      WHEN products.track_stock = 0 THEN 'not_tracked'
      WHEN products.stock_quantity <= 0 THEN 'out_of_stock'
      WHEN products.low_stock_level > 0 AND products.stock_quantity <= products.low_stock_level THEN 'low_stock'
      ELSE 'in_stock'
    END AS stock_status
  `;
}

function getProducts() {
  return new Promise((resolve, reject) => {
    db.all(
      `
      SELECT 
        products.*,
        categories.name AS category_name,
        ${stockStatusSql()}
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
      SELECT
        products.*,
        categories.name AS category_name,
        ${stockStatusSql()}
      FROM products
      LEFT JOIN categories ON products.category_id = categories.id
      WHERE products.is_active = 1 AND products.category_id = ?
      ORDER BY products.name ASC
      `,
      [categoryId],
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      }
    );
  });
}

function getLowStockProducts() {
  return new Promise((resolve, reject) => {
    db.all(
      `
      SELECT
        products.*,
        categories.name AS category_name,
        ${stockStatusSql()}
      FROM products
      LEFT JOIN categories ON products.category_id = categories.id
      WHERE products.is_active = 1
      AND products.track_stock = 1
      AND products.stock_quantity <= products.low_stock_level
      ORDER BY products.stock_quantity ASC, products.name ASC
      `,
      [],
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      }
    );
  });
}

function recordStockMovement({
  product_id,
  movement_type,
  quantity,
  previous_quantity,
  new_quantity,
  reference_type = null,
  reference_id = null,
  note = null,
  created_by = null,
}) {
  return new Promise((resolve, reject) => {
    db.run(
      `
      INSERT INTO stock_movements
      (
        product_id,
        movement_type,
        quantity,
        previous_quantity,
        new_quantity,
        reference_type,
        reference_id,
        note,
        created_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        product_id,
        movement_type,
        quantity,
        previous_quantity,
        new_quantity,
        reference_type,
        reference_id,
        note,
        created_by,
      ],
      function (err) {
        if (err) return reject(err);
        resolve({ id: this.lastID });
      }
    );
  });
}

function validateProductPayload(data) {
  if (!data.name || !data.name.trim()) {
    throw new Error("Product name is required");
  }

  if (data.price === undefined || data.price === null || Number(data.price) < 0) {
    throw new Error("Valid selling price is required");
  }
}

function createProduct(data) {
  return new Promise((resolve, reject) => {
    try {
      validateProductPayload(data);

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
        created_by = null,
      } = data;

      const safeStockQty = Number(stock_quantity || 0);

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
          name.trim(),
          Number(price),
          Number(cost_price || 0),
          item_type,
          send_to,
          safeStockQty,
          Number(low_stock_level || 0),
          track_stock ? 1 : 0,
        ],
        async function (err) {
          if (err) return reject(err);

          if (track_stock && safeStockQty > 0) {
            await recordStockMovement({
              product_id: this.lastID,
              movement_type: "opening_stock",
              quantity: safeStockQty,
              previous_quantity: 0,
              new_quantity: safeStockQty,
              reference_type: "product",
              reference_id: this.lastID,
              note: "Opening stock from product setup",
              created_by,
            }).catch(() => null);
          }

          resolve({
            id: this.lastID,
            category_id,
            name: name.trim(),
            price: Number(price),
            cost_price: Number(cost_price || 0),
            item_type,
            send_to,
            stock_quantity: safeStockQty,
            low_stock_level: Number(low_stock_level || 0),
            track_stock: track_stock ? 1 : 0,
          });
        }
      );
    } catch (error) {
      reject(error);
    }
  });
}

function updateProduct(productId, data) {
  return new Promise((resolve, reject) => {
    try {
      validateProductPayload(data);

      db.get("SELECT * FROM products WHERE id = ?", [productId], (findErr, existing) => {
        if (findErr) return reject(findErr);
        if (!existing) return reject(new Error("Product not found"));

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
          updated_by = null,
        } = data;

        const previousQty = Number(existing.stock_quantity || 0);
        const nextQty = Number(stock_quantity || 0);
        const qtyDifference = nextQty - previousQty;

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
            low_stock_level = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
          `,
          [
            name.trim(),
            category_id || null,
            Number(price),
            Number(cost_price || 0),
            item_type || "general",
            send_to || "none",
            track_stock ? 1 : 0,
            nextQty,
            Number(low_stock_level || 0),
            productId,
          ],
          async function (err) {
            if (err) return reject(err);

            if (track_stock && qtyDifference !== 0) {
              await recordStockMovement({
                product_id: Number(productId),
                movement_type: qtyDifference > 0 ? "adjustment_in" : "adjustment_out",
                quantity: Math.abs(qtyDifference),
                previous_quantity: previousQty,
                new_quantity: nextQty,
                reference_type: "product",
                reference_id: Number(productId),
                note: "Manual stock adjustment from product edit",
                created_by: updated_by,
              }).catch(() => null);
            }

            resolve({ id: Number(productId), ...data });
          }
        );
      });
    } catch (error) {
      reject(error);
    }
  });
}

function deactivateProduct(productId) {
  return new Promise((resolve, reject) => {
    db.run(
      `
      UPDATE products
      SET is_active = 0, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [productId],
      function (err) {
        if (err) return reject(err);
        if (this.changes === 0) return reject(new Error("Product not found"));
        resolve({ id: Number(productId), is_active: 0 });
      }
    );
  });
}

module.exports = {
  getProducts,
  getProductsByCategory,
  getLowStockProducts,
  createProduct,
  updateProduct,
  deactivateProduct,
  recordStockMovement,
};
