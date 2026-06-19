const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../../database/db");

const JWT_SECRET =
  process.env.JWT_SECRET || "zera-pos-offline-desktop-secret-change-later";

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );
}

function loginWithPassword(email, password) {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT * FROM users WHERE email = ? AND is_active = 1",
      [email],
      async (err, user) => {
        if (err) return reject(err);

        if (!user) {
          return reject(new Error("Invalid email or password"));
        }

        const isMatch = await bcrypt.compare(
          password,
          user.password_hash || ""
        );

        if (!isMatch) {
          return reject(new Error("Invalid email or password"));
        }

        const token = generateToken(user);

        resolve({
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        });
      }
    );
  });
}

function loginWithPin(pin) {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM users", async (err, users) => {
      if (err) return reject(err);

      for (const user of users) {
        const isMatch = await bcrypt.compare(pin, user.pin_hash || "");

        if (isMatch) {
          if (Number(user.is_active) !== 1) {
            return reject(
              new Error(
                "This user account is inactive. Please contact the system admin."
              )
            );
          }

          const token = generateToken(user);

          return resolve({
            token,
            user: {
              id: user.id,
              name: user.name,
              role: user.role,
            },
          });
        }
      }

      reject(new Error("Invalid PIN"));
    });
  });
}

module.exports = {
  loginWithPassword,
  loginWithPin,
};
