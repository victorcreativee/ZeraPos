const bcrypt = require("bcryptjs");
const db = require("../../database/db");

function createUser(data) {
  return new Promise(async (resolve, reject) => {
    const { name, email, phone, role, pin, password } = data;

    const allowedRoles = ["admin", "manager", "server", "accountant"];

    if (!allowedRoles.includes(role)) {
      return reject(new Error("Invalid user role"));
    }

    const pinHash = pin ? await bcrypt.hash(pin, 10) : null;
    const passwordHash = password ? await bcrypt.hash(password, 10) : null;

    db.run(
      `
      INSERT INTO users (name, email, phone, role, pin_hash, password_hash)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [name, email || null, phone || null, role, pinHash, passwordHash],
      function (err) {
        if (err) {
          return reject(err);
        }

        resolve({
          id: this.lastID,
          name,
          email,
          phone,
          role,
        });
      }
    );
  });
}

function getAllUsers() {
  return new Promise((resolve, reject) => {
    db.all(
      `
      SELECT id, name, email, phone, role, is_active, created_at
      FROM users
      ORDER BY created_at DESC
      `,
      [],
      (err, users) => {
        if (err) return reject(err);
        resolve(users);
      }
    );
  });
}

function updateUser(id, data) {
  return new Promise((resolve, reject) => {
    const { name, email, phone, role, is_active } = data;

    db.run(
      `
      UPDATE users
      SET name = ?, email = ?, phone = ?, role = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [name, email || null, phone || null, role, is_active ? 1 : 0, id],
      function (err) {
        if (err) return reject(err);

        resolve({
          id,
          name,
          email,
          phone,
          role,
          is_active,
        });
      }
    );
  });
}

function changeUserPin(id, pin) {
  return new Promise(async (resolve, reject) => {
    const pinHash = await bcrypt.hash(pin, 10);

    db.run(
      `
      UPDATE users
      SET pin_hash = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [pinHash, id],
      function (err) {
        if (err) return reject(err);

        resolve({
          id,
          message: "PIN updated successfully",
        });
      }
    );
  });
}

module.exports = {
  createUser,
  getAllUsers,
  updateUser,
  changeUserPin,
};
