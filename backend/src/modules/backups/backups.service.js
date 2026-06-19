const fs = require("fs");
const path = require("path");

const dataDir =
  process.env.ZERAPOS_DATA_DIR || path.join(__dirname, "../../../");

const databasePath = path.join(dataDir, "zeraPOS.db");
const backupsDir = path.join(dataDir, "backups");
const { exec } = require("child_process");

function ensureBackupsFolder() {
  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }
}

function createBackup() {
  return new Promise((resolve, reject) => {
    try {
      ensureBackupsFolder();

      if (!fs.existsSync(databasePath)) {
        return reject(new Error("Database file not found"));
      }

      const now = new Date();
      const timestamp = now
        .toISOString()
        .replace(/:/g, "-")
        .replace(/\..+/, "");

      const fileName = `zeraPOS-backup-${timestamp}.db`;
      const backupPath = path.join(backupsDir, fileName);

      fs.copyFileSync(databasePath, backupPath);

      resolve({
        file_name: fileName,
        backup_path: backupPath,
        created_at: now.toISOString(),
      });
    } catch (error) {
      reject(error);
    }
  });
}

function listBackups() {
  return new Promise((resolve, reject) => {
    try {
      ensureBackupsFolder();

      const files = fs
        .readdirSync(backupsDir)
        .filter((file) => file.endsWith(".db"))
        .map((file) => {
          const filePath = path.join(backupsDir, file);
          const stats = fs.statSync(filePath);

          return {
            file_name: file,
            backup_path: filePath,
            size: stats.size,
            created_at: stats.birthtime,
          };
        })
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      resolve(files);
    } catch (error) {
      reject(error);
    }
  });
}
async function restoreBackup(fileName) {
  ensureBackupsFolder();

  const backupPath = path.join(backupsDir, fileName);

  if (!fs.existsSync(backupPath)) {
    throw new Error("Backup file not found");
  }

  const restorePoint = `pre-restore-${Date.now()}.db`;

  fs.copyFileSync(databasePath, path.join(backupsDir, restorePoint));

  fs.copyFileSync(backupPath, databasePath);

  return {
    restored_file: fileName,
    safety_backup: restorePoint,
  };
}
function createAutomaticDailyBackup() {
  return new Promise((resolve, reject) => {
    try {
      ensureBackupsFolder();

      if (!fs.existsSync(databasePath)) {
        return reject(new Error("Database file not found"));
      }

      const today = new Date().toISOString().slice(0, 10);
      const fileName = `auto-backup-${today}.db`;
      const backupPath = path.join(backupsDir, fileName);

      if (fs.existsSync(backupPath)) {
        return resolve({
          skipped: true,
          message: "Automatic backup already exists for today",
          file_name: fileName,
        });
      }

      fs.copyFileSync(databasePath, backupPath);

      resolve({
        skipped: false,
        message: "Automatic daily backup created",
        file_name: fileName,
        backup_path: backupPath,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      reject(error);
    }
  });
}
function openBackupsFolder() {
  return new Promise((resolve, reject) => {
    ensureBackupsFolder();

    let command;

    if (process.platform === "darwin") {
      command = `open "${backupsDir}"`;
    } else if (process.platform === "win32") {
      command = `start "" "${backupsDir}"`;
    } else {
      command = `xdg-open "${backupsDir}"`;
    }

    exec(command, (error) => {
      if (error) return reject(error);

      resolve({
        opened: true,
        backup_path: backupsDir,
      });
    });
  });
}
function cleanupOldAutomaticBackups(keepLatest = 30) {
  return new Promise((resolve, reject) => {
    try {
      ensureBackupsFolder();

      const automaticBackups = fs
        .readdirSync(backupsDir)
        .filter(
          (file) => file.startsWith("auto-backup-") && file.endsWith(".db")
        )
        .map((file) => {
          const filePath = path.join(backupsDir, file);
          const stats = fs.statSync(filePath);

          return {
            file,
            filePath,
            createdAt: stats.birthtime,
          };
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      const oldBackups = automaticBackups.slice(keepLatest);

      oldBackups.forEach((backup) => {
        fs.unlinkSync(backup.filePath);
      });

      resolve({
        deleted: oldBackups.length,
        kept: automaticBackups.length - oldBackups.length,
      });
    } catch (error) {
      reject(error);
    }
  });
}
module.exports = {
  createBackup,
  listBackups,
  restoreBackup,
  createAutomaticDailyBackup,
  cleanupOldAutomaticBackups,
  openBackupsFolder,
};
