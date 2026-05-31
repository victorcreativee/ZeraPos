const db = require("../../database/db");

function getSettings() {
  return new Promise((resolve, reject) => {
    db.get(
      `
      SELECT *
      FROM system_settings
      WHERE id = 1
      `,
      [],
      (err, row) => {
        if (err) return reject(err);
        resolve(row);
      }
    );
  });
}

function updateSettings(data) {
  return new Promise((resolve, reject) => {
    const allowedFields = [
      "business_name",
      "business_type",
      "phone",
      "address",
      "tin",
      "currency",
      "receipt_footer",
      "receipt_width",
      "enable_kitchen_screen",
      "enable_bar_screen",
      "enable_kitchen_ticket_printing",
      "enable_bar_ticket_printing",
      "enable_cash",
      "enable_mobile_money",
      "enable_card",
    ];

    const updates = [];
    const values = [];

    allowedFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(data, field)) {
        updates.push(`${field} = ?`);
        values.push(data[field]);
      }
    });

    if (updates.length === 0) {
      return reject(new Error("No valid settings provided"));
    }

    values.push(1);

    db.run(
      `
      UPDATE system_settings
      SET ${updates.join(", ")},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      values,
      function (err) {
        if (err) return reject(err);

        getSettings().then(resolve).catch(reject);
      }
    );
  });
}

module.exports = {
  getSettings,
  updateSettings,
};
